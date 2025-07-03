// script.js

// 模拟数据
const devices = [
    {
        id: 'gis-001',
        name: 'GIS设备-001',
        location: '变电站A-1号GIS室',
        status: '正常',
        latestPd: 15,
        model: 'GIS-A-2023',
        commissionDate: '2023-01-15',
        temperature: 25.5,
        humidity: 60,
        sf6Pressure: 0.55,
        pdTrend: generatePdTrend('normal'), // 模拟24小时局放趋势
        prpdType: 'normal',
        spectrumType: 'normal',
        prpsType: 'normal',
        alerts: [],
        diagnosis: { text: '设备运行正常，无明显异常局放信号。', risk: '低' }
    },
    {
        id: 'gis-002',
        name: 'GIS设备-002',
        location: '变电站A-2号GIS室',
        status: '异常',
        latestPd: 120,
        model: 'GIS-B-2022',
        commissionDate: '2022-05-20',
        temperature: 28.1,
        humidity: 65,
        sf6Pressure: 0.52,
        pdTrend: generatePdTrend('abnormal-tip'), // 模拟24小时局放趋势
        prpdType: 'tip',
        spectrumType: 'tip',
        prpsType: 'tip',
        alerts: [
            { time: '2025-07-03 11:00:00', type: '局放严重超限', level: '紧急', description: '发现典型尖端放电信号，建议立即检查' },
            { time: '2025-07-03 09:00:00', type: '局放超限', level: '高', description: '局放幅值持续升高' }
        ],
        diagnosis: { text: '检测到典型尖端放电信号，局放幅值严重超限，建议立即安排停电检查。', risk: '高' }
    },
    {
        id: 'gis-003',
        name: 'GIS设备-003',
        location: '变电站B-1号GIS室',
        status: '正常',
        latestPd: 30,
        model: 'GIS-C-2024',
        commissionDate: '2024-03-10',
        temperature: 24.8,
        humidity: 58,
        sf6Pressure: 0.56,
        pdTrend: generatePdTrend('normal'), // 模拟24小时局放趋势
        prpdType: 'normal',
        spectrumType: 'normal',
        prpsType: 'normal',
        alerts: [],
        diagnosis: { text: '设备运行正常。', risk: '低' }
    },
    {
        id: 'gis-004',
        name: 'GIS设备-004',
        location: '变电站C-1号GIS室',
        status: '异常',
        latestPd: 85,
        model: 'GIS-D-2021',
        commissionDate: '2021-08-01',
        temperature: 26.0,
        humidity: 70,
        sf6Pressure: 0.53,
        pdTrend: generatePdTrend('abnormal-void'), // 模拟24小时局放趋势
        prpdType: 'void',
        spectrumType: 'void',
        prpsType: 'void',
        alerts: [
            { time: '2025-07-03 10:00:00', type: '局放超限', level: '中', description: '发现内部空隙放电特征，建议持续关注' }
        ],
        diagnosis: { text: '检测到内部空隙放电特征，局放幅值偏高，建议加强监测。', risk: '中' }
    },
    {
        id: 'gis-005',
        name: 'GIS设备-005',
        location: '变电站D-1号GIS室',
        status: '正常',
        latestPd: 20,
        model: 'GIS-E-2023',
        commissionDate: '2023-11-22',
        temperature: 25.0,
        humidity: 62,
        sf6Pressure: 0.54,
        pdTrend: generatePdTrend('normal'), // 模拟24小时局放趋势
        prpdType: 'normal',
        spectrumType: 'normal',
        prpsType: 'normal',
        alerts: [],
        diagnosis: { text: '设备运行正常。', risk: '低' }
    }
];

// 模拟局放趋势数据生成函数
function generatePdTrend(type) {
    const data = [];
    for (let i = 0; i < 24; i++) {
        let value;
        if (type === 'normal') {
            value = Math.floor(Math.random() * 30) + 10; // 正常范围
        } else if (type === 'abnormal-tip') {
            value = Math.floor(Math.random() * 100) + 80; // 尖端放电，高幅值
        } else if (type === 'abnormal-void') {
            value = Math.floor(Math.random() * 60) + 40; // 内部空隙放电，中等幅值
        }
        data.push(value);
    }
    return data;
}

