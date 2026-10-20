// กำหนด URL ของ ngrok สำหรับเชื่อมต่อระหว่าง Vercel กับเครื่องที่บ้าน
// 🔴 อย่าลืมเปลี่ยนลิงก์นี้ทุกครั้งเมื่อคุณเปิดโปรแกรม ngrok ใหม่
const API_BASE_URL = 'https://duo-feast-machinist.ngrok-free.dev'; 

export let color_ph ={line:"#4a4a4a",
                        gradient_1: "rgba(53, 53, 53, 0.25)",
                        gradient_2: "rgba(53, 53, 53, 0"
                     };
export let color_temp ={line:"#4a4a4a",
                        gradient_1: "rgba(53, 53, 53, 0.25)",
                        gradient_2: "rgba(53, 53, 53, 0)"
                     };
export let color_tds ={line:"#4a4a4a",
                        gradient_1: "rgba(53, 53, 53, 0.25)",
                        gradient_2: "rgba(53, 53, 53, 0)"
                     };
let stetusesp = "ESP32 Disconnected error";
let con = false ;
const btnStart = document.querySelector('.btn-start');
const btnStop = document.querySelector('.btn-stop');
const indicator = document.getElementById('espStatusIndicator'); 
const statusText = document.getElementById('espStatusText');   

const phIcon = document.getElementById('PHicon');
const statusPH = document.getElementById('statusPH-card');
let count = 0 ;
let counttemp = 0 ;
let countTDS = 0 ;

// ตัวแปรสำหรับจัดการคิวแจ้งเตือน
let alertQueue = [];
let isAlertActive = false;

export function updatecolor(value,divice){
    if(divice == "PH"){
        if(value >= 8){
            color_ph = {line:"#3b82f6",
                        gradient_1: "rgba(59, 130, 246, 0.25)",
                        gradient_2: "rgba(59, 130, 246, 0)"
                     };
                   
            statusPH.textContent = "Base";
            addAlertLog("PH", "normal",value);
            if(value >= 11 ){
            if(count == 0){
                showCustomAlertPH("ค่า PH มีความเป็นด่างรุนแรง");
                count++;
            }
            color_ph = {line:"#ef4444",
                        gradient_1:"rgba(239, 68, 68, 0.25)",
                        gradient_2:"rgba(239, 68, 68, 0)"
                        };
            addAlertLog("PH", "danger",value);
            }  
            } 
        else if(value <= 7){
            color_ph = {line:"#c144ef",
                        gradient_1:"rgba(193, 68, 239, 0.5)",
                        gradient_2:"rgba(193, 68, 239, 0)"
                        }; 
            statusPH.textContent = "Acid";
            addAlertLog("PH", "normal",value);
            if(value <= 3 ){
                if(count == 0){
                    showCustomAlertPH("ค่า PH มีความเป็นกรดรุนแรง");
                    count++;
                }
                color_ph = {line:"#ef4444",
                        gradient_1:"rgba(239, 68, 68, 0.25)",
                        gradient_2:"rgba(239, 68, 68, 0)"
                        };
                addAlertLog("PH", "danger",value);
            }  
        }
        else if(value >= 7 && value < 8){
            color_ph = {line:"#10b981",
                        gradient_1:"rgba(16, 185, 129, 0.25)",
                        gradient_2:"rgba(16, 185, 129, 0)"
                        }; 
            statusPH.textContent = "NORMAL";
            addAlertLog("PH", "normal",value);
            count = 0;
        }
         
        phIcon.style.color = color_ph.line;
        statusPH.style.color = color_ph.line;
        statusPH.style.backgroundColor = color_ph.gradient_1;
        
        return color_ph;
    }

    if(divice == "TEMP"){
        const tempIcon = document.getElementById('TEMPicon');
        const statustemp = document.getElementById('statusTemp-card');
        if(value < 35){
            color_temp = {line:"#10b981",
                        gradient_1: "rgba(16, 185, 129, 0.25)",
                        gradient_2: "rgba(16, 185, 129, 0)"
                     };
            statustemp.textContent = "NORMAL";
            counttemp = 0 ;
            addAlertLog("TEMP", "normal",value);    
            } 
        else if(value > 45){
            color_temp = {line:"#ef4444",
                        gradient_1:"rgba(239, 68, 68, 0.25)",
                        gradient_2:"rgba(239, 68, 68, 0)"
                        }; 
            statustemp.textContent = "TOO HIGH";
            if(counttemp == 1){
                showCustomAlerttemp("อุณหภูมิสูงเกินไป TDS sensor และ PH sensor จะเสียหาย");  
                counttemp--;
            }
            addAlertLog("TEMP", "danger",value);
        }
        else if(value > 35 && value < 45 ){
            color_temp = {line:"#f59e0b",
                        gradient_1:"rgba(245, 158, 11, 0.25)",
                        gradient_2:"rgba(245, 158, 11, 0)"
                        }; 
            statustemp.textContent = "HIGH";
            if(counttemp == 0){
                showCustomAlerttemp("อุณหภูมิสูงอาจทำให้ TDS sensor และ PH sensor เสียหายได้");
                counttemp++;
            }
            addAlertLog("TEMP", "warning",value);  
        }
         
        tempIcon.style.color = color_temp.line;
        statustemp.style.color = color_temp.line;
        statustemp.style.backgroundColor = color_temp.gradient_1;

        return color_temp;
    }
    if(divice == "TDS"){
        const tdsIcon = document.getElementById('TDSicon');
        const statusTDS = document.getElementById('statusTDS-card');
        if(value > 300 && value < 600){
            color_tds = {line:"#10b981",
                        gradient_1: "rgba(16, 185, 129, 0.25)",
                        gradient_2: "rgba(16, 185, 129, 0)"
                     };
                     statusTDS.textContent = "NORMAL";
                     addAlertLog("TDS", "normal",value);  
                     countTDS = 0;
            } 
        else if(value > 600){
            color_tds = {line:"#f59e0b",
                        gradient_1:"rgba(245, 158, 11, 0.25)",
                        gradient_2:"rgba(245, 158, 11, 0)"
                        }; 
                        statusTDS.textContent = "HIGH";
                       addAlertLog("TDS", "normal",value);  
                if(value > 1000){
                    if(countTDS == 0){
                        showCustomAlertTDS("ปริมาณสารที่ละลายอยู่ในน้ำสูงมาก");
                        countTDS++;
                       }
                    addAlertLog("TDS", "danger",value);  
                    color_tds = {line:"#ef4444",
                        gradient_1:"rgba(239, 68, 68, 0.25)",
                        gradient_2:"rgba(239, 68, 68, 0)"
                        }; 
                }
        }
        else if(value < 300){
            color_tds = {line:"#ef4444",
                        gradient_1:"rgba(239, 68, 68, 0.25)",
                        gradient_2:"rgba(239, 68, 68, 0)"
                        }; 
                        statusTDS.textContent = "LOW";
                    if(countTDS == 0){
                        showCustomAlertTDS("ปริมาณสารที่ละลายอยู่ในน้ำต่ำ");
                        countTDS++;
                       }
                     addAlertLog("TDS", "danger",value); 
        }

        tdsIcon.style.color = color_tds.line;
        statusTDS.style.color = color_tds.line;
        statusTDS.style.backgroundColor = color_tds.gradient_1;

        return color_tds;
    }
}

