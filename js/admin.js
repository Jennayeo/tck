// Admin Dashboard JavaScript

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

// Current section state
let currentSection = 'hero';
let contentData = {};

// Section titles
const sectionTitles = {
    hero: '히어로 섹션',
    capabilities: '핵심 역량',
    innovation: '혁신 기술',
    stats: '통계',
    about: '회사소개',
    location: '오시는 길'
};

// Load content from database
async function loadContent(section) {
    try {
        const response = await fetch(`tables/site_content?search=${section}&limit=100`);
        const result = await response.json();
        
        if (result.data) {
            contentData[section] = result.data.filter(item => item.section === section);
            contentData[section].sort((a, b) => a.order - b.order);
            renderContent(section);
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Render content form based on section
function renderContent(section) {
    const contentBody = document.getElementById('contentBody');
    const sectionTitle = document.getElementById('sectionTitle');
    
    sectionTitle.textContent = sectionTitles[section] || section;
    
    const items = contentData[section] || [];
    
    if (items.length === 0) {
        contentBody.innerHTML = '<div class="empty-state"><h3>컨텐츠가 없습니다</h3></div>';
        return;
    }
    
    let html = '';
    
    // Group by subsection for better organization
    if (section === 'hero') {
        html = renderHeroForm(items);
    } else if (section === 'capabilities') {
        html = renderCapabilitiesForm(items);
    } else if (section === 'innovation') {
        html = renderInnovationForm(items);
    } else if (section === 'stats') {
        html = renderStatsForm(items);
    } else if (section === 'about') {
        html = renderAboutForm(items);
    } else if (section === 'location') {
        html = renderLocationForm(items);
    }
    
    contentBody.innerHTML = html;
}

// Hero section form
function renderHeroForm(items) {
    return `
        <div class="form-section">
            <h3 class="form-section-title">메인 메시지</h3>
            ${items.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    ${item.type === 'text' && item.key.includes('description') 
                        ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                        : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                    }
                </div>
            `).join('')}
        </div>
    `;
}

// Capabilities section form
function renderCapabilitiesForm(items) {
    const title = items.filter(i => i.key === 'title' || i.key === 'subtitle');
    const cards = [1, 2, 3, 4].map(n => {
        return items.filter(i => i.key.includes(`card${n}`));
    });
    
    return `
        <div class="form-section">
            <h3 class="form-section-title">섹션 제목</h3>
            ${title.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    <input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">
                </div>
            `).join('')}
        </div>
        ${cards.map((cardItems, index) => `
            <div class="form-section">
                <h3 class="form-section-title">카드 ${index + 1}</h3>
                ${cardItems.map(item => `
                    <div class="form-group">
                        <label for="${item.id}">${getFieldLabel(item.key)}</label>
                        ${item.key.includes('desc')
                            ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                            : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                        }
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
}

// Innovation section form
function renderInnovationForm(items) {
    const header = items.filter(i => i.key === 'title' || i.key === 'description');
    const features = [1, 2, 3].map(n => {
        return items.filter(i => i.key.includes(`feature${n}`));
    });
    
    return `
        <div class="form-section">
            <h3 class="form-section-title">섹션 헤더</h3>
            ${header.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    ${item.key === 'description'
                        ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                        : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                    }
                </div>
            `).join('')}
        </div>
        ${features.map((featureItems, index) => `
            <div class="form-section">
                <h3 class="form-section-title">기술 ${index + 1}</h3>
                ${featureItems.map(item => `
                    <div class="form-group">
                        <label for="${item.id}">${getFieldLabel(item.key)}</label>
                        ${item.key.includes('desc')
                            ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                            : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                        }
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
}

// Stats section form
function renderStatsForm(items) {
    const stats = [1, 2, 3, 4].map(n => {
        return items.filter(i => i.key.includes(`stat${n}`));
    });
    
    return `
        <div class="form-grid">
            ${stats.map((statItems, index) => `
                <div class="form-section">
                    <h3 class="form-section-title">통계 ${index + 1}</h3>
                    ${statItems.map(item => `
                        <div class="form-group">
                            <label for="${item.id}">${getFieldLabel(item.key)}</label>
                            <input type="${item.type === 'number' ? 'number' : 'text'}" 
                                   id="${item.id}" 
                                   data-id="${item.id}" 
                                   data-key="${item.key}" 
                                   value="${item.value}">
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    `;
}

// About section form
function renderAboutForm(items) {
    const header = items.filter(i => !i.key.includes('list'));
    const listItems = items.filter(i => i.key.includes('list'));
    
    return `
        <div class="form-section">
            <h3 class="form-section-title">섹션 헤더</h3>
            ${header.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    ${item.key === 'description'
                        ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                        : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                    }
                </div>
            `).join('')}
        </div>
        <div class="form-section">
            <h3 class="form-section-title">주요 특징 리스트</h3>
            ${listItems.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    <input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">
                </div>
            `).join('')}
        </div>
    `;
}

// Location section form
function renderLocationForm(items) {
    return `
        <div class="form-section">
            ${items.map(item => `
                <div class="form-group">
                    <label for="${item.id}">${getFieldLabel(item.key)}</label>
                    ${item.key === 'description'
                        ? `<textarea id="${item.id}" data-id="${item.id}" data-key="${item.key}">${item.value}</textarea>`
                        : `<input type="text" id="${item.id}" data-id="${item.id}" data-key="${item.key}" value="${item.value}">`
                    }
                </div>
            `).join('')}
        </div>
    `;
}

// Get user-friendly field labels
function getFieldLabel(key) {
    const labels = {
        title: '제목',
        title_main: '메인 제목',
        title_sub: '서브 제목',
        subtitle: '부제목',
        description: '설명',
        label: '라벨',
        address: '주소',
        phone: '전화번호',
        email: '이메일'
    };
    
    if (labels[key]) return labels[key];
    
    if (key.includes('card') && key.includes('title')) return '카드 제목';
    if (key.includes('card') && key.includes('desc')) return '카드 설명';
    if (key.includes('feature') && key.includes('title')) return '기술 제목';
    if (key.includes('feature') && key.includes('desc')) return '기술 설명';
    if (key.includes('stat') && key.includes('number')) return '숫자';
    if (key.includes('stat') && key.includes('label')) return '라벨';
    if (key.includes('list')) return key.replace('list', '항목 ');
    
    return key;
}

// Save content
async function saveContent() {
    const inputs = document.querySelectorAll('input, textarea');
    const updates = [];
    
    for (const input of inputs) {
        const id = input.dataset.id;
        const value = input.value;
        
        if (id) {
            updates.push(
                fetch(`tables/site_content/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value })
                })
            );
        }
    }
    
    try {
        await Promise.all(updates);
        showSuccessMessage();
        await loadContent(currentSection); // Reload to confirm changes
    } catch (error) {
        console.error('Error saving content:', error);
        alert('저장 중 오류가 발생했습니다.');
    }
}

// Show success message
function showSuccessMessage() {
    const message = document.getElementById('successMessage');
    message.classList.add('show');
    setTimeout(() => {
        message.classList.remove('show');
    }, 3000);
}

// Menu item click handler
document.querySelectorAll('.menu-item').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        // Load content
        currentSection = button.dataset.section;
        loadContent(currentSection);
    });
});

// Save button click handler
document.getElementById('btnSave').addEventListener('click', saveContent);

// Initial load
loadContent(currentSection);