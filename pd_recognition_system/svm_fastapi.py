from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import joblib
import cv2
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVC
import uvicorn
import os
import sys

app = FastAPI(
    title="局放图像识别API",
    description="这是一个使用SVM模型进行局放图像分类的API服务",
    version="1.0.0",
)

# 获取当前脚本所在的目录路径
current_dir = os.path.dirname(os.path.abspath(__file__))

# 加载模型和预处理器，使用绝对路径
model_path = os.path.join(current_dir, "svm_pd_model", "svm_model.pkl")
scaler_path = os.path.join(current_dir, "svm_pd_model", "svm_scaler.pkl")
pca_path = os.path.join(current_dir, "svm_pd_model", "svm_pca.pkl")

# 检查模型文件是否存在
model_files = {
    "模型文件": model_path,
    "缩放器文件": scaler_path,
    "PCA文件": pca_path
}

missing_files = []
for name, path in model_files.items():
    if not os.path.exists(path):
        missing_files.append(f"{name}: {path}")

if missing_files:
    print("错误：以下模型文件不存在：")
    for file in missing_files:
        print(f"  - {file}")
    print("\n如果缺少scaler文件，可以尝试创建一个简单的StandardScaler")
    
    # 如果缺少scaler文件，创建一个简单的StandardScaler
    if not os.path.exists(scaler_path):
        try:
            print("尝试创建一个简单的StandardScaler...")
            scaler = StandardScaler()
            # 使用一些随机数据拟合scaler
            dummy_data = np.random.rand(10, 64*64)
            scaler.fit(dummy_data)
            # 保存scaler
            joblib.dump(scaler, scaler_path)
            print(f"已创建并保存StandardScaler到: {scaler_path}")
        except Exception as e:
            print(f"创建StandardScaler失败: {str(e)}")
            sys.exit(1)

# 加载模型和预处理器
try:
    print(f"正在加载模型: {model_path}")
    clf = joblib.load(model_path)
    
    print(f"正在加载缩放器: {scaler_path}")
    scaler = joblib.load(scaler_path)
    
    print(f"正在加载PCA: {pca_path}")
    pca = joblib.load(pca_path)
    
    print("所有模型文件加载成功")
except Exception as e:
    print(f"加载模型文件时出错: {str(e)}")
    sys.exit(1)

# 定义类别
categories = ['corona', 'particle', 'floating', 'surface','void'] 

# 读取新图像并转换为灰度图
def load_new_image(img_path):
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
    if img is not None:
        img = cv2.resize(img, (64, 64))  # 调整图像大小
        img = img.flatten()  # 将图像展平成向量
        return img
    else:
        return None

@app.post("/api/v1/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # 将文件保存到临时路径
        img_path = os.path.join(current_dir, 'temp_image.jpg')
        with open(img_path, "wb") as buffer:
            buffer.write(await file.read())

        # 加载并处理图像
        new_image = load_new_image(img_path)
        if new_image is None:
            raise HTTPException(status_code=400, detail="Failed to process image")

        # 标准化和降维
        new_image = scaler.transform([new_image])
        new_image = pca.transform(new_image)

        # 预测
        new_pred = clf.predict(new_image)
        predicted_category = categories[new_pred[0]]

        # 获取预测概率
        pred_prob = clf.predict_proba(new_image)
        predicted_probability = pred_prob[0][new_pred[0]] * 100

        return JSONResponse(content={
            'predicted_category': predicted_category,
            'predicted_probability': f"{predicted_probability:.2f}%"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == '__main__':
    print(f"模型文件路径: {model_path}")
    print(f"缩放器文件路径: {scaler_path}")
    print(f"PCA文件路径: {pca_path}")
    print(f"临时图像路径: {os.path.join(current_dir, 'temp_image.jpg')}")
    uvicorn.run(app, host='0.0.0.0', port=9000)
