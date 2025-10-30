class AdminPanel {
    constructor() {
        this.socket = io();
        this.noticeForm = document.getElementById('noticeForm');
        this.adminNoticesContainer = document.getElementById('adminNoticesContainer');
        this.refreshNoticesBtn = document.getElementById('refreshNotices');
        this.clearFormBtn = document.getElementById('clearForm');
        
        this.init();
    }
    
    init() {
        this.loadNotices();
        this.setupEventListeners();
        this.setupSocketListeners();
    }
    
    setupEventListeners() {
        this.noticeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNotice();
        });
        
        this.refreshNoticesBtn.addEventListener('click', () => {
            this.loadNotices();
        });
        
        this.clearFormBtn.addEventListener('click', () => {
            this.noticeForm.reset();
        });
    }
    
    setupSocketListeners() {
        this.socket.on('new-notice', (notice) => {
            console.log('📢 New notice received via socket:', notice);
            this.loadNotices();
        });
        
        this.socket.on('delete-notice', (noticeId) => {
            console.log('🗑️ Notice deleted via socket:', noticeId);
            this.loadNotices();
        });
    }
    
    async createNotice() {
        const formData = new FormData(this.noticeForm);
        const noticeData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            author: formData.get('author').trim(),
            department: formData.get('department'),
            priority: formData.get('priority')
        };
        
        // Validation
        if (!noticeData.title || !noticeData.content || !noticeData.author) {
            alert('❌ Please fill in all required fields (Title, Content, Author)');
            return;
        }
        
        try {
            console.log('📤 Creating notice:', noticeData);
            const response = await fetch('/api/notices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noticeData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('✅ Notice published successfully!');
                this.noticeForm.reset();
                console.log('✅ Notice created successfully:', result);
            } else {
                alert('❌ Error: ' + (result.error || 'Failed to create notice'));
                console.error('❌ Server error:', result);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            alert('❌ Network error - check console for details');
        }
    }
    
    async loadNotices() {
        try {
            this.showLoading();
            console.log('📥 Loading notices...');
            const response = await fetch('/api/notices');
            
            if (!response.ok) {
                throw new Error('Server returned ' + response.status);
            }
            
            const notices = await response.json();
            console.log('📋 Notices loaded:', notices.length);
            this.renderNotices(notices);
        } catch (error) {
            console.error('❌ Error loading notices:', error);
            this.showError('Failed to load notices: ' + error.message);
        }
    }
    
    renderNotices(notices) {
        if (notices.length === 0) {
            this.adminNoticesContainer.innerHTML = `
                <div class="no-notices" style="text-align: center; color: #7f8c8d; padding: 40px;">
                    📭 No active notices
                </div>
            `;
            return;
        }
        
        this.adminNoticesContainer.innerHTML = notices.map(notice => `
            <div class="notice-card ${notice.priority}-priority" data-id="${notice._id}">
                <div class="notice-title">
                    <span>${this.escapeHtml(notice.title)}</span>
                    <span class="priority-badge priority-${notice.priority}">
                        ${notice.priority}
                    </span>
                </div>
                <div class="notice-content">
                    ${this.escapeHtml(notice.content)}
                </div>
                <div class="notice-meta">
                    <span class="author">👤 ${this.escapeHtml(notice.author)}</span>
                    <span class="department">🏢 ${this.escapeHtml(notice.department)}</span>
                    <span class="time">🕒 ${new Date(notice.createdAt).toLocaleString()}</span>
                    <button class="btn btn-danger" onclick="adminPanel.deleteNotice('${notice._id}')">
                        🗑️ Delete
                    </button>
                </div>
                <div style="font-size: 0.8em; color: #999; margin-top: 8px;">
                    ID: ${notice._id}
                </div>
            </div>
        `).join('');
    }
    
    async deleteNotice(noticeId) {
        if (!confirm('Are you sure you want to delete this notice?')) {
            return;
        }
        
        console.log('🗑️ Attempting to delete notice:', noticeId);
        
        try {
            const response = await fetch(`/api/notices/${noticeId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log('✅ Delete successful:', result);
                // Socket will automatically refresh the list
            } else {
                console.error('❌ Delete failed:', result);
                alert('❌ Error: ' + (result.error || 'Failed to delete notice'));
            }
        } catch (error) {
            console.error('❌ Network error during delete:', error);
            alert('❌ Network error - check console for details');
        }
    }
    
    showLoading() {
        this.adminNoticesContainer.innerHTML = `
            <div class="loading">🔄 Loading notices...</div>
        `;
    }
    
    showError(message) {
        this.adminNoticesContainer.innerHTML = `
            <div class="error" style="text-align: center; color: #e74c3c; padding: 40px;">
                ❌ ${message}
            </div>
        `;
    }
    
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();