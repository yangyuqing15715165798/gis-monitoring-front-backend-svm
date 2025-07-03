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
*   **实时数据更新**：模拟数据每隔3秒自动更新，趋势图平滑滚动，设备状态和局放模式可能动态变化。

## 技术栈

*   **前端**：HTML, CSS, JavaScript
*   **图表库**：
    *   [Chart.js](https://www.chartjs.org/) (用于趋势图和PRPD图)
    *   [Plotly.js](https://plotly.com/javascript/) (用于PRPS三维图和频谱图)

## 如何查看 Demo

您可以直接通过 GitHub Pages 访问此 Demo：

[https://yangyuqing15715165798.github.io/gis-monitoring-demo/](https://yangyuqing15715165798.github.io/gis-monitoring-demo/)

## 本地运行

如果您想在本地运行此Demo，请按照以下步骤操作：

1.  **克隆仓库**：
    ```bash
    git clone https://github.com/yangyuqing15715165798/gis-monitoring-demo.git
    ```
2.  **进入项目目录**：
    ```bash
    cd gis-monitoring-demo
    ```
3.  **打开 `index.html`**：
    直接在浏览器中打开 `index.html` 文件即可。
    或者，您可以使用Python启动一个简单的HTTP服务器：
    ```bash
    python -m http.server 8000
    ```
    然后在浏览器中访问 `http://localhost:8000`。

## 贡献

欢迎提出建议或贡献！
