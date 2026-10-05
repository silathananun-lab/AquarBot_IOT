const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// ตั้งค่าการเชื่อมต่อ MySQL (XAMPP ใช้ user 'root', ไม่มีรหัสผ่าน)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aquabot' // เปลี่ยนเป็นชื่อ Database ของคุณถ้าตั้งชื่ออื่น
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL Database.');
});


// API สำหรับรับข้อมูลเซนเซอร์จาก ESP32 (POST Method)
app.post('/api/sensor_data', (req, res) => {
    // ดึงค่าที่ ESP32 ส่งมาในรูปแบบ JSON (ปรับชื่อตัวแปรให้ตรงกับโค้ดฝั่ง ESP32)
    const { temp, ph, TDS } = req.body;

    // ตรวจสอบเบื้องต้นว่ามีข้อมูลส่งมาครบถ้วนไหม
    if (ph === undefined || temp === undefined || TDS === undefined) {
        return res.status(400).json({ error: 'Missing required sensor data (temp, ph, TDS)' });
    }

    // คำสั่ง SQL สำหรับบันทึกข้อมูลลงตาราง sensor_data
    // (หมายเหตุ: ตรวจสอบชื่อคอลัมน์ในฐานข้อมูล MySQL ของคุณว่าตรงกับ ph, temp, TDS หรือไม่)
    const query = 'INSERT INTO sensor_data (ph, temp, TDS) VALUES (?, ?, ?)';
    
    db.query(query, [temp, ph, TDS], (err, result) => {
        if (err) {
            console.error('Database insert error: ' + err.message);
            return res.status(500).json({ error: err.message });
        }
        
        console.log('New sensor data saved:', { temp, ph, TDS });
        res.status(201).json({ 
            message: 'Data saved successfully', 
            insertedId: result.insertId 
        });
    });
});


// ตัวอย่าง API สำหรับดึงข้อมูล sensor_data
app.get('/api/sensor_data', (req, res) => {
    db.query('SELECT * FROM sensor_data', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// รันเซิร์ฟเวอร์ที่ Port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});