// 模拟PRPD数据生成函数
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

// 模拟PRPS数据生成函数 (x=相位, y=周期, z=脉冲次数)
function generatePrpsData(type) {
    const phases = Array.from({ length: 360 / 5 }, (_, i) => i * 5); // 0, 5, 10, ..., 355
    const periods = Array.from({ length: 50 }, (_, i) => i + 1); // 1, 2, ..., 50

    const z_matrix = []; // 脉冲次数矩阵

    for (let j = 0; j < periods.length; j++) {
        const row = [];
        for (let i = 0; i < phases.length; i++) {
            let pulseCount = Math.floor(Math.random() * 3) + 1; // 基础脉冲次数

            const phase = phases[i];
            // const period = periods[j]; // 如果需要根据周期调整，可以使用

            if (type === 'normal') {
                pulseCount = Math.floor(Math.random() * 5) + 1;
            } else if (type === 'tip') {
                // 尖端放电：在正负半周的峰值附近脉冲次数较高
                if ((phase > 60 && phase < 120) || (phase > 240 && phase < 300)) {
                    pulseCount = Math.floor(Math.random() * 15) + 5; // 模拟高脉冲次数
                } else {
                    pulseCount = Math.floor(Math.random() * 3) + 1;
                }
            } else if (type === 'void') {
                // 内部空隙放电：在正负半周的上升沿和下降沿附近脉冲次数中等
                if ((phase > 30 && phase < 90) || (phase > 210 && phase < 270)) {
                    pulseCount = Math.floor(Math.random() * 10) + 3; // 模拟中等脉冲次数
                } else {
                    pulseCount = Math.floor(Math.random() * 2) + 1;
                }
            } else if (type === 'particle') {
                // 游离颗粒放电：分布较广，脉冲次数可能较低但持续
                pulseCount = Math.floor(Math.random() * 8) + 2;
            }
            row.push(pulseCount);
        }
        z_matrix.push(row);
    }
    return { x: phases, y: periods, z: z_matrix };
}

// 模拟频谱数据生成函数
function generateSpectrumData(type) {
    const data = [];
    for (let i = 0; i < 100; i++) { // 模拟100个频率点
        let value = Math.random() * 10; // 基础噪声

        if (type === 'normal') {
            value += Math.random() * 20;
        } else if (type === 'tip') {
            // 尖端放电：高频分量较多
            if (i > 70) value += Math.random() * 80 + 20;
            else value += Math.random() * 30;
        } else if (type === 'void') {
            // 内部空隙放电：中高频分量较多
            if (i > 40 && i < 80) value += Math.random() * 60 + 10;
            else value += Math.random() * 20;
        } else if (type === 'particle') {
            // 游离颗粒放电：低频分量可能较多，分布更宽泛
            if (i < 50) value += Math.random() * 50 + 5;
            else value += Math.random() * 15;
        }
        data.push(value);
    }
    return data;
}

// 全局Chart实例变量
let dashboardPdChartInstance = null;
let detailPdChartInstance = null;
let prpdChartInstance = null;
let spectrumChartInstance = null;

// 更新Dashboard数据和图表
function updateDashboard() {
    const totalDevices = devices.length;
    const onlineDevices = devices.filter(d => d.status !== '离线').length;
    const abnormalDevices = devices.filter(d => d.status === '异常').length;

    document.getElementById('total-devices').textContent = totalDevices;
    document.getElementById('online-devices').textContent = onlineDevices;
    document.getElementById('abnormal-devices').textContent = abnormalDevices;

    // 模拟最新告警
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

    // 更新或创建实时局放趋势图 (Dashboard)
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
                    duration: 500 // 动画时长，实现平滑过渡
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
        dashboardPdChartInstance.update(); // 更新现有图表
    }
}

