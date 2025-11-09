// Analytics Dashboard JavaScript

// Check authentication
const adminUser = JSON.parse(sessionStorage.getItem('adminUser'));
if (!adminUser) {
    window.location.href = 'admin-login.html';
}

// Display user name
document.getElementById('userName').textContent = adminUser.username;

// Logout functionality
document.getElementById('btnLogout').addEventListener('click', () => {
    sessionStorage.removeItem('adminUser');
    window.location.href = 'admin-login.html';
});

// Data storage
let youtubeData = [];
let linkedinData = [];
let charts = {};

// Format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
}

// Load YouTube data
async function loadYouTubeData() {
    try {
        const response = await fetch('tables/youtube_analytics?limit=100');
        const result = await response.json();
        
        if (result.data) {
            youtubeData = result.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            updateYouTubeSummary();
            renderYouTubeCharts();
            renderYouTubeTable();
        }
    } catch (error) {
        console.error('Error loading YouTube data:', error);
    }
}

// Load LinkedIn data
async function loadLinkedInData() {
    try {
        const response = await fetch('tables/linkedin_analytics?limit=100');
        const result = await response.json();
        
        if (result.data) {
            linkedinData = result.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            updateLinkedInSummary();
            renderLinkedInCharts();
            renderLinkedInTable();
        }
    } catch (error) {
        console.error('Error loading LinkedIn data:', error);
    }
}

// Update YouTube summary cards
function updateYouTubeSummary() {
    if (youtubeData.length === 0) return;
    
    const latest = youtubeData[youtubeData.length - 1];
    const totalViews = youtubeData.reduce((sum, item) => sum + item.views, 0);
    
    document.getElementById('ytTotalViews').textContent = formatNumber(totalViews);
    document.getElementById('ytSubscribers').textContent = formatNumber(latest.subscribers);
    document.getElementById('ytEngagement').textContent = latest.engagement_rate.toFixed(1) + '%';
    
    // Calculate trend
    if (youtubeData.length >= 2) {
        const previous = youtubeData[youtubeData.length - 2];
        const trend = ((latest.views - previous.views) / previous.views * 100).toFixed(1);
        document.getElementById('ytTrend').innerHTML = `
            <span class="trend-icon">${trend > 0 ? '📈' : '📉'}</span>
            <span class="trend-text">전월 대비 ${trend > 0 ? '+' : ''}${trend}%</span>
        `;
    }
}

// Update LinkedIn summary cards
function updateLinkedInSummary() {
    if (linkedinData.length === 0) return;
    
    const latest = linkedinData[linkedinData.length - 1];
    
    document.getElementById('liFollowers').textContent = formatNumber(latest.followers);
    document.getElementById('liImpressions').textContent = formatNumber(latest.impressions);
    document.getElementById('liEngagement').textContent = latest.engagement_rate.toFixed(1) + '%';
    
    // Calculate trend
    if (linkedinData.length >= 2) {
        const previous = linkedinData[linkedinData.length - 2];
        const trend = ((latest.followers - previous.followers) / previous.followers * 100).toFixed(1);
        document.getElementById('liTrend').innerHTML = `
            <span class="trend-icon">${trend > 0 ? '📈' : '📉'}</span>
            <span class="trend-text">전월 대비 ${trend > 0 ? '+' : ''}${trend}%</span>
        `;
    }
}

// Render YouTube charts
function renderYouTubeCharts() {
    const dates = youtubeData.map(item => formatDate(item.date));
    const views = youtubeData.map(item => item.views);
    const subscribers = youtubeData.map(item => item.subscribers);
    
    // Views chart
    const ctxViews = document.getElementById('youtubeViewsChart');
    if (charts.youtubeViews) charts.youtubeViews.destroy();
    
    charts.youtubeViews = new Chart(ctxViews, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '조회수',
                data: views,
                borderColor: '#FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    // Subscribers chart
    const ctxSubs = document.getElementById('youtubeSubscribersChart');
    if (charts.youtubeSubscribers) charts.youtubeSubscribers.destroy();
    
    charts.youtubeSubscribers = new Chart(ctxSubs, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: '구독자',
                data: subscribers,
                backgroundColor: '#FF0000',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

// Render LinkedIn charts
function renderLinkedInCharts() {
    const dates = linkedinData.map(item => formatDate(item.date));
    const followers = linkedinData.map(item => item.followers);
    const engagement = linkedinData.map(item => item.engagement);
    
    // Followers chart
    const ctxFollowers = document.getElementById('linkedinFollowersChart');
    if (charts.linkedinFollowers) charts.linkedinFollowers.destroy();
    
    charts.linkedinFollowers = new Chart(ctxFollowers, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '팔로워',
                data: followers,
                borderColor: '#0A66C2',
                backgroundColor: 'rgba(10, 102, 194, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    // Engagement chart
    const ctxEngagement = document.getElementById('linkedinEngagementChart');
    if (charts.linkedinEngagement) charts.linkedinEngagement.destroy();
    
    charts.linkedinEngagement = new Chart(ctxEngagement, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: '참여 수',
                data: engagement,
                backgroundColor: '#0A66C2',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                }
            }
        }
    });
    
    // Comparison chart
    renderComparisonChart();
}

