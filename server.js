const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const mqtt = require('mqtt');

const app = express();

// ตั้งค่า CORS และ Header รองรับ ngrok และ Vercel เต็มรูปแบบ
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware สำหรับข้ามหน้า Warning Page ของ ngrok Free Tier
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// ตั้งค่าการเชื่อมต่อ MySQL (XAMPP ใช้ user 'root', ไม่มีรหัสผ่าน)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aquabot'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// ==========================================
// ตั้งค่าการเชื่อมต่อ EMQX Cloud MQTT
// ==========================================
const MQTT_HOST = 'ec1cc7c7.ala.us-east-1.emqxsl.com';
const MQTT_PORT = 8883;
const MQTT_TOPIC = 'aquabot/sensors';

const mqttOptions = {
    port: MQTT_PORT,
    username: 'aquabot_client',
    password: '0820262471Kk',
    protocol: 'mqtts'
};

const mqttClient = mqtt.connect(`mqtts://${MQTT_HOST}`, mqttOptions);

mqttClient.on('connect', () => {
    console.log('Connected to EMQX Cloud MQTT Broker successfully!');
    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (!err) {
            console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
        } else {
            console.error('MQTT subscription error:', err);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    console.log(`Received MQTT message from [${topic}]: ${message.toString()}`);
    
    try {
        const data = JSON.parse(message.toString());
        const temp = data.temp !== undefined ? data.temp : data.temperature;
        const ph = data.ph;
        const tds = data.TDS !== undefined ? data.TDS : data.tds;

        if (ph === undefined || temp === undefined || tds === undefined) {
            console.error('Invalid sensor data format received via MQTT:', data);
            return;
        }

        const query = 'INSERT INTO sensor_data (temp, ph, TDS) VALUES (?, ?, ?)';
        db.query(query, [temp, ph, tds], (err, result) => {
            if (err) {
                console.error('Database insert error from MQTT data:', err.message);
                return;
            }
            console.log('Sensor data from cloud saved to MySQL successfully, ID:', result.insertId);
        });

    } catch (e) {
        console.error('JSON parse error from MQTT message:', e);
    }
});

mqttClient.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
});

// API สำหรับดึงข้อมูล sensor_data ไปแสดงที่หน้าเว็บ Dashboard
app.get('/api/sensor_data', (req, res) => {
    const period = req.query.period || 'day';
    let sql = '';
    
    if (period === 'week') {
        sql = `
            SELECT 
                MIN(date) AS date, 
                AVG(temp) AS temp, 
                AVG(ph) AS ph, 
                AVG(tds) AS TDS 
            FROM sensor_data 
            GROUP BY YEAR(date), WEEK(date, 1) 
            ORDER BY date ASC
        `;
    } else if (period === 'month') {
        sql = `
            SELECT 
                DATE_FORMAT(date, '%Y-%m') AS month_group,
                MIN(date) AS date, 
                AVG(temp) AS temp, 
                AVG(ph) AS ph, 
                AVG(tds) AS TDS 
            FROM sensor_data 
            GROUP BY month_group 
            ORDER BY date ASC
        `;
    } else {
        sql = `SELECT * FROM sensor_data ORDER BY date ASC`;
    }

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Database Query Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

// API ให้หน้าเว็บกด Start
app.post('/api/esp32/start', (req, res) => {
    res.json({ success: true, status: 'connected' });
});

// API ให้หน้าเว็บกด Stop
app.post('/api/esp32/stop', (req, res) => {
    res.json({ success: true, status: 'connected_stop' });
});

// API เช็คสถานะ (บังคับให้คืนค่า connected เสมอ เพื่อให้ดึงข้อมูลจาก DB ได้ทันที)
app.get('/api/esp32/status', (req, res) => {
    return res.json({ status: 'connected' });
});

// API ล้างฐานข้อมูล
app.delete('/api/clear-database', (req, res) => {
  const checkSql = "SELECT COUNT(*) AS count FROM sensor_data";

  db.query(checkSql, (err, results) => {
    if (err) {
      console.error("Error checking database:", err);
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล" });
    }

    const rowCount = results[0].count;
    if (rowCount === 0) {
      return res.json({ success: false, empty: true, message: "ไม่มีข้อมูลในฐานข้อมูล" });
    }

    const clearSql = "TRUNCATE TABLE sensor_data";
    db.query(clearSql, (err, result) => {
      if (err) {
        console.error("Error clearing database:", err);
        return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการล้างข้อมูล" });
      }
      res.json({ success: true, message: "ล้างข้อมูลสำเร็จ" });
    });
  });
});

app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port http://172.20.10.14:${PORT}`);
});