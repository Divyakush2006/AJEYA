/* =========================================================
   AJEYA — Dashboard Application Logic
   Charts, Navigation, Counters, Inventory Table
   ========================================================= */

// === SPLASH SCREEN ===
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initApp();
    }, 1800);
});

function initApp() {
    initNavigation();
    initSidebar();
    initCounters();
    initCharts();
    initInventoryTable();
    initMLTabs();
    initPipeline();
    initSearch();
}

// === NAVIGATION ===
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-page]');
    const cardLinks = document.querySelectorAll('.card-link[data-page]');

    [...navItems, ...cardLinks].forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(pageName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Switch page
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(`page-${pageName}`);
    if (activePage) {
        activePage.classList.add('active');
        // Re-trigger animations
        activePage.querySelectorAll('[data-animate]').forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = null;
        });
    }

    // Initialize charts on analytics page if switching there
    if (pageName === 'analytics') {
        setTimeout(() => initAnalyticsCharts(), 100);
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('mobile-open');
}

// === SIDEBAR ===
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const menuToggle = document.getElementById('menuToggle');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

// === ANIMATED COUNTERS ===
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.counter);
        const isRupee = counter.textContent.includes('₹');
        animateCounter(counter, target, isRupee);
    });
}

function animateCounter(el, target, isRupee = false, duration = 1500) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);

        if (isRupee) {
            el.textContent = `₹${current.toLocaleString('en-IN')}`;
        } else {
            el.textContent = current.toLocaleString('en-IN');
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// === CHARTS ===
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#1c1d33',
            titleColor: '#e2e4f0',
            bodyColor: '#8b8da6',
            borderColor: 'rgba(99, 102, 241, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
        }
    }
};

function initCharts() {
    initRevenueChart();
    initChannelChart();
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
            datasets: [{
                label: 'Revenue',
                data: [680000, 720000, 850000, 910000, 780000, 820000, 950000, 880000, 920000, 1020000, 890000, 930000],
                borderColor: '#6366f1',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#6366f1',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                borderWidth: 2.5,
            }]
        },
        options: {
            ...chartDefaults,
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#5b5d7a', font: { family: 'Inter', size: 11 } },
                    border: { display: false }
                },
                y: {
                    grid: { color: 'rgba(99, 102, 241, 0.05)' },
                    ticks: {
                        color: '#5b5d7a',
                        font: { family: 'Inter', size: 11 },
                        callback: val => `₹${(val / 100000).toFixed(1)}L`
                    },
                    border: { display: false }
                }
            }
        }
    });
}

function initChannelChart() {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Offline', 'Online'],
            datasets: [{
                data: [7089088, 2264545],
                backgroundColor: ['#6366f1', '#22d3ee'],
                borderWidth: 0,
                borderRadius: 4,
                hoverOffset: 8,
            }]
        },
        options: {
            ...chartDefaults,
            cutout: '70%',
            plugins: {
                ...chartDefaults.plugins,
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function (tooltipCtx) {
                            return `₹${(tooltipCtx.parsed / 1000000).toFixed(1)}M`;
                        }
                    }
                }
            }
        }
    });
}

function initAnalyticsCharts() {
    // Category Chart
    const catCtx = document.getElementById('categoryChart');
    if (catCtx && !catCtx.chart) {
        catCtx.chart = new Chart(catCtx, {
            type: 'bar',
            data: {
                labels: ['Electronics', 'Apparel', 'Groceries', 'Home', 'Beauty', 'Sports', 'Books', 'Toys'],
                datasets: [{
                    label: 'Revenue',
                    data: [2100000, 1800000, 1500000, 1200000, 980000, 750000, 520000, 403000],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(34, 211, 238, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(148, 163, 184, 0.8)',
                    ],
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                ...chartDefaults,
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#5b5d7a', font: { family: 'Inter', size: 11 } },
                        border: { display: false }
                    },
                    y: {
                        grid: { color: 'rgba(99, 102, 241, 0.05)' },
                        ticks: {
                            color: '#5b5d7a',
                            font: { family: 'Inter', size: 11 },
                            callback: val => `₹${(val / 100000).toFixed(0)}L`
                        },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // Daily Sales
    const dailyCtx = document.getElementById('dailySalesChart');
    if (dailyCtx && !dailyCtx.chart) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dailyCtx.chart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Online',
                        data: [42, 38, 56, 63, 71, 89, 95],
                        borderColor: '#22d3ee',
                        backgroundColor: 'rgba(34, 211, 238, 0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#22d3ee',
                        borderWidth: 2,
                    },
                    {
                        label: 'Offline',
                        data: [88, 95, 112, 98, 130, 180, 165],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1',
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: true, labels: { color: '#8b8da6', font: { family: 'Inter', size: 11 } } }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#5b5d7a', font: { family: 'Inter', size: 11 } },
                        border: { display: false }
                    },
                    y: {
                        grid: { color: 'rgba(99, 102, 241, 0.05)' },
                        ticks: { color: '#5b5d7a', font: { family: 'Inter', size: 11 } },
                        border: { display: false }
                    }
                }
            }
        });
    }

    // Warehouse Chart
    const whCtx = document.getElementById('warehouseChart');
    if (whCtx && !whCtx.chart) {
        whCtx.chart = new Chart(whCtx, {
            type: 'polarArea',
            data: {
                labels: ['WH_North', 'WH_South', 'WH_West'],
                datasets: [{
                    data: [18500, 15200, 12600],
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.6)',
                        'rgba(34, 211, 238, 0.6)',
                        'rgba(139, 92, 246, 0.6)',
                    ],
                    borderWidth: 0,
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { position: 'bottom', labels: { color: '#8b8da6', font: { family: 'Inter', size: 11 }, padding: 16 } }
                },
                scales: {
                    r: {
                        grid: { color: 'rgba(99, 102, 241, 0.08)' },
                        ticks: { display: false },
                    }
                }
            }
        });
    }

    // Top Products Revenue
    const topCtx = document.getElementById('topProductsChart');
    if (topCtx && !topCtx.chart) {
        topCtx.chart = new Chart(topCtx, {
            type: 'bar',
            data: {
                labels: ['P011', 'P029', 'P024', 'P086', 'P087', 'P020', 'P016', 'P009', 'P089', 'P017'],
                datasets: [{
                    label: 'Revenue',
                    data: [520000, 442000, 396000, 375000, 358000, 342000, 330000, 325000, 310000, 298000],
                    backgroundColor: (chartCtx) => {
                        const gradient = chartCtx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
                        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.4)');
                        return gradient;
                    },
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                ...chartDefaults,
                indexAxis: 'y',
                scales: {
                    x: {
                        grid: { color: 'rgba(99, 102, 241, 0.05)' },
                        ticks: {
                            color: '#5b5d7a',
                            font: { family: 'Inter', size: 11 },
                            callback: val => `₹${(val / 1000).toFixed(0)}K`
                        },
                        border: { display: false }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#8b8da6', font: { family: 'Inter', size: 11, weight: '600' } },
                        border: { display: false }
                    }
                }
            }
        });
    }
}