// 填充设备列表
function populateDeviceList() {
    const deviceTableBody = document.getElementById('device-table-body');
    deviceTableBody.innerHTML = '';

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
let currentDetailDeviceId = null; // 记录当前显示的设备详情ID

function showDeviceDetail(deviceId) {
    const dashboardSection = document.getElementById('dashboard');
    const deviceListSection = document.getElementById('device-list');
    const deviceDetailSection = document.getElementById('device-detail');

    dashboardSection.style.display = 'none';
    deviceListSection.style.display = 'none';
    deviceDetailSection.style.display = 'block';

    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    currentDetailDeviceId = deviceId; // 设置当前详情设备ID

    document.getElementById('detail-device-name').textContent = device.name;
    document.getElementById('detail-model').textContent = device.model;
    document.getElementById('detail-location').textContent = device.location;
    document.getElementById('detail-commission-date').textContent = device.commissionDate;
    document.getElementById('detail-temperature').textContent = device.temperature.toFixed(1) + ' °C'; // 格式化为1位小数
    document.getElementById('detail-humidity').textContent = device.humidity.toFixed(1) + '%'; // 格式化为1位小数
    document.getElementById('detail-sf6-pressure').textContent = device.sf6Pressure.toFixed(2) + ' MPa'; // 格式化为2位小数

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
                    duration: 500 // 动画时长，实现平滑过渡
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
        detailPdChartInstance.update(); // 更新现有图表
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
function updateRealtimeData() {
    devices.forEach(device => {
        // 模拟最新局放值波动
        device.latestPd += (Math.random() - 0.5) * 5; // -2.5 到 +2.5 的随机波动
        if (device.latestPd < 0) device.latestPd = 0; // 确保不为负

        // 模拟辅助参数波动
        device.temperature += (Math.random() - 0.5) * 0.2; // 小幅波动
        device.humidity += (Math.random() - 0.5) * 0.5; // 小幅波动
        device.sf6Pressure += (Math.random() - 0.5) * 0.01; // 小幅波动

        // 模拟局放趋势数据滚动更新
        device.pdTrend.shift(); // 移除最旧的数据点
        let newPdValue;
        if (device.status === '正常') {
            newPdValue = Math.floor(Math.random() * 30) + 10;
        } else if (device.status === '异常') {
            // 异常设备波动更大，或有上升趋势
            newPdValue = device.pdTrend[device.pdTrend.length - 1] + (Math.random() - 0.3) * 10; // 略微上升趋势
            if (newPdValue > 200) newPdValue = 200; // 限制上限
            if (newPdValue < 50) newPdValue = 50; // 限制下限
        }
        device.pdTrend.push(newPdValue);

        // 模拟告警触发 (简单示例，可根据实际需求复杂化)
        if (device.status === '正常' && device.latestPd > 50 && Math.random() < 0.1) { // 10%概率触发
            device.status = '异常';
            const now = new Date();
            const alertTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            device.alerts.unshift({ time: alertTime, type: '局放超限', level: '高', description: '局放幅值持续升高，请关注' });
            device.diagnosis = { text: '局放幅值持续升高，可能存在潜在缺陷，建议进一步分析。', risk: '中' };
            device.prpdType = 'void'; // 模拟状态变化时，局放类型也可能变化
            device.spectrumType = 'void';
            device.prpsType = 'void';
        } else if (device.status === '异常' && device.latestPd < 30 && Math.random() < 0.05) { // 5%概率恢复
            device.status = '正常';
            device.diagnosis = { text: '设备状态恢复正常，局放信号稳定。', risk: '低' };
            device.prpdType = 'normal';
            device.spectrumType = 'normal';
            device.prpsType = 'normal';
        }
    });

    // 刷新Dashboard和设备列表
    updateDashboard();
    populateDeviceList();

    // 如果设备详情页打开，则刷新其数据
    if (document.getElementById('device-detail').style.display === 'block' && currentDetailDeviceId) {
        showDeviceDetail(currentDetailDeviceId);
    }
}

// 启动实时更新
function startRealtimeUpdates() {
    setInterval(updateRealtimeData, 3000); // 每3秒更新一次数据
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    populateDeviceList();
    showSection('dashboard'); // 默认显示Dashboard
    startRealtimeUpdates(); // 启动实时更新
});