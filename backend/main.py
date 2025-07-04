from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import numpy as np
import cv2 # 用于图像处理
import joblib # 用于加载模型
from sklearn.preprocessing import StandardScaler # 确保导入了这些类
from sklearn.decomposition import PCA
from sklearn.svm import SVC # 确保导入了SVC
import datetime # 导入datetime模块

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

# 定义模型和预处理器的全局变量
clf = None
scaler = None
pca = None
categories = ['corona', 'particle', 'floating', 'surface','void'] # 局放类型

# 获取pd_recognition_system目录的路径
pd_recognition_system_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'pd_recognition_system')
model_dir = os.path.join(pd_recognition_system_dir, 'svm_pd_model')

# 定义保存图像的目录
TMP_IMAGES_DIR = os.path.join(os.path.dirname(__file__), 'tmp_images')

# 在应用启动时加载模型和预处理器，并创建tmp_images目录
@app.on_event("startup")
async def load_models_and_create_dirs():
    global clf, scaler, pca
    try:
        print(f"FastAPI进程当前工作目录: {os.getcwd()}") # 调试信息
        model_path = os.path.join(model_dir, "svm_model.pkl")
        scaler_path = os.path.join(model_dir, "svm_scaler.pkl")
        pca_path = os.path.join(model_dir, "svm_pca.pkl")

        print(f"正在加载模型: {model_path}")
        clf = joblib.load(model_path)
        print(f"正在加载缩放器: {scaler_path}")
        scaler = joblib.load(scaler_path)
        print(f"正在加载PCA: {pca_path}")
        pca = joblib.load(pca_path)
        print("所有模型文件加载成功")

        # 创建tmp_images目录
        os.makedirs(TMP_IMAGES_DIR, exist_ok=True)
        print(f"已创建或确认目录: {TMP_IMAGES_DIR}")

    except Exception as e:
        print(f"加载模型文件或创建目录时出错: {str(e)}")
        raise RuntimeError(f"Failed to load machine learning models or create directories: {e}")