// === INVENTORY TABLE ===
function initInventoryTable() {
    const tbody = document.querySelector('#inventoryTable tbody');
    if (!tbody) return;

    const inventoryData = [
        { id: 'P040', warehouse: 'WH_North', stock: 0, reorder: 25, status: 'out', dos: 0 },
        { id: 'P018', warehouse: 'WH_North', stock: 1, reorder: 20, status: 'out', dos: 7 },
        { id: 'P035', warehouse: 'WH_South', stock: 3, reorder: 15, status: 'low', dos: 21 },
        { id: 'P032', warehouse: 'WH_North', stock: 2, reorder: 18, status: 'low', dos: 21 },
        { id: 'P011', warehouse: 'WH_West', stock: 5, reorder: 30, status: 'low', dos: 22 },
        { id: 'P056', warehouse: 'WH_North', stock: 2, reorder: 10, status: 'low', dos: 24 },
        { id: 'P090', warehouse: 'WH_South', stock: 486, reorder: 25, status: 'ok', dos: 9136 },
        { id: 'P064', warehouse: 'WH_North', stock: 453, reorder: 20, status: 'ok', dos: 8369 },
        { id: 'P085', warehouse: 'WH_North', stock: 428, reorder: 25, status: 'ok', dos: 6351 },
        { id: 'P071', warehouse: 'WH_North', stock: 497, reorder: 30, status: 'ok', dos: 6277 },
        { id: 'P055', warehouse: 'WH_South', stock: 498, reorder: 25, status: 'ok', dos: 6160 },
        { id: 'P061', warehouse: 'WH_South', stock: 472, reorder: 20, status: 'ok', dos: 6042 },
        { id: 'P024', warehouse: 'WH_West', stock: 312, reorder: 25, status: 'ok', dos: 1850 },
        { id: 'P029', warehouse: 'WH_North', stock: 245, reorder: 20, status: 'ok', dos: 1420 },
        { id: 'P086', warehouse: 'WH_South', stock: 178, reorder: 15, status: 'ok', dos: 980 },
    ];

    tbody.innerHTML = inventoryData.map(item => {
        const statusLabel = item.status === 'out' ? 'Out of Stock' : item.status === 'low' ? 'Low Stock' : 'In Stock';
        return `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td>${item.warehouse}</td>
                <td>${item.stock.toLocaleString()}</td>
                <td>${item.reorder}</td>
                <td><span class="status-badge ${item.status}">${statusLabel}</span></td>
                <td>${item.dos > 999 ? item.dos.toLocaleString() : item.dos} days</td>
                <td>
                    ${item.status === 'out' ? '<button class="btn btn-sm btn-danger">Reorder</button>' :
                item.status === 'low' ? '<button class="btn btn-sm btn-outline">Replenish</button>' :
                    item.dos > 60 ? '<button class="btn btn-sm btn-outline">Markdown</button>' :
                        '<span style="color: var(--text-muted); font-size: 0.72rem">—</span>'
            }
                </td>
            </tr>
        `;
    }).join('');
}

// === ML TABS ===
function initMLTabs() {
    const tabs = document.querySelectorAll('.ml-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.ml-tab-content').forEach(c => c.classList.remove('active'));
            const targetTab = document.getElementById(`tab-${tab.dataset.tab}`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

// === PIPELINE ANIMATION ===
function initPipeline() {
    const runBtn = document.getElementById('runPipelineBtn');
    if (!runBtn) return;

    runBtn.addEventListener('click', () => {
        const nodes = document.querySelectorAll('.pipeline-node');
        nodes.forEach((node, i) => {
            node.style.transition = 'all 0.4s ease';
            setTimeout(() => {
                node.style.transform = 'scale(1.05)';
                node.style.boxShadow = '0 0 24px rgba(99, 102, 241, 0.3)';
                setTimeout(() => {
                    node.style.transform = 'scale(1)';
                    node.style.boxShadow = 'none';
                }, 400);
            }, i * 200);
        });
    });
}

// === SEARCH ===
function initSearch() {
    const searchInput = document.getElementById('inventorySearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventoryTable tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}
