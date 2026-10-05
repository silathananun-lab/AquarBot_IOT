// ฟังก์ชันสำหรับอัปเดตค่า pH ลงในหน้า Dashboard
function updatePHValue(value,divice) {
    const phElement = document.getElementById("PH_value");
    const tempElement = document.getElementById("Temp_value");
    const tdsElement = document.getElementById("TDS_value");
    if (divice == "PH") {
        // ตรวจสอบว่ามีค่าส่งมาไหม ถ้ามีให้แสดงผล (จัดรูปทศนิยม 2 ตำแหน่งได้ตามต้องการ)
        phElement.textContent = value !== undefined && value !== null ? value : "--";
    }
    else if (divice == "TEMP") {
        tempElement.textContent = value !== undefined && value !== null ? value : "--";
    }
    else if (divice == "TDS") {
        tdsElement.textContent = value !== undefined && value !== null ? value : "--";
    }
}
function circle_card(value,device){
    const deg = (value / 100) * 360;
    const circle = document.getElementById(device);
    let color = "#0084ff";
    circle.style.background =`conic-gradient(${color} ${deg}deg, #eee ${deg}deg)`;

}
// ฟังก์ชันดึงข้อมูลจาก Server ที่คุณสร้างขึ้น
async function fetchSensorData() {
    try {
        // เรียกใช้งาน API ที่พอร์ต 3000 ตามโค้ด Express ของคุณ
        const response = await fetch('http://localhost:3000/api/sensor_data');
        
        if (!response.ok) {
            throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }
        
        const data = await response.json();
        
        // เนื่องจาก API ส่งมาเป็น Array ทั้งหมด (SELECT * FROM sensor_data)
        // เราจะเลือกข้อมูลตัวล่าสุด (แถวสุดท้าย หรือเรียงตาม id / DATE ล่าสุด) มาแสดงผล
        if (Array.isArray(data) && data.length > 0) {
            // สมมติว่าข้อมูลใหม่สุดอยู่ท้ายสุดของ Array หรือใช้ตัวแรกสุดถ้ามีการเรียงจากใหม่ไปเก่า
            // ในที่นี้ขอเลือกตัวสุดท้าย (Latest Record)
            const latestData = data[data.length - 1]; 
            
            // นำค่า ph จากฐานข้อมูลมาแสดงผล
            updatePHValue(latestData.ph + "%","PH");
            circle_card(latestData.ph,"circle_PH");
            // นำค่า ph จากฐานข้อมูลมาแสดงผล
            updatePHValue(latestData.temp + " °C","TEMP");
            circle_card(latestData.temp,"circle_temp");

            updatePHValue(latestData.TDS + "%","TDS");
            circle_card(latestData.TDS,"circle_TDS");
        }

    } catch (error) {
        console.error("Error fetching sensor data:", error);
    }
}

// เริ่มต้นทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
    fetchSensorData();
    setInterval(fetchSensorData, 3000);
});