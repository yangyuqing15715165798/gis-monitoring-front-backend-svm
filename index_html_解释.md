### `index.html` 文件详细解释

`index.html` 是我们网页的骨架。它定义了页面的结构、内容，并引入了样式（CSS）和行为（JavaScript）。理解 `index.html` 是理解任何网页应用的基础。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GIS局放在线监测系统 Demo</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <header>
        <h1>GIS局放在线监测系统 Demo</h1>
    </header>
    <main>
        <section id="dashboard">
            <h2>实时数据概览</h2>
            <div class="card-container">
                <div class="card">
                    <h3>设备总数</h3>
                    <p id="total-devices">--</p>
                </div>
                <div class="card">
                    <h3>在线设备</h3>
                    <p id="online-devices">--</p>
                </div>
                <div class="card">
                    <h3>异常设备</h3>
                    <p id="abnormal-devices">--</p>
                </div>
            </div>
            <div class="chart-placeholder">
                <h3>实时局放趋势 (模拟)</h3>
                <canvas id="pd-trend-chart"></canvas>
            </div>
            <div class="latest-alerts">
                <h3>最新告警</h3>
                <ul id="alert-list">
                    <li>暂无告警</li>
                </ul>
            </div>
        </section>

        <section id="device-list">
            <h2>设备列表</h2>
            <table>
                <thead>
                    <tr>
                        <th>设备名称</th>
                        <th>位置</th>
                        <th>状态</th>
                        <th>最新局放值 (pC)</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="device-table-body">
                    <tr>
                        <td colspan="5">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </section>

        <!-- 设备详情页内容将通过JavaScript动态加载或切换显示 -->
        <section id="device-detail" style="display: none;">
            <h2>设备详情：<span id="detail-device-name"></span></h2>
            <button onclick="showSection('dashboard')">返回概览</button>
            <div class="detail-info">
                <h3>基本信息</h3>
                <p>型号: <span id="detail-model"></span></p>
                <p>安装位置: <span id="detail-location"></span></p>
                <p>投运日期: <span id="detail-commission-date"></span></p>
                <p>温度: <span id="detail-temperature"></span></p>
                <p>湿度: <span id="detail-humidity"></span></p>
                <p>SF6气体压力: <span id="detail-sf6-pressure"></span></p>
            </div>
            <div class="chart-placeholder">
                <h3>局放幅值趋势 (模拟)</h3>
                <canvas id="detail-pd-chart"></canvas>
            </div>
            <div class="chart-placeholder">
                <h3>PRPD 图谱 (模拟)</h3>
                <canvas id="prpd-chart"></canvas>
            </div>
            <div class="chart-placeholder">
                <h3>PRPS 三维图 (模拟)</h3>
                <div id="prps-3d-chart" style="height: 400px;"></div>
            </div>
            <div class="chart-placeholder">
                <h3>频谱图 (模拟)</h3>
                <canvas id="spectrum-chart"></canvas>
            </div>
            <div class="latest-alerts">
                <h3>历史告警记录</h3>
                <ul id="detail-alert-list">
                    <li>暂无历史告警</li>
                </ul>
            </div>
            <div class="diagnosis-result">
                <h3>诊断分析结果 (模拟)</h3>
                <p id="diagnosis-text">暂无诊断结果</p>
                <p>风险评估: <span id="risk-assessment"></span></p>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2025 GIS Monitoring Demo</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="script.js?v=" + new Date().getTime()></script>