async function addAlertLog(sensorName, statusType,value) {
    const tbody = document.getElementById('notificationLogBody');
    if (!tbody) return;

    const existingRows = tbody.getElementsByTagName('tr');
    for (let i = 0; i < existingRows.length; i++) {
        const rowSensorName = existingRows[i].querySelector('td strong');
        if (rowSensorName && rowSensorName.textContent === sensorName) {
            tbody.removeChild(existingRows[i]);
            break; 
        }
    }
    const formattedValue = Number(value).toFixed(2);
    let unit = "";
    if(sensorName == "TEMP"){
        unit = "°C";
    }
    else if (sensorName == "TDS"){
        unit = "ppm";
    }
     let Rvalue = formattedValue + unit;
     
    if (statusType === 'normal' || statusType === 'NORMAL') {
        return;
    }

    const row = document.createElement('tr');
    const badgeClass = (statusType === 'danger') ? 'badge danger' : 'badge warning';
    const statusTextContent = (statusType === 'danger') ? 'danger' : 'warning';
    
    row.innerHTML = `
        <td><strong>${sensorName}</strong></td>
        <td>${Rvalue}</td>
        <td><span class="${badgeClass}">${statusTextContent}</span></td>
    `;
    
    tbody.prepend(row);
    
    if (tbody.rows.length > 10) {
        tbody.deleteRow(tbody.rows.length - 1);
    }
}

function updateValue(value,divice) {
    const phElement = document.getElementById("PH_value");
    const tempElement = document.getElementById("Temp_value");
    const tdsElement = document.getElementById("TDS_value");
    if (divice == "PH" && phElement) {
        phElement.textContent = value !== undefined && value !== null ? value + "PH" : "--";
    }
    else if (divice == "TEMP" && tempElement) {
        tempElement.textContent = value !== undefined && value !== null ? value + " °C" : "--";
    }
    else if (divice == "TDS" && tdsElement) {
        tdsElement.textContent = value !== undefined && value !== null ? value  : "--";
    }
}

function circle_cardph(value,device){
    const circle = document.getElementById(device);
    if (!circle) return;
    const deg = (value / 14) * 360;
    circle.style.background =`conic-gradient(${color_ph.line} ${deg}deg, #eee ${deg}deg)`;
}

