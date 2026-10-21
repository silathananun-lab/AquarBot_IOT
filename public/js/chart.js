import { color_ph, color_temp, color_tds } from './dashboard.js';

// กำหนด URL ของ ngrok สำหรับเชื่อมต่อระหว่าง Vercel กับเครื่องที่บ้าน
// 🔴 อย่าลืมเปลี่ยนลิงก์นี้ให้ตรงกับหน้าจอ ngrok ทุกครั้งเมื่อคุณเปิดโปรแกรม ngrok ใหม่
const API_BASE_URL = 'https://duo-feast-machinist.ngrok-free.dev'; 

// ตัวแปรเก็บค่าแท็บที่กำลังเลือกอยู่ (ค่าเริ่มต้นเป็น 'ph')
let currentTab = 'ph';

// Current 
function updateCurrent(data, current, sensorType) {
    const current_temp = document.getElementById(current);
    if (!current_temp) {
        console.warn(`ไม่พบ Element ID: ${current} ในหน้า HTML`);
        return;
    }
    if (!data || data.length === 0) {
        current_temp.textContent = "--";
        return;
    }
    
    const latest = data[data.length - 1];
    if (sensorType === "PH") {
        const value = Number(latest.PH);
        current_temp.textContent = !isNaN(value) ? value.toFixed(2) + "PH" : "--";
    }
    else if (sensorType === "temp") {
        const value = Number(latest.temp);
        current_temp.textContent = !isNaN(value) ? value.toFixed(2) + "°C" : "--";
    }
    else if (sensorType === "TDS") {
        const value = Number(latest.TDS);
        current_temp.textContent = !isNaN(value) ? value.toFixed(2) + "ppm" : "--";
    }
}

// Get Date
function getDate(item, period) {
    if (period === "day") {
        return new Date(item.date);
    }
    if (period === "week") {
        return new Date(item.date);
    }
    if (period === "month") {
        const m = item.month_group || item.date;
        if (typeof m === 'string' && m.length === 7) {
            return new Date(m + "-01T00:00:00");
        }
        return new Date(m);
    }
}