def load_device_data():
    """从data.json加载设备数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def prpd_data_to_image(prpd_data_points, image_size=(64, 64), max_amplitude=200):
    """
    将PRPD点数据转换为灰度图像（NumPy数组）。
    prpd_data_points: 列表，每个元素是 {x: phase, y: amplitude}
    image_size: 目标图像的像素尺寸 (width, height)
    max_amplitude: 局放幅值的最大值，用于归一化
    """
    image = np.zeros(image_size, dtype=np.uint8) # 灰度图，0-255

    for point in prpd_data_points:
        phase = point['x']
        amplitude = point['y']

        # 归一化相位和幅值到图像尺寸
        px = int((phase / 360.0) * (image_size[0] - 1))
        py = int((amplitude / max_amplitude) * (image_size[1] - 1))
        py = image_size[1] - 1 - py # 图像Y轴通常是倒置的，使高幅值在上方

        # 确保像素坐标在图像范围内
        px = np.clip(px, 0, image_size[0] - 1)
        py = np.clip(py, 0, image_size[1] - 1)

        # 增加该像素点的强度（模拟脉冲密度）
        image[py, px] = min(255, image[py, px] + 50) # 简单累加，防止溢出

    print(f"PRPD图像数据 - shape: {image.shape}, dtype: {image.dtype}, min: {image.min()}, max: {image.max()}") # 调试信息
    return image

def predict_pd_type(prpd_data_points):
    """
    接收PRPD点数据，进行图像化、预处理并使用SVM模型预测局放类型。
    返回预测类别和概率。
    """
    if clf is None or scaler is None or pca is None:
        raise RuntimeError("Machine learning models are not loaded.")

    prpd_image = prpd_data_to_image(prpd_data_points)

    # --- 保存PRPD图像 ---
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")[:-3] # 年月日时分秒毫秒
    image_filename = f"prpd_image_{timestamp}.jpg"
    image_path = os.path.join(TMP_IMAGES_DIR, image_filename)
    
    # 使用cv2.imencode和open()来保存，以支持中文路径
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90] # JPEG质量
    is_success, buffer = cv2.imencode(".jpg", prpd_image, encode_param)
    if is_success:
        try:
            with open(image_path, "wb") as f:
                f.write(buffer.tobytes())
            write_success = True
        except Exception as e:
            print(f"写入PRPD图像文件失败: {e}")
            write_success = False
    else:
        write_success = False
    print(f"尝试保存PRPD图像到: {image_path}")
    print(f"cv2.imwrite (imencode+open) 结果: {write_success}")
    # --- 保存PRPD图像结束 ---

    flattened_image = prpd_image.flatten()
    processed_image = scaler.transform([flattened_image])
    processed_image = pca.transform(processed_image)

    new_pred = clf.predict(processed_image)
    predicted_category = categories[new_pred[0]]

    pred_prob = clf.predict_proba(processed_image)
    predicted_probability = pred_prob[0][new_pred[0]] * 100

    return {"category": predicted_category, "probability": predicted_probability}

# 模拟数据更新（为了保持前端的动态效果）
def update_simulated_data(devices_list):
    """模拟更新设备数据，使其动态变化"""
    for device in devices_list:
        # 模拟最新局放值波动
        device['latestPd'] += (os.urandom(1)[0] / 255 - 0.5) * 5
        if device['latestPd'] < 0: device['latestPd'] = 0

        # 模拟辅助参数波动
        device['temperature'] += (os.urandom(1)[0] / 255 - 0.5) * 0.2
        device['humidity'] += (os.urandom(1)[0] / 255 - 0.5) * 0.5
        device['sf6Pressure'] += (os.urandom(1)[0] / 255 - 0.5) * 0.01

        # 模拟局放趋势数据滚动更新
        device['pdTrend'].pop(0)
        new_pd_value = 0
        if device['status'] == '正常':
            new_pd_value = int(os.urandom(1)[0] / 255 * 30) + 10
        elif device['status'] == '异常':
            new_pd_value = device['pdTrend'][-1] + (os.urandom(1)[0] / 255 - 0.3) * 10
            if new_pd_value > 200: new_pd_value = 200
            if new_pd_value < 50: new_pd_value = 50
        device['pdTrend'].append(new_pd_value)

        # --- 集成局放类型识别算法 ---
        simulated_prpd_points = []
        for i, val in enumerate(device['pdTrend']):
            simulated_prpd_points.append({'x': (i / len(device['pdTrend'])) * 360, 'y': val})

        try:
            prediction_result = predict_pd_type(simulated_prpd_points)
            device['prpdType'] = prediction_result['category']
            device['predictedProbability'] = prediction_result['probability'] # 存储预测概率
            device['spectrumType'] = device['prpdType']
            device['prpsType'] = device['prpdType']
        except RuntimeError as e:
            print(f"预测局放类型失败: {e}")
            device['prpdType'] = 'normal' # 预测失败时设为默认值
            device['predictedProbability'] = 0.0 # 预测失败时设为默认值
            device['spectrumType'] = 'normal'
            device['prpsType'] = 'normal'

        # 模拟告警触发 (简单示例，可根据实际需求复杂化)
        if device['prpdType'] != 'normal' and device['predictedProbability'] > 60 and (os.urandom(1)[0] / 255) < 0.1: # 如果预测不是正常，且置信度>60%，有10%概率触发告警
            if not device['alerts'] or device['alerts'][0]['type'] != f"局放类型异常: {device['prpdType']}":
                now = datetime.datetime.now()
                alert_time = now.strftime("%Y-%m-%d %H:%M:%S")
                device['alerts'].insert(0, {"time": alert_time, "type": f"局放类型异常: {device['prpdType']}", "level": "高", "description": f"检测到{device['prpdType']}类型局放，置信度{device['predictedProbability']:.2f}%，请关注"})
                device['status'] = '异常'
                device['diagnosis']['text'] = f"检测到{device['prpdType']}类型局放，置信度{device['predictedProbability']:.2f}%，建议进一步分析。"
                device['diagnosis']['risk'] = "中"
        elif device['prpdType'] == 'normal' and device['status'] == '异常' and (os.urandom(1)[0] / 255) < 0.05: # 如果预测恢复正常，有5%概率恢复状态
            device['status'] = 'normal'
            device['diagnosis'] = {"text": "设备状态恢复正常，局放信号稳定。", "risk": "低"}
            device['alerts'] = [alert for alert in device['alerts'] if not alert['type'].startswith("局放类型异常")]

    return devices_list


@app.get("/api/devices")
async def get_devices():
    """返回所有GIS设备数据"""
    devices = load_device_data()
    updated_devices = update_simulated_data(devices)
    return updated_devices

@app.get("/api/devices/{device_id}")
async def get_device_detail(device_id: str):
    """返回特定GIS设备的详细数据"""
    devices = load_device_data()
    device = next((d for d in devices if d["id"] == device_id), None)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    updated_device = update_simulated_data([device])[0]
    return updated_device

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)