function circle_cardtemp(value,device){
    const circle = document.getElementById(device);
    if (!circle) return;
    const deg = (value / 180) * 360;
    circle.style.background =`conic-gradient(${color_temp.line} ${deg}deg, #eee ${deg}deg)`;
}

function circle_cardTDS(value,device){
    const circle = document.getElementById(device);
    if (!circle) return;
    const deg = (value / 1300) * 360;
    circle.style.background =`conic-gradient(${color_tds.line} ${deg}deg, #eee ${deg}deg)`;
}

async function Check_connect(){
    try{
        const response_check = await fetch(`${API_BASE_URL}/api/esp32/status`);
        const data_check =  await response_check.json();
        
        if (data_check.status === "connected") {
            if(indicator) indicator.className = "status-dot connected";
            if(statusText) statusText.textContent = "ESP32 Connected";
            stetusesp = "ESP32 Connected";
        } else if (data_check.status === "connected_stop") {
            if(indicator) indicator.className = "status-dot connected_stop"; 
            if(statusText) statusText.textContent = "ESP32 Connected";
            stetusesp = "ESP32 Stopped";
        } else {
            if(indicator) indicator.className = "status-dot disconnected";
            if(statusText) statusText.textContent = "ESP32 Disconnected";
            stetusesp = "ESP32 Disconnected error";
        }
    }
    catch (error) {
        if(indicator) indicator.className = "status-dot disconnected"; 
        if(statusText) statusText.textContent = "ESP32 Disconnected";
        stetusesp="ESP32 Disconnected error";
    }
}

function updateUIState(status) {
    if (status === 'connected') {
        if(btnStart) btnStart.classList.add('active');
        if(btnStop) btnStop.classList.remove('active');
    } else {
        if(btnStop) btnStop.classList.add('active');
        if(btnStart) btnStart.classList.remove('active');
    }
}

function processNextAlert() {
    if (isAlertActive || alertQueue.length === 0) return;
    
    isAlertActive = true;
    const current = alertQueue.shift(); 
    
    if (current.type === 'general') {
        document.getElementById('customAlertMessage').innerText = current.message;
        document.getElementById('customAlertModal').style.display = 'flex';
    } else if (current.type === 'PH') {
        document.getElementById('customAlertMessagePH').innerText = current.message;
        document.getElementById('customAlertModalPH').style.display = 'flex';
    } else if (current.type === 'temp') {
        document.getElementById('customAlertMessagetemp').innerText = current.message;
        document.getElementById('customAlertModaltemp').style.display = 'flex';
    } else if (current.type === 'TDS') {
        document.getElementById('customAlertMessageTDS').innerText = current.message;
        document.getElementById('customAlertModalTDS').style.display = 'flex';
    }
    else if (current.type === 'clear') {
        document.getElementById('customAlertMessageclear_A').innerText = current.message;
        document.getElementById('customAlertModalclear_A').style.display = 'flex';
    }   
}

function showCustomAlert(message) {
    alertQueue.push({ type: 'general', message });
    processNextAlert();
}

function openClearModal() {
  document.getElementById('customAlertModalclear').style.display = 'flex';
}
window.openClearModal = openClearModal;

function closeClearModal() {
  document.getElementById('customAlertModalclear').style.display = 'none';
}
window.closeClearModal = closeClearModal;

function showCustomAlertPH(message) {
    alertQueue.push({ type: 'PH', message });
    processNextAlert();
}
function showCustomAlertclear_A(message) {
    alertQueue.push({ type: 'clear', message });
    processNextAlert();
}
function showCustomAlerttemp(message) {
    alertQueue.push({ type: 'temp', message });
    processNextAlert();
}
function showCustomAlertTDS(message) {
    alertQueue.push({ type: 'TDS', message });
    processNextAlert();
}

function closeCustomAlert() {
    const modal = document.getElementById('customAlertModal');
    const modalPH = document.getElementById('customAlertModalPH');
    const modaltemp = document.getElementById('customAlertModaltemp');
    const modalTDS = document.getElementById('customAlertModalTDS');
    const modalclear_A = document.getElementById('customAlertModalclear_A');

    if (modal) modal.style.display = 'none';
    if (modalPH) modalPH.style.display = 'none';
    if (modaltemp) modaltemp.style.display = 'none';
    if (modalTDS) modalTDS.style.display = 'none';
    if (modalclear_A) modalclear_A.style.display = 'none';
    
    isAlertActive = false; 
    
    setTimeout(() => {
        processNextAlert();
    }, 200);
}
window.closeCustomAlert = closeCustomAlert;

