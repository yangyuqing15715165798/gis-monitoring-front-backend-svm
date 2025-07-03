from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# 配置CORS，允许前端访问
origins = [
    "http://localhost",
    "http://localhost:8000", # 如果你用Python的http.server
    "http://127.0.0.1:8000",
    "file://", # 允许直接通过文件协议打开的HTML文件访问 (开发时可能需要)
    "https://yangyuqing15715165798.github.io" # 你的GitHub Pages域名
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

def load_device_data():
    """从data.json加载设备数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# 模拟数据更新（为了保持前端的动态效果）
def update_simulated_data(devices_list):
    """模拟更新设备数据，使其动态变化"""
    for device in devices_list:
        # 模拟最新局放值波动
        device['latestPd'] += (os.urandom(1)[0] / 255 - 0.5) * 5 # -2.5 到 +2.5 的随机波动
        if device['latestPd'] < 0: device['latestPd'] = 0 # 确保不为负

        # 模拟辅助参数波动
        device['temperature'] += (os.urandom(1)[0] / 255 - 0.5) * 0.2 # 小幅波动
        device['humidity'] += (os.urandom(1)[0] / 255 - 0.5) * 0.5 # 小幅波动
        device['sf6Pressure'] += (os.urandom(1)[0] / 255 - 0.5) * 0.01 # 小幅波动

        # 模拟局放趋势数据滚动更新
        device['pdTrend'].pop(0) # 移除最旧的数据点
        new_pd_value = 0
        if device['status'] == '正常':
            new_pd_value = int(os.urandom(1)[0] / 255 * 30) + 10
        elif device['status'] == '异常':
            new_pd_value = device['pdTrend'][-1] + (os.urandom(1)[0] / 255 - 0.3) * 10 # 略微上升趋势
            if new_pd_value > 200: new_pd_value = 200
            if new_pd_value < 50: new_pd_value = 50
        device['pdTrend'].append(new_pd_value)

        # 模拟告警触发 (简单示例，可根据实际需求复杂化)
        if device['status'] == '正常' and device['latestPd'] > 50 and (os.urandom(1)[0] / 255) < 0.05: # 5%概率触发
            device['status'] = '异常'
            import datetime
            now = datetime.datetime.now()
            alert_time = now.strftime("%Y-%m-%d %H:%M:%S")
            device['alerts'].insert(0, {"time": alert_time, "type": "局放超限", "level": "高", "description": "局放幅值持续升高，请关注"})
            device['diagnosis'] = {"text": "局放幅值持续升高，可能存在潜在缺陷，建议进一步分析。", "risk": "中"}
            device['prpdType'] = 'void'
            device['spectrumType'] = 'void'
            device['prpsType'] = 'void'
        elif device['status'] == '异常' and device['latestPd'] < 30 and (os.urandom(1)[0] / 255) < 0.02: # 2%概率恢复
            device['status'] = '正常'
            device['diagnosis'] = {"text": "设备状态恢复正常，局放信号稳定。", "risk": "低"}
            device['prpdType'] = 'normal'
            device['spectrumType'] = 'normal'
            device['prpsType'] = 'normal'
    return devices_list


@app.get("/api/devices")
async def get_devices():
    """返回所有GIS设备数据"""
    devices = load_device_data()
    # 在返回数据前，模拟数据更新
    updated_devices = update_simulated_data(devices)
    return updated_devices

@app.get("/api/devices/{device_id}")
async def get_device_detail(device_id: str):
    """返回特定GIS设备的详细数据"""
    devices = load_device_data()
    device = next((d for d in devices if d["id"] == device_id), None)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # 模拟数据更新（只更新当前请求的设备）
    updated_device = update_simulated_data([device])[0]
    return updated_device

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
