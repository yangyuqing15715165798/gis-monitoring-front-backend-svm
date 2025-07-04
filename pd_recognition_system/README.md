# 局放图像识别系统

## 项目简介

这是一个局部放电（PD）图像识别系统，主要用于识别不同类型的局部放电图像。项目基于SVM（支持向量机）机器学习模型实现，并通过FastAPI提供Web API服务。

## 主要功能

1. 图像识别服务：通过`/api/v1/predict`接口接收上传的图像，并返回识别结果
2. 识别分类：系统可以将局放图像分为5类：
   - corona（电晕放电）
   - particle（颗粒放电）
   - floating（悬浮放电）
   - surface（沿面放电）
   - void（气隙放电）
3. 预处理流程：
   - 将上传图像转为灰度图
   - 调整图像大小为64x64像素
   - 将图像展平为一维向量
   - 使用StandardScaler进行标准化
   - 使用PCA进行降维

## 项目结构

```
pd_recognition_system/
  - svm_fastapi.py           # 主要API服务代码，使用FastAPI框架
  - requirements.txt         # 项目依赖
  - gen_requirements.py      # 生成requirements的脚本
  - svm_pd_model/            # 预训练模型目录
    - svm_model.pkl          # SVM分类模型
    - svm_pca.pkl            # PCA降维处理器
    - svm_scaler.pkl         # 标准化处理器
  - svm_request_simplified.py # 简化版请求测试脚本
  - svm_request测试.py        # 请求测试脚本
  - test_dataset/            # 测试数据集
    - corona/                # 电晕放电图像
    - floating/              # 悬浮放电图像
    - particle/              # 颗粒放电图像
    - surface/               # 沿面放电图像
    - void/                  # 气隙放电图像
```

## 使用方法

### 安装依赖

```bash
pip install -r requirements.txt
```

### 启动服务

```bash
python svm_fastapi.py
```

服务将在 `http://0.0.0.0:9000` 启动，提供API接口。

### API使用

向 `/api/v1/predict` 端点发送POST请求，上传图像文件：

```python
import requests

url = "http://localhost:9000/api/v1/predict"
files = {"file": open("path_to_image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### 返回结果

```json
{
  "predicted_category": "corona",
  "predicted_probability": "95.23%"
}
```

## 技术栈

- Python
- FastAPI
- OpenCV
- scikit-learn (SVM, PCA, StandardScaler)
- joblib
- uvicorn 