// Draw Chart
function drawChart(data, period, canvastype, unit) {
    const canvas = document.getElementById(canvastype);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const unit_select = (unit === "temp" ? "°C" : unit === "PH" || unit === "pH" ? "pH" : (unit === "TDS" ? "ppm" : "--"));
    let color_line = (unit === "temp" ? color_temp.line : unit === "PH" || unit === "pH" ? color_ph.line : (unit === "TDS" ? color_tds.line : "#14a8df"));
    let color_gradient_1 = (unit === "temp" ? color_temp.gradient_1 : unit === "PH" || unit === "pH" ? color_ph.gradient_1 : (unit === "TDS" ? color_tds.gradient_1 : "rgba(20,168,223,0.25)"));
    let color_gradient_2 = (unit === "temp" ? color_temp.gradient_2 : unit === "PH" || unit === "pH" ? color_ph.gradient_2 : (unit === "TDS" ? color_tds.gradient_2 : "rgba(20,168,223,0)"));
    
    // Canvas size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // No data
    if (!data || data.length === 0) {
        ctx.fillStyle = "#8c96a7";
        ctx.font = "13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data", width / 2, height / 2);
        return;
    }

    const points = data.map(item => ({
        date: typeof getDate === 'function' ? getDate(item, period) : new Date(item.date),
        value: Number(unit === "temp" ? item.temp : (unit === "PH" || unit === "pH" ? item.PH : (unit === "TDS" ? item.TDS : NaN)))
    }));
    
    const values = points.map(point => point.value).filter(v => !isNaN(v));

    if (values.length === 0) {
        ctx.fillStyle = "#8c96a7";
        ctx.font = "13px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data", width / 2, height / 2);
        return;
    }

    // Graph area
    const left = 48;
    const right = 18;
    const top = 35;
    const bottom = 48;
    const graphWidth = width - left - right;
    const graphHeight = height - top - bottom;

    // Y range
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
        min -= 5;
        max += 5;
    } else {
        min -= 5;
        max += 5;
    }
    const range = max - min;

    // GRID
    for (let i = 0; i <= 5; i++) {
        const y = top + (graphHeight * i / 5);
        const value = max - (range * i / 5);
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.strokeStyle = "#edf0f4";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#8c96a7";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";
        ctx.fillText(value.toFixed(0) + unit_select, left - 7, y + 3);
    }

    // POINT POSITION
    points.forEach((point, index) => {
        if (points.length === 1) {
            point.x = left + graphWidth / 2;
        } else {
            point.x = left + (index / (points.length - 1)) * graphWidth;
        }
        point.y = top + ((max - point.value) / range) * graphHeight;
    });

    // GRADIENT
    const gradient = ctx.createLinearGradient(0, top, 0, height - bottom);
    gradient.addColorStop(0, color_gradient_1);
    gradient.addColorStop(1, color_gradient_2);
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - bottom);
    points.forEach(point => { ctx.lineTo(point.x, point.y); });
    ctx.lineTo(points[points.length - 1].x, height - bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // LINE
    ctx.beginPath();
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    ctx.strokeStyle = color_line;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // POINT
    if (period !== "day") {
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.strokeStyle = color_line;
            ctx.lineWidth = 3;
            ctx.stroke();
        });
    }

    // VALUE
    if (period !== "day") {
        points.forEach((point) => {
            ctx.fillStyle = "#183b73";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                point.value.toFixed(2) + unit_select,
                point.x,
                point.y - 10
            );
        });
    }

    // X AXIS
    points.forEach((point, index) => {
        const step = Math.max(1, Math.ceil(points.length / 6));
        if (index % step !== 0 && index !== points.length - 1) {
            return;
        }
        if (isNaN(point.date.getTime())) {
            return;
        }
        let label;
        if (period === "day") {
            label = point.date.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit"
            });
        }
        else if (period === "week") {
            label = point.date.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short"
            });
        }
        else {
            label = point.date.toLocaleDateString("th-TH", {
                month: "short"
            });
        }
        ctx.fillStyle = "#8c96a7";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, point.x, height - 12);
    });
}

function switchTab(tabName) {
    currentTab = tabName; 

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    loadchart();
}
window.switchTab = switchTab;

async function loadchart() {
    const periodSelect = document.getElementById('periodSelect'); 
    let period = periodSelect ? periodSelect.value : 'day';
    
    try {
        // 🛠️ เพิ่ม Header ngrok-skip-browser-warning ตรงนี้เพื่อให้ดึงข้อมูลผ่าน ngrok ได้สำเร็จ
        const response = await fetch(`${API_BASE_URL}/api/sensor_data?period=${period}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            const curEl = document.getElementById("current-sensor");
            if (curEl) curEl.textContent = "--";
            drawChart([], period, "Chart", currentTab === 'ph' ? 'PH' : (currentTab === 'temp' ? 'temp' : 'TDS'));
            return;
        }

        const temp_Data = data.map(item => ({
            temp: parseFloat(item.temp),
            date: item.date              
        }));
        const PH_Data = data.map(item => ({
            PH: parseFloat(item.ph), 
            date: item.date              
        }));
        const TDS_Data = data.map(item => ({
            TDS: parseFloat(item.TDS), 
            date: item.date              
        }));
        
        let  TEXT = document.getElementById("Htext");
        let activeData, unit;
        if (currentTab === 'ph') {
            activeData = PH_Data;
            unit = "PH";
            TEXT.textContent = "PH"
        } else if (currentTab === 'TEMP') {
            activeData = temp_Data;
            unit = "temp";
            TEXT.textContent = "TEMP"
        } else if (currentTab === 'tds') {
            activeData = TDS_Data;
            unit = "TDS";
            TEXT.textContent = "TDS"
        }

        updateCurrent(activeData, "current-sensor", unit);
        drawChart(activeData, period, "Chart", unit);

    } catch (error) {
        console.error("Load data error:", error);
    }
}

// เริ่มต้นทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
    loadchart();
    setInterval(loadchart, 1000);
});