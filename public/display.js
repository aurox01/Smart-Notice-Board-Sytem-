class NoticeBoard {
    constructor() {
        this.socket = io();
        this.noticesContainer = document.getElementById('noticesContainer');
        this.newNoticeAlert = document.getElementById('newNoticeAlert');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.departmentFilter = document.getElementById('departmentFilter');
        this.currentTime = document.getElementById('currentTime');
        
        this.notices = [];
        this.filteredNotices = [];
        
        this.init();
    }
    
    init() {
        this.loadNotices();
        this.setupSocketListeners();
        this.setupEventListeners();
        this.startClock();
    }
    
    async loadNotices() {
        try {
            this.showLoading();
            const response = await fetch('/api/notices');
            this.notices = await response.json();
            this.applyFilters();
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('Error loading notices:', error);
            this.showError('Failed to load notices');
        }
    }
    
    applyFilters() {
        const department = this.departmentFilter.value;
        
        if (department === 'all') {
            this.filteredNotices = this.notices;
        } else {
            this.filteredNotices = this.notices.filter(notice => 
                notice.department === department
            );
        }
        
        this.renderNotices();
    }
    
    renderNotices() {
        if (this.filteredNotices.length === 0) {
            this.noticesContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: white; font-size: 1.2em; padding: 40px;">
                    📭 No notices found
                </div>
            `;
            return;
        }
        
        this.noticesContainer.innerHTML = this.filteredNotices.map(notice => 
            `<div class="notice-card ${notice.priority}-priority">
                <div class="notice-title">
                    <span>${notice.title}</span>
                    <span class="priority-badge priority-${notice.priority}">${notice.priority}</span>
                </div>
                <div class="notice-content">${notice.content}</div>
                <div class="notice-meta">
                    <span>By: ${notice.author}</span>
                    <span>Dept: ${notice.department}</span>
                    <span>${new Date(notice.createdAt).toLocaleString()}</span>
                </div>
            </div>`
        ).join('');
    }
    
    setupSocketListeners() {
        this.socket.on('new-notice', (notice) => {
            console.log('New notice received:', notice);
            this.showNewNoticeAlert();
            this.loadNotices(); // Reload all notices
        });
        
        this.socket.on('delete-notice', (noticeId) => {
            console.log('Notice deleted:', noticeId);
            this.loadNotices();
        });
    }
    
    setupEventListeners() {
        this.refreshBtn.addEventListener('click', () => {
            this.loadNotices();
        });
        
        this.departmentFilter.addEventListener('change', () => {
            this.applyFilters();
        });
    }
    
    showNewNoticeAlert() {
        this.newNoticeAlert.style.display = 'block';
        setTimeout(() => {
            this.newNoticeAlert.style.display = 'none';
        }, 3000);
    }
    
    showLoading() {
        this.noticesContainer.innerHTML = `
            <div class="loading">🔄 Loading notices...</div>
        `;
    }
    
    showError(message) {
        this.noticesContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #e74c3c; font-size: 1.2em; padding: 40px;">
                ❌ ${message}
            </div>
        `;
    }
    
    startClock() {
        const updateClock = () => {
            this.currentTime.textContent = new Date().toLocaleString();
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    updateLastUpdateTime() {
        this.lastUpdate.textContent = new Date().toLocaleTimeString();
    }
}

// Initialize the notice board when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NoticeBoard();
});