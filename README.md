# GIS局放在线监测系统 Demo

这是一个用于演示GIS（气体绝缘开关设备）局部放电在线监测系统的前端Demo。它模拟了GIS设备的实时运行状态、局部放电数据，并提供了直观的图表展示和动态更新功能。

## 主要功能

*   **实时数据概览 (Dashboard)**：显示设备总数、在线设备数、异常设备数，以及平均局放趋势图。
*   **设备列表**：展示所有GIS设备的概况，并可点击查看详细信息。
*   **设备详情页**：
    *   显示设备基本信息和辅助参数（温度、湿度、SF6气体压力）。
    *   **局放幅值趋势图**：实时动态展示局放幅值随时间的变化。
    *   **PRPD 图谱**：相位分辨局部放电图谱，用于分析局放类型。
    *   **PRPS 三维图**：相位分辨脉冲序列三维图，提供更全面的局放特征信息（X轴：相位，Y轴：周期，Z轴：脉冲次数）。
    *   **频谱图**：展示局放信号的频率分布。
    *   **历史告警记录**：显示设备的告警历史。
    *   **诊断分析结果**：模拟给出设备的诊断结论和风险评估。
*   **实时数据更新**：数据每隔3秒从后端API获取并更新，趋势图平滑滚动，设备状态和局放模式可能动态变化。

## 技术栈

*   **前端**：HTML, CSS, JavaScript
*   **后端**：Python FastAPI (使用 `data.json` 模拟数据库)
*   **图表库**：
    *   [Chart.js](https://www.chartjs.org/) (用于趋势图和PRPD图)
    *   [Plotly.js](https://plotly.com/javascript/) (用于PRPS三维图和频谱图)

## 数据流

当前Demo的数据流如下：

1.  **前端 (HTML/CSS/JavaScript)**：
    *   前端页面 (`index.html` 中的 `script.js`) 通过 JavaScript 的 `fetch` API 向后端 FastAPI 服务发送 HTTP 请求。
    *   请求的API地址为 `http://127.0.0.1:5000/api/devices` (获取所有设备数据) 或 `http://127.0.0.1:5000/api/devices/{device_id}` (获取特定设备详情)。
    *   前端接收到后端返回的 JSON 数据后，更新页面上的Dashboard、设备列表和各种图表。

2.  **后端 (Python FastAPI)**：
    *   后端服务 (`backend/main.py`) 使用 FastAPI 框架。
    *   它的数据源是项目根目录下的 `backend/data.json` 文件，该文件存储了GIS设备的初始数据。
    *   **模拟实时更新**：每次前端请求数据时，后端都会对从 `data.json` 读取的数据进行实时的模拟更新（例如，随机波动局放值、温度等，并模拟局放趋势的滚动，甚至模拟设备状态的变化）。这意味着前端每次获取到的数据都是动态变化的，从而实现了Demo的实时动态效果。

 总结来说：


  前端从 FastAPI 后端 获取数据，而 FastAPI 后端的数据源是 `backend/data.json`
  文件，并且后端在每次提供数据时都会对其进行模拟的实时更新。


  这种架构模拟了真实世界中前端从API获取动态数据的场景。未来，data.json
  可以很容易地被替换为真实的数据库（如SQLite、PostgreSQL等），而前端代码几乎不需要改动。

## 如何查看 Demo

您可以直接通过 GitHub Pages 访问此 Demo：

[https://yangyuqing15715165798.github.io/gis-monitoring-demo/](https://yangyuqing15715165798.github.io/gis-monitoring-demo/)

## 本地运行

如果您想在本地运行此Demo，请按照以下步骤操作：

1.  **克隆仓库**：
    ```bash
    git clone https://github.com/yangyuqing15715165798/gis-monitoring-front-backend-.git
    ```
2.  **进入项目目录**：
    ```bash
    cd gis-monitoring-front-backend-
    ```
3.  **安装后端依赖** (如果尚未安装)：
    ```bash
    pip install fastapi uvicorn
    ```
4.  **启动后端服务**：
    打开一个命令行窗口，进入 `backend` 目录，并运行：
    ```bash
    cd backend
    uvicorn main:app --reload --host 127.0.0.1 --port 5000
    ```
    后端服务将在 `http://127.0.0.1:5000` 运行。

5.  **启动前端HTTP服务器**：
    打开另一个命令行窗口，进入项目根目录 (即 `index.html` 所在的目录)，并运行：
    ```bash
    python -m http.server 8000
    ```
    前端服务将在 `http://localhost:8000` 运行。

6.  **在浏览器中访问 Demo**：
    在浏览器中打开 `http://localhost:8000/`。

## 贡献

欢迎提出建议或贡献！
