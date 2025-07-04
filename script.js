const API_BASE_URL = 'http://127.0.0.1:5000/api';

let dashboardPdChartInstance = null;
let detailPdChartInstance = null;
let prpdChartInstance = null;
let spectrumChartInstance = null;

let devices = [];
let currentDetailDeviceId = null;

function generatePrpdData(type) {
    const data = [];
    for (let i = 0; i < 360; i += 5) {
        let pdValue = Math.random() * 5;
        if (type === 'normal') {
            pdValue += Math.random() * 10;
        } else if (type === 'tip') {
            if ((i > 60 && i < 120) || (i > 240 && i < 300)) {
                pdValue = Math.random() * 150 + 50;
            }
        } else if (type === 'void') {
            if ((i > 30 && i < 90) || (i > 210 && i < 270)) {
                pdValue = Math.random() * 80 + 30;
            }
        } else if (type === 'particle') {
            pdValue = Math.random() * 60 + 10;
        }
        data.push({ x: i, y: pdValue });
    }
    return data;
}

function generatePrpsData(type) {
    const phases = Array.from({ length: 360 / 5 }, (_, i) => i * 5);
    const periods = Array.from({ length: 50 }, (_, i) => i + 1);
    const z_matrix = [];
    for (let j = 0; j < periods.length; j++) {
        const row = [];
        for (let i = 0; i < phases.length; i++) {
            let pulseCount = Math.floor(Math.random() * 3) + 1;
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

function generateSpectrumData(type) {
    const data = [];
    for (let i = 0; i < 100; i++) {
        let value = Math.random() * 10;
        if (type === 'normal') {
            value += Math.random() * 20;
        } else if (type === 'tip') {
            if (i > 70) value += Math.random() * 80 + 20;
            else value += Math.random() * 30;
        }
        else if (type === 'void') {
            if (i > 40 && i < 80) value += Math.random() * 60 + 10;
            else value += Math.random() * 20;
        }
        else if (type === 'particle') {
            if (i < 50) value += Math.random() * 50 + 5;
            else value += Math.random() * 15;
        }
        data.push(value);
    }
    return data;
}

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

async function showDeviceDetail(deviceId) {
    const dashboardSection = document.getElementById('dashboard');
    const deviceListSection = document.getElementById('device-list');
    const deviceDetailSection = document.getElementById('device-detail');

    dashboardSection.style.display = 'none';
    deviceListSection.style.display = 'none';
    deviceDetailSection.style.display = 'block';

    currentDetailDeviceId = deviceId;

    let device = null;
    try {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        device = await response.json();
    } catch (error) {
        console.error('Error fetching device detail:', error);
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
    document.getElementById('predicted-pd-type').textContent = device.prpdType || '暂无';
    // 优化显示逻辑，确保0.0%也能正确显示
    if (typeof device.predictedProbability === 'number' && device.predictedProbability !== null) {
        document.getElementById('predicted-probability').textContent = `${device.predictedProbability.toFixed(2)}%`;
    } else {
        document.getElementById('predicted-probability').textContent = '暂无';
    }
    document.getElementById('diagnosis-text').textContent = device.diagnosis.text;
    document.getElementById('risk-assessment').textContent = device.diagnosis.risk;
}

function showSection(sectionId) {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('device-list').style.display = 'none';
    document.getElementById('device-detail').style.display = 'none';

    document.getElementById(sectionId).style.display = 'block';
    if (sectionId === 'dashboard') {
        document.getElementById('device-list').style.display = 'block';
    }
}

async function updateRealtimeData() {
    try {
        const response = await fetch(`${API_BASE_URL}/devices`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        devices = await response.json();
    } catch (error) {
        console.error('Error fetching devices:', error);
        devices = [];
    }

    updateDashboard();
    populateDeviceList();

    if (document.getElementById('device-detail').style.display === 'block' && currentDetailDeviceId) {
        showDeviceDetail(currentDetailDeviceId);
    }
}

function startRealtimeUpdates() {
    setInterval(updateRealtimeData, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    updateRealtimeData();
    showSection('dashboard');
    startRealtimeUpdates();
});