// Render comparison chart
function renderComparisonChart() {
    const dates = youtubeData.map(item => formatDate(item.date));
    const ytEngagement = youtubeData.map(item => item.engagement_rate);
    const liEngagement = linkedinData.map(item => item.engagement_rate);
    
    const ctxComparison = document.getElementById('comparisonChart');
    if (charts.comparison) charts.comparison.destroy();
    
    charts.comparison = new Chart(ctxComparison, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'YouTube 참여율',
                    data: ytEngagement,
                    borderColor: '#FF0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: 'LinkedIn 참여율',
                    data: liEngagement,
                    borderColor: '#0A66C2',
                    backgroundColor: 'rgba(10, 102, 194, 0.1)',
                    borderWidth: 3,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Render YouTube table
function renderYouTubeTable() {
    const tbody = document.getElementById('ytTableBody');
    tbody.innerHTML = youtubeData.map(item => `
        <tr>
            <td>${formatDate(item.date)}</td>
            <td>${formatNumber(item.views)}</td>
            <td>${formatNumber(item.subscribers)}</td>
            <td>${item.videos}</td>
            <td>${formatNumber(item.watch_time)}분</td>
            <td>${item.engagement_rate.toFixed(1)}%</td>
        </tr>
    `).reverse().join('');
}

// Render LinkedIn table
function renderLinkedInTable() {
    const tbody = document.getElementById('liTableBody');
    tbody.innerHTML = linkedinData.map(item => `
        <tr>
            <td>${formatDate(item.date)}</td>
            <td>${formatNumber(item.followers)}</td>
            <td>${item.posts}</td>
            <td>${formatNumber(item.impressions)}</td>
            <td>${formatNumber(item.engagement)}</td>
            <td>${item.engagement_rate.toFixed(1)}%</td>
        </tr>
    `).reverse().join('');
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tab = btn.dataset.tab;
        document.getElementById('youtubeTable').style.display = tab === 'youtube' ? 'block' : 'none';
        document.getElementById('linkedinTable').style.display = tab === 'linkedin' ? 'block' : 'none';
    });
});

// Refresh button
document.getElementById('btnRefresh').addEventListener('click', () => {
    loadYouTubeData();
    loadLinkedInData();
});

// YouTube API 초기화
let youtubeAPI = null;
let youtubeSync = null;

// API 설정이 있는 경우에만 초기화
if (typeof YOUTUBE_CONFIG !== 'undefined' && YOUTUBE_CONFIG.API_KEY && YOUTUBE_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE') {
    try {
        youtubeAPI = new YouTubeAPIService(
            YOUTUBE_CONFIG.API_KEY,
            YOUTUBE_CONFIG.CHANNEL_ID
        );
        youtubeSync = new YouTubeDataSync(youtubeAPI);
        console.log('YouTube API 초기화 완료');
    } catch (error) {
        console.error('YouTube API 초기화 실패:', error);
    }
} else {
    console.warn('YouTube API 설정이 필요합니다. js/youtube-config.js를 확인하세요.');
}

// YouTube 동기화 버튼 이벤트
const btnSyncYouTube = document.getElementById('btnSyncYouTube');
if (btnSyncYouTube) {
    btnSyncYouTube.addEventListener('click', async () => {
        if (!youtubeSync) {
            alert('YouTube API 설정이 필요합니다.\n\n1. js/youtube-config.js 파일 열기\n2. API_KEY와 CHANNEL_ID 입력\n3. YOUTUBE_API_GUIDE.md 참고');
            return;
        }
        
        btnSyncYouTube.disabled = true;
        btnSyncYouTube.innerHTML = '<span>⏳</span> 동기화 중...';
        
        try {
            const result = await youtubeSync.syncChannelData();
            alert(`YouTube 데이터가 성공적으로 동기화되었습니다!\n\n채널: ${result.channelName}`);
            
            // 페이지 새로고침
            await loadYouTubeData();
            renderYouTubeCharts();
            renderYouTubeTable();
            updateYouTubeSummary();
        } catch (error) {
            console.error('동기화 오류:', error);
            alert('동기화 실패:\n\n' + error.message + '\n\n자세한 내용은 콘솔을 확인하세요.');
        } finally {
            btnSyncYouTube.disabled = false;
            btnSyncYouTube.innerHTML = '<span>📺</span> YouTube 동기화';
        }
    });
}

// Initial load
loadYouTubeData();
loadLinkedInData();