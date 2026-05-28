const Common = {
    API_BASE: '/api',

    getToken() {
        return localStorage.getItem('token');
    },

    setToken(token) {
        localStorage.setItem('token', token);
    },

    removeToken() {
        localStorage.removeItem('token');
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    removeUser() {
        localStorage.removeItem('user');
    },

    isLoggedIn() {
        return !!this.getToken() && !!this.getUser();
    },

    logout() {
        this.removeToken();
        this.removeUser();
    },

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    initNavbar() {
        const currentPage = location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-menu a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });

        this.updateUserNav();

        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        if (mobileBtn && navMenu) {
            mobileBtn.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-open');
            });
        }
    },

    updateUserNav() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            const initial = (user.nickname || user.username || 'U').charAt(0).toUpperCase();
            navActions.innerHTML = `
                <div class="user-info" onclick="Common.handleUserMenu()">
                    <div class="avatar">${initial}</div>
                    <span>${user.nickname || user.username}</span>
                </div>
            `;
        } else {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-ghost">登录</a>
                <a href="register.html" class="btn btn-primary">注册</a>
            `;
        }
    },

    handleUserMenu() {
        const action = confirm('是否退出登录？');
        if (action) {
            this.logout();
            this.showToast('已退出登录', 'success');
            this.updateUserNav();
            setTimeout(() => location.reload(), 1000);
        }
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            this.showToast('请先登录', 'warning');
            setTimeout(() => {
                location.href = `login.html?redirect=${encodeURIComponent(location.pathname)}`;
            }, 1000);
            return false;
        }
        return true;
    },

    getQueryParam(name) {
        const params = new URLSearchParams(location.search);
        return params.get(name);
    },

    init() {
        this.initNavbar();
    }
};

document.addEventListener('DOMContentLoaded', () => Common.init());