async function startESP() {
    try {
        if (stetusesp === "ESP32 Connected" || stetusesp === "ESP32 Stopped") {
            const response = await fetch(`${API_BASE_URL}/api/esp32/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success) {
                updateUIState(data.status);
            }
        } else if (stetusesp === "ESP32 Disconnected error") {
            showCustomAlert("โปรดเชื่อมต่อ ESP32 ก่อน!!");
        }
    } catch (error) {
        console.error('Error starting ESP32:', error);
    }
}
window.startESP = startESP;

async function stopESP() {
    try {
        if (stetusesp === "ESP32 Connected") {
            const response = await fetch(`${API_BASE_URL}/api/esp32/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success) {
                updateUIState(data.status);
            }
        } else if (stetusesp === "ESP32 Disconnected error") {
            showCustomAlert("โปรดเชื่อมต่อ ESP32 ก่อน!!");
        }
    } catch (error) {
        console.error('Error stopping ESP32:', error);
    }
}
window.stopESP = stopESP;

function executeClearDatabase() {
  fetch(`${API_BASE_URL}/api/clear-database`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => response.json())
  .then(data => {
    closeClearModal(); 
    if (data.success) {
        location.reload(); 
    } else if (data.empty) {
      showCustomAlertclear_A("ไม่มีข้อมูลในฐานข้อมูล");
    } else {
      showCustomAlertclear_A("เกิดข้อผิดพลาด: " + data.message)
    }
  })
  .catch(error => {
    closeClearModal();
    console.error('Error:', error);
    showCustomAlertclear_A("ไม่สามารถเชื่อมต่อกับ Server ได้");
  });
}
window.executeClearDatabase = executeClearDatabase;

function updateStatistics(data,sensorType) {
    let unit = "";
    let minElement, maxElement, avgElement;

    if (sensorType === "PH") {
        minElement = document.getElementById("minValuePH");
        maxElement = document.getElementById("maxValuePH");
        avgElement = document.getElementById("avgValuePH");
    }
    else if (sensorType === "temp") {
        unit = " °C"; 
        minElement = document.getElementById("minValuetemp");
        maxElement = document.getElementById("maxValuetemp");
        avgElement = document.getElementById("avgValuetemp");
    }
    else if (sensorType === "TDS") {
        unit = " ppm"; 
        minElement = document.getElementById("minValueTDS");
        maxElement = document.getElementById("maxValueTDS");
        avgElement = document.getElementById("avgValueTDS");
    }

    if (!minElement || !maxElement || !avgElement) return;

    if (!data || data.length === 0) {
        minElement.textContent = "--" + unit;
        maxElement.textContent = "--" + unit;
        avgElement.textContent = "--" + unit;
        return;
    }

    const values = data.map(item => Number((sensorType === "temp" ? item.temp : (sensorType === "PH" ? item.PH : item.TDS)))).filter(value => !isNaN(value));
    
    if (values.length === 0) {
        minElement.textContent = "--" + unit;
        maxElement.textContent = "--" + unit;
        avgElement.textContent = "--" + unit;
        return;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    
    minElement.textContent = min.toFixed(2) + unit;
    maxElement.textContent = max.toFixed(2) + unit;
    avgElement.textContent = avg.toFixed(2) + unit;
}

async function fetchSensorData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/sensor_data`);

        if (!response.ok) {
            throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
            let valude_ph = data.map(item => parseFloat(item.ph)).filter(value => !isNaN(value));
            if (valude_ph.length > 0) {
                let avg_ph = valude_ph.reduce((sum, value) => sum + value, 0) / valude_ph.length;
                updatecolor(avg_ph, "PH");
            }

            let valude_tds = data.map(item => parseFloat(item.TDS)).filter(value => !isNaN(value));
            if (valude_tds.length > 0) {
                let avg_tds = valude_tds.reduce((sum, value) => sum + value, 0) / valude_tds.length;
                updatecolor(avg_tds, "TDS");
            }

            const latestData = data[data.length - 1]; 

            if (latestData) {
                updatecolor(latestData.temp, "TEMP");
                
                updateValue(latestData.ph, "PH");
                circle_cardph(latestData.ph, "circle_PH");
                
                updateValue(latestData.temp, "TEMP");
                circle_cardtemp(latestData.temp, "circle_temp");

                updateValue(latestData.TDS, "TDS");
                circle_cardTDS(latestData.TDS, "circle_TDS");
            }

            Check_connect();

            const data_temp = data.map(item => ({ temp: parseFloat(item.temp) }));
            const data_PH = data.map(item => ({ PH: parseFloat(item.ph) }));
            const data_TDS = data.map(item => ({ TDS: parseFloat(item.TDS) }));
            
            updateStatistics(data_PH, "PH");
            updateStatistics(data_temp, "temp");
            updateStatistics(data_TDS, "TDS");
        }
    } catch (error) {
        console.error("Error fetching sensor data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSensorData();
    setInterval(fetchSensorData, 1000);
});