</body>
</html>
```

---

#### HTML 基础概念

*   **HTML (HyperText Markup Language)**：超文本标记语言，是构建网页内容的标准语言。它使用一系列“标签”（Tags）来定义网页的结构和内容，例如标题、段落、图片、链接等。
*   **标签 (Tag)**：HTML标签通常成对出现，如 `<p>` 和 `</p>`，其中 `<p>` 是开始标签，`</p>` 是结束标签。标签之间的内容就是该标签所包含的内容。有些标签是自闭合的，如 `<meta>`、`<link>`、`<img>`。
*   **元素 (Element)**：从开始标签到结束标签的所有内容，包括标签本身，都称为一个元素。例如 `<p>这是一个段落</p>` 是一个段落元素。
*   **属性 (Attribute)**：标签可以有属性，属性提供了关于元素的额外信息。属性通常以 `name="value"` 的形式出现在开始标签中。例如 `<div id="myDiv">` 中，`id` 是属性名，`myDiv` 是属性值。

#### `index.html` 代码逐行解释

1.  **`<!DOCTYPE html>`**
    *   **作用**：这是一个文档类型声明，告诉浏览器当前文档是HTML5标准。这是现代HTML页面的标准开头。

2.  **`<html lang="zh-CN">`**
    *   **作用**：这是HTML文档的根元素，所有其他HTML内容都包含在它里面。
    *   **`lang="zh-CN"` 属性**：指定了文档的主要语言是中文（简体中国）。这有助于搜索引擎和屏幕阅读器更好地理解和处理页面内容。

3.  **`<head>`**
    *   **作用**：头部元素，包含了文档的元数据（关于文档本身的信息），这些信息不会直接显示在网页上，但对浏览器、搜索引擎和社交媒体分享很重要。
    *   **`<meta charset="UTF-8">`**：
        *   **作用**：指定了文档的字符编码为UTF-8。UTF-8是一种通用的字符编码，支持世界上几乎所有的字符，包括中文。这是防止乱码的关键。
    *   **`<meta name="viewport" content="width=device-width, initial-scale=1.0">`**：
        *   **作用**：这是一个响应式设计的关键元标签。它告诉浏览器如何控制页面的视口（viewport）。
        *   `width=device-width`：将视口宽度设置为设备的屏幕宽度。
        *   `initial-scale=1.0`：设置页面的初始缩放比例为1.0，即不进行缩放。
        *   这确保了网页在不同设备（手机、平板、桌面）上都能良好显示。
    *   **`<title>GIS局放在线监测系统 Demo</title>`**：
        *   **作用**：定义了网页的标题，这个标题会显示在浏览器的标签页、书签和搜索引擎结果中。
    *   **`<link rel="stylesheet" href="style.css">`**：
        *   **作用**：引入外部CSS样式表。`rel="stylesheet"` 表示这是一个样式表，`href="style.css"` 指定了CSS文件的路径。`style.css` 文件包含了控制页面外观（颜色、布局、字体等）的规则。
    *   **`<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>`**：
        *   **作用**：引入外部JavaScript库 Plotly.js。这是一个用于绘制科学图表（包括3D图）的库。`src` 属性指定了脚本文件的URL。这里使用的是CDN（内容分发网络）链接，可以直接从互联网加载。

4.  **`<body>`**
    *   **作用**：主体元素，包含了网页上所有可见的内容，如文本、图片、链接、视频等。
    *   **`<header>`**：
        *   **作用**：定义了页面的头部区域，通常包含网站的标题、Logo、导航等。
        *   **`<h1>GIS局放在线监测系统 Demo</h1>`**：一级标题，通常用于网站或页面的主标题。
    *   **`<main>`**：
        *   **作用**：定义了文档的主要内容区域。一个HTML文档中通常只有一个 `<main>` 元素。
        *   **`<section id="dashboard">`**：
            *   **作用**：定义了文档中的一个独立部分，通常包含一个主题。这里是“实时数据概览”部分。
            *   **`id="dashboard"` 属性**：为这个 `section` 元素分配了一个唯一的ID。JavaScript可以通过这个ID来获取并操作这个元素，例如控制它的显示/隐藏。
            *   **`<h2>实时数据概览</h2>`**：二级标题。
            *   **`<div class="card-container">`**：一个容器 `div`，用于布局内部的卡片。
                *   **`class="card-container"` 属性**：为这个 `div` 分配了一个类名。CSS可以通过类名来应用样式，JavaScript也可以通过类名来选择元素。类名可以被多个元素共享。
                *   **`<div class="card">`**：一个卡片 `div`，用于展示单个数据项（如设备总数）。
                    *   **`class="card"` 属性**：同样是一个类名，用于应用卡片样式。
                    *   **`<h3>设备总数</h3>`**：三级标题。
                    *   **`<p id="total-devices">--</p>`**：一个段落，用于显示设备总数。初始显示 `--`，JavaScript会动态更新其内容。`id="total-devices"` 允许JavaScript精确地找到这个段落。
                *   类似地，还有“在线设备”和“异常设备”的卡片。
            *   **`<div class="chart-placeholder">`**：图表占位符，用于放置图表。
                *   **`<h3>实时局放趋势 (模拟)</h3>`**：图表标题。
                *   **`<canvas id="pd-trend-chart"></canvas>`**：一个画布元素，Chart.js库会在这里绘制实时局放趋势图。`id="pd-trend-chart"` 允许JavaScript获取这个画布并进行绘图操作。
            *   **`<div class="latest-alerts">`**：最新告警区域。
                *   **`<h3>最新告警</h3>`**：标题。
                *   **`<ul id="alert-list">`**：无序列表，用于显示告警信息。`id="alert-list"` 允许JavaScript动态添加列表项。
                    *   **`<li>暂无告警</li>`**：初始列表项。
        *   **`<section id="device-list">`**：
            *   **作用**：设备列表部分。
            *   **`<h2>设备列表</h2>`**：标题。
            *   **`<table>`**：表格元素，用于展示设备列表数据。
                *   **`<thead>`**：表格头部，包含列标题。
                    *   **`<tr>`**：表格行。
                        *   **`<th>`**：表格标题单元格。
                *   **`<tbody id="device-table-body">`**：表格主体，用于显示实际数据行。`id="device-table-body"` 允许JavaScript动态添加表格行。
                    *   **`<tr><td colspan="5">加载中...</td></tr>`**：初始显示“加载中...”，JavaScript会动态填充数据。
        *   **`<section id="device-detail" style="display: none;">`**：
            *   **作用**：设备详情页部分。初始通过 `style="display: none;"` 隐藏，JavaScript会控制其显示/隐藏。
            *   **`<h2>设备详情：<span id="detail-device-name"></span></h2>`**：标题，`<span>` 用于显示设备名称，JavaScript会动态更新。
            *   **`<button onclick="showSection('dashboard')">返回概览</button>`**：一个按钮，点击时会调用JavaScript的 `showSection()` 函数，并传入 `'dashboard'` 参数，从而切换回Dashboard视图。
            *   **`<div class="detail-info">`**：设备基本信息区域。
                *   包含多个 `<p>` 标签，用于显示设备的型号、安装位置、投运日期、温度、湿度、SF6气体压力等信息。每个信息都有一个 `<span>` 标签，并带有唯一的 `id`，供JavaScript更新。
            *   **`<div class="chart-placeholder">`**：多个图表占位符，用于放置设备详情页的各种图表（局放幅值趋势图、PRPD图谱、PRPS三维图、频谱图）。每个图表都有一个 `canvas` 或 `div` 元素，并带有唯一的 `id`，供JavaScript绘图。
            *   **`<div class="latest-alerts">`**：历史告警记录区域，结构与Dashboard的最新告警类似。
            *   **`<div class="diagnosis-result">`**：诊断分析结果区域，用于显示诊断文本和风险评估。

    *   **`<footer>`**：
        *   **作用**：定义了页面的底部区域，通常包含版权信息、联系方式等。
        *   **`<p>&copy; 2025 GIS Monitoring Demo</p>`**：版权信息。

5.  **`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`**
    *   **作用**：引入Chart.js库，用于绘制2D图表（如折线图、散点图、柱状图）。

6.  **`<script src="script.js?v=" + new Date().getTime()></script>`**
    *   **作用**：引入我们自己编写的JavaScript逻辑文件。这个脚本包含了所有与数据获取、页面更新、图表绘制和交互相关的代码。它放在 `<body>` 结束标签之前，可以确保在脚本执行时，页面上的HTML元素都已经加载完毕，从而避免JavaScript找不到DOM元素的问题。
    *   `?v=" + new Date().getTime()`：这是一个“缓存破坏”技巧。`new Date().getTime()` 会生成一个当前时间戳，每次页面加载时都会不同。这样，浏览器会认为这是一个新的文件，强制重新下载 `script.js`，而不是使用缓存中的旧版本。这在开发过程中非常有用，可以确保您总是运行最新代码。

#### 总结 `index.html` 的作用

`index.html` 的核心作用是提供一个**结构化的容器**，其中包含了：

*   **可见内容**：用户在浏览器中看到的所有文本、图片、表格、按钮等。
*   **占位符**：通过 `id` 属性，为JavaScript预留了位置，以便JavaScript可以动态地填充数据、绘制图表或修改内容。
*   **外部资源链接**：引入了CSS样式表来美化页面，引入了Chart.js和Plotly.js等JavaScript库来提供强大的图表功能，并引入了我们自己的 `script.js` 来实现页面的核心逻辑和交互。

它本身不执行复杂的逻辑，但它是所有动态效果和交互的基础。