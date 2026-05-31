class App {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.currentProject = null;
        this.projects = [];
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.handleRoute();
        window.addEventListener('hashchange', () => this.handleRoute());
    }

    setupEventListeners() {
        document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    async checkAuth() {
        if (this.token) {
            try {
                const response = await this.apiRequest('/auth/me');
                if (response.status === 'success') {
                    this.user = response.data;
                    this.updateUserUI();
                    await this.loadProjects();
                } else {
                    this.logout();
                }
            } catch (error) {
                this.logout();
            }
        }
    }

    updateUserUI() {
        const userInfo = document.getElementById('userInfo');
        if (this.user) {
            userInfo.innerHTML = `
                <span>欢迎, ${this.user.username}</span>
                <button class="btn btn-secondary" id="logoutBtn">退出</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        } else {
            userInfo.innerHTML = `<button class="btn btn-primary" id="loginBtn">登录</button>`;
            document.getElementById('loginBtn').addEventListener('click', () => this.showModal('loginModal'));
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.updateUserUI();
        this.showToast('已退出登录', 'info');
        this.renderHome();
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await this.apiRequest('/auth/login', 'POST', { username, password });
            if (response.status === 'success') {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                this.hideModal('loginModal');
                this.updateUserUI();
                await this.loadProjects();
                this.showToast('登录成功', 'success');
                this.handleRoute();
            } else {
                this.showToast(response.message || '登录失败', 'error');
            }
        } catch (error) {
            this.showToast('登录失败: ' + error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await this.apiRequest('/auth/register', 'POST', { username, email, password });
            if (response.status === 'success') {
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                this.hideModal('registerModal');
                this.updateUserUI();
                await this.loadProjects();
                this.showToast('注册成功', 'success');
                this.handleRoute();
            } else {
                this.showToast(response.message || '注册失败', 'error');
            }
        } catch (error) {
            this.showToast('注册失败: ' + error.message, 'error');
        }
    }

    async loadProjects() {
        if (!this.token) return;
        
        try {
            const response = await this.apiRequest('/projects?pageSize=100');
            if (response.status === 'success') {
                this.projects = response.data;
                if (this.projects.length > 0 && !this.currentProject) {
                    this.currentProject = this.projects[0];
                }
            }
        } catch (error) {
            console.error('加载项目失败:', error);
        }
    }

    async apiRequest(endpoint, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const options = { method, headers };
        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`/api${endpoint}`, options);
        return await response.json();
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        let page = 'home';
        
        if (hash.startsWith('#/apis')) page = 'apis';
        else if (hash.startsWith('#/mock')) page = 'mock';
        else if (hash.startsWith('#/debug')) page = 'debug';
        else if (hash.startsWith('#/contract')) page = 'contract';
        else if (hash.startsWith('#/logs')) page = 'logs';

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        this.currentPage = page;
        this.renderPage(page);
    }

    renderPage(page) {
        const container = document.getElementById('pageContainer');
        
        switch(page) {
            case 'home':
                this.renderHome();
                break;
            case 'apis':
                this.renderApis();
                break;
            case 'mock':
                this.renderMock();
                break;
            case 'debug':
                this.renderDebug();
                break;
            case 'contract':
                this.renderContract();
                break;
            case 'logs':
                this.renderLogs();
                break;
            default:
                this.renderHome();
        }
    }

    renderHome() {
        const container = document.getElementById('pageContainer');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>欢迎使用 API Mock与契约测试平台</h2>
                </div>
                <div style="padding: 40px 0; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🚀</div>
                    <h2 style="margin-bottom: 20px;">前后端并行开发的最佳解决方案</h2>
                    <p style="color: #6b7280; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">
                        后端接口未就绪？前端被阻塞？使用我们的平台快速生成Mock数据，
                        支持契约校验，让你的团队开发效率翻倍！
                    </p>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <h3>接口定义</h3>
                    <div class="value">${this.user ? '支持OpenAPI导入' : '请先登录'}</div>
                </div>
                <div class="stat-card">
                    <h3>Mock规则</h3>
                    <div class="value">随机/模板/条件</div>
                </div>
                <div class="stat-card">
                    <h3>场景切换</h3>
                    <div class="value">一键切换</div>
                </div>
                <div class="stat-card">
                    <h3>契约校验</h3>
                    <div class="value">Schema对比</div>
                </div>
            </div>

            <div class="card">
                <h3 style="margin-bottom: 20px;">核心功能</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 24px; margin-bottom: 10px;">📋</div>
                        <h4 style="margin-bottom: 8px;">接口管理</h4>
                        <p style="color: #6b7280; font-size: 14px;">支持OpenAPI 2.0/3.x导入，自动解析接口定义</p>
                    </div>
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 24px; margin-bottom: 10px;">🎲</div>
                        <h4 style="margin-bottom: 8px;">动态Mock</h4>
                        <p style="color: #6b7280; font-size: 14px;">支持Faker语法、条件规则、响应延迟模拟</p>
                    </div>
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
                        <h4 style="margin-bottom: 8px;">契约校验</h4>
                        <p style="color: #6b7280; font-size: 14px;">基于Schema的契约校验，确保接口一致性</p>
                    </div>
                    <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
                        <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
                        <h4 style="margin-bottom: 8px;">调用日志</h4>
                        <p style="color: #6b7280; font-size: 14px;">完整的请求响应日志，便于调试分析</p>
                    </div>
                </div>
            </div>
        `;
    }

    async renderApis() {
        const container = document.getElementById('pageContainer');
        
        if (!this.user) {
            container.innerHTML = `<div class="card"><div style="text-align: center; padding: 60px;"><p style="margin-bottom: 20px;">请先登录以查看接口列表</p><button class="btn btn-primary" onclick="app.showModal('loginModal')">立即登录</button></div></div>`;
            return;
        }

        container.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

        try {
            const projectSelector = this.currentProject ? this.renderProjectSelector() : '';
            
            let apisHtml = '';
            if (this.currentProject) {
                const response = await this.apiRequest(`/apis?projectId=${this.currentProject.id}&pageSize=100`);
                if (response.status === 'success') {
                    const apis = response.data;
                    apisHtml = apis.length === 0 ? this.renderEmptyState('暂无接口') : this.renderApiTable(apis);
                }
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>接口列表</h2>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-primary" onclick="app.showImportModal()">导入OpenAPI</button>
                            <button class="btn btn-success" onclick="app.showApiModal()">添加接口</button>
                        </div>
                    </div>
                    ${projectSelector}
                    ${apisHtml}
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="card"><p style="color: #ef4444;">加载失败: ${error.message}</p></div>`;
        }
    }

    renderProjectSelector() {
        const options = this.projects.map(p => 
            `<option value="${p.id}" ${p.id === this.currentProject?.id ? 'selected' : ''}>${p.name}</option>`
        ).join('');
        
        return `
            <div class="project-selector">
                <select onchange="app.switchProject(this.value)">
                    ${options}
                </select>
            </div>
        `;
    }

    switchProject(projectId) {
        this.currentProject = this.projects.find(p => p.id === parseInt(projectId));
        this.renderApis();
    }

    renderApiTable(apis) {
        const rows = apis.map(api => `
            <tr>
                <td><span class="method-badge method-${api.method.toLowerCase()}">${api.method}</span></td>
                <td><code>${api.path}</code></td>
                <td>${api.summary || '-'}</td>
                <td>${api.tags ? api.tags.split(',').map(t => `<span class="tag">${t}</span>`).join('') : '-'}</td>
                <td>${api.rule_count || 0} 条规则</td>
                <td class="actions">
                    <button class="btn btn-primary" onclick="app.editApi(${api.id})">编辑</button>
                    <button class="btn btn-danger" onclick="app.deleteApi(${api.id})">删除</button>
                </td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>方法</th>
                        <th>路径</th>
                        <th>描述</th>
                        <th>标签</th>
                        <th>规则数</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }

    async renderMock() {
        const container = document.getElementById('pageContainer');
        
        if (!this.user) {
            container.innerHTML = `<div class="card"><div style="text-align: center; padding: 60px;"><p style="margin-bottom: 20px;">请先登录以管理Mock规则</p><button class="btn btn-primary" onclick="app.showModal('loginModal')">立即登录</button></div></div>`;
            return;
        }

        container.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

        try {
            let scenariosHtml = '';
            let rulesHtml = '';
            
            if (this.currentProject) {
                const scenariosResponse = await this.apiRequest(`/mock/scenarios?projectId=${this.currentProject.id}`);
                if (scenariosResponse.status === 'success') {
                    scenariosHtml = this.renderScenarios(scenariosResponse.data);
                }

                const rulesResponse = await this.apiRequest(`/mock/rules?apiId=1&pageSize=100`);
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>Mock场景管理</h2>
                        <button class="btn btn-primary" onclick="app.showScenarioModal()">创建场景</button>
                    </div>
                    ${this.currentProject ? this.renderProjectSelector() : ''}
                    ${scenariosHtml || this.renderEmptyState('暂无场景')}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>Mock规则</h2>
                        <button class="btn btn-primary" onclick="app.showRuleModal()">创建规则</button>
                    </div>
                    <div style="color: #6b7280; margin-bottom: 20px;">
                        <p><strong>支持的规则类型：</strong></p>
                        <ul style="margin: 10px 0 0 20px;">
                            <li><strong>template (模板)</strong>: 固定响应模板，支持 <code>\${request.body.name}</code> 请求变量</li>
                            <li><strong>random (随机)</strong>: 使用Faker语法，如 <code>{{name.findName}}</code>, <code>{{internet.email}}</code></li>
                            <li><strong>conditional (条件)</strong>: 根据请求参数匹配不同响应</li>
                        </ul>
                    </div>
                    ${this.renderEmptyState('选择接口后可查看和管理Mock规则')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="card"><p style="color: #ef4444;">加载失败: ${error.message}</p></div>`;
        }
    }

    renderScenarios(scenarios) {
        if (!scenarios || scenarios.length === 0) {
            return this.renderEmptyState('暂无场景');
        }

        const rows = scenarios.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.description || '-'}</td>
                <td><span class="status-badge ${s.is_active ? 'status-success' : 'status-info'}">${s.is_active ? '已激活' : '未激活'}</span></td>
                <td>${s.is_default ? '<span class="tag">默认</span>' : '-'}</td>
                <td class="actions">
                    ${!s.is_active ? `<button class="btn btn-success" onclick="app.activateScenario(${s.id})">激活</button>` : ''}
                    <button class="btn btn-danger" onclick="app.deleteScenario(${s.id})">删除</button>
                </td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>场景名称</th>
                        <th>描述</th>
                        <th>状态</th>
                        <th>默认</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    async activateScenario(id) {
        const response = await this.apiRequest(`/mock/scenarios/${id}/activate`, 'POST');
        if (response.status === 'success') {
            this.showToast('场景已激活', 'success');
            this.renderMock();
        } else {
            this.showToast(response.message || '激活失败', 'error');
        }
    }

    async renderDebug() {
        const container = document.getElementById('pageContainer');
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h2>接口调试</h2>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>请求方法</label>
                        <select id="debugMethod">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                            <option value="PATCH">PATCH</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>项目ID (X-Project-ID)</label>
                        <input type="text" id="debugProjectId" value="${this.currentProject?.id || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>请求路径</label>
                    <input type="text" id="debugPath" placeholder="/api/v1/users" value="/users">
                </div>
                <div class="form-group">
                    <label>请求头 (JSON)</label>
                    <textarea class="json-editor" id="debugHeaders">{}</textarea>
                </div>
                <div class="form-group">
                    <label>请求体 (JSON)</label>
                    <textarea class="json-editor" id="debugBody">{}</textarea>
                </div>
                <button class="btn btn-primary" onclick="app.sendDebugRequest()">发送请求</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h2>响应结果</h2>
                </div>
                <div id="debugResponse" style="min-height: 200px;">
                    <p style="color: #9ca3af;">发送请求后将在此显示响应结果</p>
                </div>
            </div>
        `;
    }

    async sendDebugRequest() {
        const method = document.getElementById('debugMethod').value;
        const projectId = document.getElementById('debugProjectId').value;
        const path = document.getElementById('debugPath').value;
        
        let headers = {};
        let body = {};
        
        try {
            headers = JSON.parse(document.getElementById('debugHeaders').value);
        } catch (e) {}
        
        try {
            body = JSON.parse(document.getElementById('debugBody').value);
        } catch (e) {}

        headers['X-Project-ID'] = projectId;

        const responseDiv = document.getElementById('debugResponse');
        responseDiv.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            const startTime = Date.now();
            const options = {
                method,
                headers: { 'Content-Type': 'application/json', ...headers }
            };
            
            if (method !== 'GET' && method !== 'HEAD') {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`/mock${path}`, options);
            const responseTime = Date.now() - startTime;
            const responseData = await response.json();

            responseDiv.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <span class="status-badge ${response.ok ? 'status-success' : 'status-error'}">${response.status}</span>
                    <span style="margin-left: 10px; color: #6b7280;">响应时间: ${responseTime}ms</span>
                </div>
                <div class="log-detail">${JSON.stringify(responseData, null, 2)}</div>
            `;
        } catch (error) {
            responseDiv.innerHTML = `<p style="color: #ef4444;">请求失败: ${error.message}</p>`;
        }
    }

    async renderContract() {
        const container = document.getElementById('pageContainer');
        
        if (!this.user) {
            container.innerHTML = `<div class="card"><div style="text-align: center; padding: 60px;"><p style="margin-bottom: 20px;">请先登录以使用契约校验功能</p><button class="btn btn-primary" onclick="app.showModal('loginModal')">立即登录</button></div></div>`;
            return;
        }

        container.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

        try {
            let testsHtml = '';
            if (this.currentProject) {
                const response = await this.apiRequest(`/contract/tests?projectId=${this.currentProject.id}&pageSize=100`);
                if (response.status === 'success') {
                    testsHtml = this.renderContractTests(response.data);
                }
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>契约校验</h2>
                        <button class="btn btn-primary" onclick="app.showContractTestModal()">创建测试</button>
                    </div>
                    ${this.currentProject ? this.renderProjectSelector() : ''}
                    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                        <p style="color: #166534; margin: 0;">
                            <strong>💡 提示：</strong>契约校验功能会自动验证API的请求和响应是否符合预定义的Schema规范，
                            确保前后端开发遵循相同的接口契约。
                        </p>
                    </div>
                    ${testsHtml || this.renderEmptyState('暂无测试')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="card"><p style="color: #ef4444;">加载失败: ${error.message}</p></div>`;
        }
    }

    renderContractTests(tests) {
        if (!tests || tests.length === 0) {
            return this.renderEmptyState('暂无测试');
        }

        const rows = tests.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.description || '-'}</td>
                <td>${t.last_status ? `<span class="status-badge ${t.last_status === 'passed' ? 'status-success' : 'status-error'}">${t.last_status}</span>` : '-'}</td>
                <td>${t.last_run_at || '未运行'}</td>
                <td class="actions">
                    <button class="btn btn-success" onclick="app.runContractTest(${t.id})">运行</button>
                    <button class="btn btn-primary" onclick="app.viewReports(${t.id})">报告</button>
                </td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>测试名称</th>
                        <th>描述</th>
                        <th>上次状态</th>
                        <th>上次运行</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    async runContractTest(id) {
        this.showToast('测试运行中...', 'info');
        const response = await this.apiRequest(`/contract/tests/${id}/run`, 'POST');
        if (response.status === 'success') {
            this.showToast(`测试完成: ${response.data.status}`, response.data.status === 'passed' ? 'success' : 'warning');
            this.renderContract();
        } else {
            this.showToast(response.message || '测试失败', 'error');
        }
    }

    async viewReports(testId) {
        const response = await this.apiRequest(`/contract/reports?testId=${testId}&pageSize=10`);
        if (response.status === 'success' && response.data.length > 0) {
            const reportId = response.data[0].id;
            const detailResponse = await this.apiRequest(`/contract/reports/${reportId}`);
            if (detailResponse.status === 'success') {
                const report = detailResponse.data;
                alert(`报告摘要:\n总数: ${report.summary?.total || 0}\n通过: ${report.summary?.passed || 0}\n失败: ${report.summary?.failed || 0}\n耗时: ${report.duration_ms || 0}ms`);
            }
        } else {
            this.showToast('暂无报告', 'info');
        }
    }

    async renderLogs() {
        const container = document.getElementById('pageContainer');
        
        if (!this.user) {
            container.innerHTML = `<div class="card"><div style="text-align: center; padding: 60px;"><p style="margin-bottom: 20px;">请先登录以查看调用日志</p><button class="btn btn-primary" onclick="app.showModal('loginModal')">立即登录</button></div></div>`;
            return;
        }

        container.innerHTML = `<div class="loading"><div class="spinner"></div></div>`;

        try {
            let logsHtml = '';
            let statsHtml = '';
            
            if (this.currentProject) {
                const statsResponse = await this.apiRequest(`/logs/statistics?projectId=${this.currentProject.id}`);
                if (statsResponse.status === 'success') {
                    const stats = statsResponse.data;
                    statsHtml = `
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>总请求数</h3>
                                <div class="value">${stats.total || 0}</div>
                            </div>
                            <div class="stat-card">
                                <h3>成功请求</h3>
                                <div class="value" style="color: #10b981;">${stats.success || 0}</div>
                            </div>
                            <div class="stat-card">
                                <h3>错误请求</h3>
                                <div class="value" style="color: #ef4444;">${stats.error || 0}</div>
                            </div>
                            <div class="stat-card">
                                <h3>平均响应时间</h3>
                                <div class="value">${Math.round(stats.avgResponseTime || 0)}ms</div>
                            </div>
                        </div>
                    `;
                }

                const logsResponse = await this.apiRequest(`/logs/access?projectId=${this.currentProject.id}&pageSize=50`);
                if (logsResponse.status === 'success') {
                    logsHtml = this.renderLogsTable(logsResponse.data);
                }
            }

            container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h2>调用统计</h2>
                    </div>
                    ${this.currentProject ? this.renderProjectSelector() : ''}
                    ${statsHtml || ''}
                </div>

                <div class="card">
                    <div class="card-header">
                        <h2>访问日志</h2>
                    </div>
                    ${logsHtml || this.renderEmptyState('暂无日志')}
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="card"><p style="color: #ef4444;">加载失败: ${error.message}</p></div>`;
        }
    }

    renderLogsTable(logs) {
        if (!logs || logs.length === 0) {
            return this.renderEmptyState('暂无日志');
        }

        const rows = logs.slice(0, 50).map(log => `
            <tr>
                <td><span class="method-badge method-${log.request_method.toLowerCase()}">${log.request_method}</span></td>
                <td><code style="font-size: 12px;">${log.request_path}</code></td>
                <td><span class="status-badge ${log.response_status >= 200 && log.response_status < 300 ? 'status-success' : 'status-error'}">${log.response_status || '-'}</span></td>
                <td>${log.response_time_ms || 0}ms</td>
                <td>${log.is_from_cache ? '<span class="tag">缓存</span>' : '-'}</td>
                <td><small>${log.created_at}</small></td>
            </tr>
        `).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>方法</th>
                        <th>路径</th>
                        <th>状态</th>
                        <th>耗时</th>
                        <th>来源</th>
                        <th>时间</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    }

    showApiModal() {
        this.showToast('请先选择项目', 'info');
    }

    showImportModal() {
        if (!this.currentProject) {
            this.showToast('请先选择项目', 'info');
            return;
        }
        
        const url = prompt('请输入OpenAPI文档URL (支持JSON/YAML):');
        if (url) {
            this.importOpenAPI(url);
        }
    }

    async importOpenAPI(url) {
        this.showToast('正在导入...', 'info');
        const response = await this.apiRequest('/apis/import/openapi', 'POST', {
            projectId: this.currentProject.id,
            url
        });
        
        if (response.status === 'success') {
            this.showToast(`导入完成: ${response.data.imported}/${response.data.total} 个接口`, 'success');
            this.renderApis();
        } else {
            this.showToast(response.message || '导入失败', 'error');
        }
    }

    showScenarioModal() {
        const name = prompt('请输入场景名称:');
        if (name && this.currentProject) {
            this.createScenario(name);
        }
    }

    async createScenario(name) {
        const response = await this.apiRequest('/mock/scenarios', 'POST', {
            projectId: this.currentProject.id,
            name,
            description: '',
            isActive: false
        });
        
        if (response.status === 'success') {
            this.showToast('场景创建成功', 'success');
            this.renderMock();
        } else {
            this.showToast(response.message || '创建失败', 'error');
        }
    }

    showRuleModal() {
        this.showToast('请先在接口列表中选择一个接口', 'info');
    }

    showContractTestModal() {
        const name = prompt('请输入测试名称:');
        if (name && this.currentProject) {
            this.createContractTest(name);
        }
    }

    async createContractTest(name) {
        const response = await this.apiRequest('/contract/tests', 'POST', {
            projectId: this.currentProject.id,
            name,
            description: '全量契约测试',
            testConfig: {}
        });
        
        if (response.status === 'success') {
            this.showToast('测试创建成功', 'success');
            this.renderContract();
        } else {
            this.showToast(response.message || '创建失败', 'error');
        }
    }

    async editApi(id) {
        this.showToast('编辑功能开发中', 'info');
    }

    async deleteApi(id) {
        if (confirm('确定要删除这个接口吗？')) {
            const response = await this.apiRequest(`/apis/${id}`, 'DELETE');
            if (response.status === 'success') {
                this.showToast('删除成功', 'success');
                this.renderApis();
            } else {
                this.showToast(response.message || '删除失败', 'error');
            }
        }
    }

    async deleteScenario(id) {
        if (confirm('确定要删除这个场景吗？')) {
            this.showToast('删除功能开发中', 'info');
        }
    }
}

const app = new App();
