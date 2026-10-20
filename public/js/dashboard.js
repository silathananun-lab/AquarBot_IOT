async function Check_connect(){
    try{
        const response_check = await fetch(`${API_BASE_URL}/api/esp32/status`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
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