### `script.js` 文件详细解释

`script.js` 是我们GIS局放在线监测系统Demo的核心大脑。它负责所有的数据获取、处理、页面元素的动态更新、图表的绘制以及用户交互的响应。理解 `script.js` 的工作原理，就是理解这个Demo如何“动起来”的。

```javascript
// 后端API地址
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// 全局Chart实例变量
let dashboardPdChartInstance = null;
let detailPdChartInstance = null;
let prpdChartInstance = null;
let spectrumChartInstance = null;

// 存储从后端获取的设备数据
let devices = [];
let currentDetailDeviceId = null; // 记录当前显示的设备详情ID

// 模拟PRPD数据生成函数 (保持不变，因为后端只提供数据，图谱生成逻辑仍在前端)
function generatePrpdData(type) {
    const data = [];
    for (let i = 0; i < 360; i += 5) { // 360度，每5度一个点
        let pdValue = Math.random() * 5; // 基础噪声

        if (type === 'normal') {
            // 正常情况，低幅值随机分布
            pdValue += Math.random() * 10;
        } else if (type === 'tip') {
            // 尖端放电：在正负半周的峰值附近出现高幅值脉冲
            if ((i > 60 && i < 120) || (i > 240 && i < 300)) {
                pdValue = Math.random() * 150 + 50; // 模拟高幅值
            }
        } else if (type === 'void') {
            // 内部空隙放电：在正负半周的上升沿和下降沿附近出现脉冲
            if ((i > 30 && i < 90) || (i > 210 && i < 270)) {
                pdValue = Math.random() * 80 + 30; // 模拟中等幅值
            }
        } else if (type === 'particle') {
            // 游离颗粒放电：在整个周期内都有脉冲，但幅值可能较低，且分布不规则
            pdValue = Math.random() * 60 + 10; // 模拟中低幅值
        }
        data.push({ x: i, y: pdValue });
    }
    return data;
}

// 模拟PRPS数据生成函数 (保持不变)
function generatePrpsData(type) {
    const phases = Array.from({ length: 360 / 5 }, (_, i) => i * 5); // 0, 5, 10, ..., 355
    const periods = Array.from({ length: 50 }, (_, i) => i + 1); // 1, 2, ..., 50

    const z_matrix = []; // 脉冲次数矩阵

    for (let j = 0; j < periods.length; j++) {
        const row = [];
        for (let i = 0; i < phases.length; i++) {
            let pulseCount = Math.floor(Math.random() * 3) + 1; // 基础脉冲次数

            const phase = phases[i];

            if (type === 'normal') {
                pulseCount = Math.floor(Math.random() * 5) + 1;
            } else if (type === 'tip') {
                if ((phase > 60 && phase < 120) || (phase > 240 && phase < 300)) {
                    pulseCount = Math.floor(Math.random() * 15) + 5;
                } else {
                    pulseCount = Math.floor(Math.random() * 3) + 1;
                }
            } else if (type === 'void') {
                if ((phase > 30 && phase < 90) || (phase > 210 && phase < 270)) {
                    pulseCount = Math.floor(Math.random() * 10) + 3;
                } else {
                    pulseCount = Math.floor(Math.random() * 2) + 1;
                }
            } else if (type === 'particle') {
                pulseCount = Math.floor(Math.random() * 8) + 2;
            }
            row.push(pulseCount);
        }
        z_matrix.push(row);
    }
    return { x: phases, y: periods, z: z_matrix };
}

// 模拟频谱数据生成函数 (保持不变)
function generateSpectrumData(type) {
    const data = [];
    for (let i = 0; i < 100; i++) { // 模拟100个频率点
        let value = Math.random() * 10; // 基础噪声

        if (type === 'normal') {
            value += Math.random() * 20;
        } else if (type === 'tip') {
            if (i > 70) value += Math.random() * 80 + 20;
            else value += Math.random() * 30;
        } else if (type === 'void') {
            if (i > 40 && i < 80) value += Math.random() * 60 + 10;
            else value += Math.random() * 20;
        } else if (type === 'particle') {
            if (i < 50) value += Math.random() * 50 + 5;
            else value += Math.random() * 15;
        }
        data.push(value);
    }
    return data;
}

// 更新Dashboard数据和图表
function updateDashboard() {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status !== '离线').length;
    const abnormalDevices = devices.filter(d => d.status === '异常').length;

    document.getElementById('total-devices').textContent = totalDevices;
    document.getElementById('online-devices').textContent = onlineDevices;
    document.getElementById('abnormal-devices').textContent = abnormalDevices;

    const allAlerts = devices.flatMap(d => d.alerts).sort((a, b) => new Date(b.time) - new Date(a.time));
    const alertList = document.getElementById('alert-list');
    alertList.innerHTML = '';
    if (allAlerts.length > 0) {
        allAlerts.slice(0, 5).forEach(alert => {
            const li = document.createElement('li');
            li.textContent = `[${alert.time}] 设备: ${devices.find(d => d.alerts.includes(alert)).name} - ${alert.type} (${alert.level})`;
            alertList.appendChild(li);
        });
    } else {
        alertList.innerHTML = '<li>暂无告警</li>';
    }

    const ctx = document.getElementById('pd-trend-chart').getContext('2d');
    const avgPdData = devices.map(d => d.pdTrend).reduce((acc, val) => acc.map((v, i) => v + val[i]), Array(24).fill(0)).map(sum => sum / devices.length);
    const labels = Array.from({ length: 24 }, (_, i) => `${i}h ago`);

    if (!dashboardPdChartInstance) {
        dashboardPdChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '平均局放幅值 (pC)',
                    data: avgPdData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 500
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        dashboardPdChartInstance.data.labels = labels;
        dashboardPdChartInstance.data.datasets[0].data = avgPdData;
        dashboardPdChartInstance.update();
    }
}

// 填充设备列表
function populateDeviceList() {
    const deviceTableBody = document.getElementById('device-table-body');
    deviceTableBody.innerHTML = '';

    if (devices.length === 0) {
        deviceTableBody.innerHTML = '<tr><td colspan="5">加载中...</td></tr>';
        return;
    }

    devices.forEach(device => {
        const row = deviceTableBody.insertRow();
        row.innerHTML = `
            <td>${device.name}</td>
            <td>${device.location}</td>
            <td>${device.status}</td>
            <td>${device.latestPd.toFixed(1)}</td>
            <td><button onclick="showDeviceDetail('${device.id}')">查看详情</button></td>
        `;
    });
}

// 显示设备详情
async function showDeviceDetail(deviceId) {
    const dashboardSection = document.getElementById('dashboard');
    const deviceListSection = document.getElementById('device-list');
    const deviceDetailSection = document.getElementById('device-detail');

    dashboardSection.style.display = 'none';
    deviceListSection.style.display = 'none';
    deviceDetailSection.style.display = 'block';

    currentDetailDeviceId = deviceId; // 设置当前详情设备ID

    // 从后端获取特定设备数据
    let device = null;
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        device = await response.json();
    } catch (error) {
        console.error('Error fetching device detail:', error);
        // 可以显示错误信息给用户
        document.getElementById('detail-device-name').textContent = '加载失败';
        return;
    }

    if (!device) return;

    document.getElementById('detail-device-name').textContent = device.name;
    document.getElementById('detail-model').textContent = device.model;
    document.getElementById('detail-location').textContent = device.location;
    document.getElementById('detail-commission-date').textContent = device.commissionDate;
    document.getElementById('detail-temperature').textContent = device.temperature.toFixed(1) + ' °C';
    document.getElementById('detail-humidity').textContent = device.humidity.toFixed(1) + '%';
    document.getElementById('detail-sf6-pressure').textContent = device.sf6Pressure.toFixed(2) + ' MPa';

    // 更新或创建局放幅值趋势图 (设备详情)
    const detailPdCtx = document.getElementById('detail-pd-chart').getContext('2d');
    const detailLabels = Array.from({ length: 24 }, (_, i) => `${i}h ago`);

    if (!detailPdChartInstance) {
        detailPdChartInstance = new Chart(detailPdCtx, {
            type: 'line',
            data: {
                labels: detailLabels,
                datasets: [{
                    label: '局放幅值 (pC)',
                    data: device.pdTrend,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 500
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        detailPdChartInstance.data.labels = detailLabels;
        detailPdChartInstance.data.datasets[0].data = device.pdTrend;
        detailPdChartInstance.update();
    }

    // PRPD 图谱 (每次都重新创建，因为其模式可能随设备状态变化)
    const prpdCtx = document.getElementById('prpd-chart').getContext('2d');
    if (prpdChartInstance) prpdChartInstance.destroy();
    prpdChartInstance = new Chart(prpdCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'PRPD 图谱',
                data: generatePrpdData(device.prpdType),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { type: 'linear', position: 'bottom', title: { display: true, text: '相位 (度)' }, min: 0, max: 360 },
                y: { title: { display: true, text: '局放幅值 (pC)' }, beginAtZero: true }
            }
        }
    });

    // PRPS 三维图 (每次都重新创建，因为其模式可能随设备状态变化)
    const prpsData = generatePrpsData(device.prpsType);
    const prpsLayout = {
        scene: {
            xaxis: { title: '相位 (度)', range: [0, 360] },
            yaxis: { title: '周期', range: [1, 50] },
            zaxis: { title: '脉冲次数' }
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        height: 400,
        responsive: true
    };
    Plotly.newPlot('prps-3d-chart', [{
        x: prpsData.x,
        y: prpsData.y,
        z: prpsData.z,
        type: 'surface',
        colorscale: 'Viridis',
        colorbar: { title: '脉冲次数' }
    }], prpsLayout);

    // 频谱图 (每次都重新创建，因为其模式可能随设备状态变化)
    const spectrumCtx = document.getElementById('spectrum-chart').getContext('2d');
    if (spectrumChartInstance) spectrumChartInstance.destroy();
    spectrumChartInstance = new Chart(spectrumCtx, {
        type: 'bar',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => `F${i}`),
            datasets: [{
                label: '频谱幅值',
                data: generateSpectrumData(device.spectrumType),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // 填充历史告警记录
    const detailAlertList = document.getElementById('detail-alert-list');
    detailAlertList.innerHTML = '';
    if (device.alerts.length > 0) {
        device.alerts.forEach(alert => {
            const li = document.createElement('li');
            li.textContent = `[${alert.time}] ${alert.type} (${alert.level}): ${alert.description}`;
            detailAlertList.appendChild(li);
        });
    } else {
        detailAlertList.innerHTML = '<li>暂无历史告警</li>';
    }

    // 填充诊断分析结果
    document.getElementById('diagnosis-text').textContent = device.diagnosis.text;
    document.getElementById('risk-assessment').textContent = device.diagnosis.risk;
}

// 切换显示区域
function showSection(sectionId) {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('device-list').style.display = 'none';
    document.getElementById('device-detail').style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';
    if (sectionId === 'dashboard') {
        document.getElementById('device-list').style.display = 'block';
    }
}

// 实时数据更新逻辑
async function updateRealtimeData() {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        devices = await response.json(); // 更新全局设备数据
    } catch (error) {
        console.error('Error fetching devices:', error);
        devices = []; // 清空数据，避免显示旧数据
    }

    // 刷新Dashboard和设备列表
    updateDashboard();
    populateDeviceList();

    // 如果设备详情页打开，则刷新其数据
    if (document.getElementById('device-detail').style.display === 'block' && currentDetailDeviceId) {
        // 重新调用showDeviceDetail来获取并显示最新的设备详情
        showDeviceDetail(currentDetailDeviceId);
    }
}

// 启动实时更新
function startRealtimeUpdates() {
    setInterval(updateRealtimeData, 3000); // 每3秒更新一次数据
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 首次加载时立即获取数据并显示
    updateRealtimeData();
    showSection('dashboard'); // 默认显示Dashboard
    startRealtimeUpdates(); // 启动实时更新
});
