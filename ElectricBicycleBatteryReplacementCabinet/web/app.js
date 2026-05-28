const API_BASE = '/api';
axios.defaults.baseURL = API_BASE;

new Vue({
    el: '#app',
    data() {
        return {
            currentPage: 'dashboard',
            pageTitle: '数据概览',
            loading: false,
            map: null,
            markers: [],
            stats: {},
            cabinets: [],
            batteries: [],
            orders: [],
            dispatchTasks: [],
            gaps: [],
            dispatchPlan: [],
            packages: [],
            userPackages: [],
            alerts: [],
            recentOrders: [],
            recentAlerts: [],
            operators: [],
            wallet: null,
            transactions: [],
            alertStats: null,

            batteryFilter: { battery_no: '', status: null, min_soc: 0 },
            batteryPage: 1,
            batteryPageSize: 12,
            batteryTotal: 0,

            orderFilter: { order_no: '', order_status: null, pay_status: null },
            orderPage: 1,
            orderPageSize: 10,
            orderTotal: 0,

            alertFilter: { type: null, level: null, status: null },
            alertPage: 1,
            alertPageSize: 10,
            alertTotal: 0,

            planParams: {
                max_batteries: 10,
                operator_longitude: 116.403874,
                operator_latitude: 39.916666
            },

            cabinetDetailVisible: false,
            currentCabinet: null,
            cabinetSlots: [],
            cabinetBatteries: [],

            batteryDetailVisible: false,
            currentBattery: null,

            assignTaskVisible: false,
            currentTask: null,
            assignForm: { operator_id: null },

            completeTaskVisible: false,
            completeForm: { battery_ids: '' },

            handleAlertVisible: false,
            currentAlert: null,
            handleAlertForm: { status: 3, handle_result: '' },

            rechargeVisible: false,
            rechargeForm: { amount: 100, pay_type: 1 },

            pageTitles: {
                'dashboard': '数据概览',
                'map': '换电柜地图',
                'battery': '电池监控',
                'order': '换电订单',
                'dispatch': '调度补给',
                'package': '套餐钱包',
                'alert': '异常告警'
            }
        };
    },
    mounted() {
        this.loadDashboard();
    },
    methods: {
        formatNumber(val, decimals = 2) {
            if (val === null || val === undefined || isNaN(val)) return '0.00';
            return Number(val).toFixed(decimals);
        },
        handleMenuSelect(index) {
            this.currentPage = index;
            this.pageTitle = this.pageTitles[index] || '数据概览';
            this.$nextTick(() => {
                if (index === 'dashboard') {
                    this.loadDashboard();
                } else if (index === 'map') {
                    this.loadCabinets();
                    setTimeout(() => this.initMap(), 100);
                } else if (index === 'battery') {
                    this.loadBatteries();
                } else if (index === 'order') {
                    this.loadOrders();
                } else if (index === 'dispatch') {
                    this.loadDispatchTasks();
                    this.loadGaps();
                    this.loadOperators();
                } else if (index === 'package') {
                    this.loadPackages();
                    this.loadWallet();
                    this.loadUserPackages();
                    this.loadTransactions();
                } else if (index === 'alert') {
                    this.loadAlerts();
                    this.loadAlertStats();
                }
            });
        },

        refresh() {
            this.handleMenuSelect(this.currentPage);
        },

        async request(method, url, data) {
            try {
                this.loading = true;
                const res = await axios({ method, url, data });
                if (res.data.code === 0) {
                    return res.data.data;
                } else {
                    this.$message.error(res.data.message || '请求失败');
                    return null;
                }
            } catch (err) {
                this.$message.error(err.message || '网络错误');
                return null;
            } finally {
                this.loading = false;
            }
        },

        async loadDashboard() {
            const [cabinetStats, batteryStats, orderStats, alertStats] = await Promise.all([
                this.request('get', '/cabinet/stats'),
                this.request('get', '/battery/stats'),
                this.request('get', '/order/stats'),
                this.request('get', '/alert/stats')
            ]);
            this.stats = {
                cabinet: cabinetStats,
                battery: batteryStats,
                order: orderStats,
                alert: alertStats
            };

            const orders = await this.request('get', '/order/list?page=1&page_size=5&order_status=2');
            this.recentOrders = orders ? orders.list : [];

            const alerts = await this.request('get', '/alert/list?page=1&page_size=5&status=1');
            this.recentAlerts = alerts ? alerts.list : [];

            this.$nextTick(() => {
                this.renderCharts();
            });
        },

        renderCharts() {
            if (this.stats.battery) {
                const batteryChart = echarts.init(document.getElementById('batteryChart'));
                batteryChart.setOption({
                    tooltip: { trigger: 'item' },
                    legend: { bottom: '0%', left: 'center' },
                    series: [{
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                        label: { show: false, position: 'center' },
                        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
                        labelLine: { show: false },
                        data: [
                            { value: this.stats.battery.AvailableCount || 0, name: '可用', itemStyle: { color: '#67c23a' } },
                            { value: this.stats.battery.InUseCount || 0, name: '使用中', itemStyle: { color: '#409eff' } },
                            { value: this.stats.battery.ChargingCount || 0, name: '充电中', itemStyle: { color: '#e6a23c' } },
                            { value: this.stats.battery.AbnormalCount || 0, name: '异常', itemStyle: { color: '#f56c6c' } },
                            { value: this.stats.battery.OfflineCount || 0, name: '下线', itemStyle: { color: '#909399' } }
                        ]
                    }]
                });
            }

            const orderChart = echarts.init(document.getElementById('orderChart'));
            const days = [];
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                days.push(`${d.getMonth() + 1}/${d.getDate()}`);
            }
            orderChart.setOption({
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: days },
                yAxis: { type: 'value', name: '订单数' },
                series: [{
                    data: [12, 15, 18, 22, 19, 25, this.stats.order ? this.stats.order.TodayOrders : 0],
                    type: 'line',
                    smooth: true,
                    itemStyle: { color: '#667eea' },
                    areaStyle: { color: 'rgba(102, 126, 234, 0.3)' }
                }]
            });
        },

        initMap() {
            if (this.map) {
                this.map.remove();
            }
            this.map = L.map('map').setView([39.9042, 116.4074], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
        },

        async loadCabinets() {
            const data = await this.request('get', '/cabinet/map');
            this.cabinets = data || [];
            this.$nextTick(() => {
                this.updateMapMarkers();
            });
        },

        updateMapMarkers() {
            this.markers.forEach(m => this.map.removeLayer(m));
            this.markers = [];

            this.cabinets.forEach(cabinet => {
                if (!cabinet.latitude || !cabinet.longitude) return;

                let color = '#67c23a';
                if (cabinet.status === 2) color = '#909399';
                if (cabinet.status === 3) color = '#f56c6c';

                const icon = L.divIcon({
                    html: `<div style="width: 40px; height: 40px; background: ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 14px; border: 3px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🔋</div>`,
                    className: 'custom-marker',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                const marker = L.marker([cabinet.latitude, cabinet.longitude], { icon }).addTo(this.map);
                marker.bindPopup(`
                    <div class="marker-popup">
                        <h4>${cabinet.name}</h4>
                        <p>${cabinet.address}</p>
                        <p>满电电池: <span style="color:#67c23a;font-weight:bold">${cabinet.full_batteries}</span></p>
                        <p>空槽位: <span style="color:#909399;font-weight:bold">${cabinet.empty_slots}</span></p>
                        <p>低电量: <span style="color:#f56c6c;font-weight:bold">${cabinet.low_batteries}</span></p>
                    </div>
                `);
                this.markers.push(marker);
            });

            if (this.cabinets.length > 0) {
                const bounds = [];
                this.cabinets.forEach(c => {
                    if (c.latitude && c.longitude) bounds.push([c.latitude, c.longitude]);
                });
                if (bounds.length > 0) this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        },

        async showCabinetDetail(cabinet) {
            this.currentCabinet = cabinet;
            this.cabinetDetailVisible = true;

            const [detail, slots, batteries] = await Promise.all([
                this.request('get', `/cabinet/${cabinet.id}`),
                this.request('get', `/cabinet/${cabinet.id}/slots`),
                this.request('get', `/cabinet/${cabinet.id}/batteries`)
            ]);

            if (detail) this.currentCabinet = detail;
            this.cabinetSlots = slots || [];
            this.cabinetBatteries = batteries || [];
        },

        getSlotClass(slot) {
            if (slot.status === 0 || slot.battery_id === 0) return 'slot-empty';
            const bat = this.cabinetBatteries.find(b => b.id === slot.battery_id);
            if (!bat) return 'slot-empty';
            if (bat.current_soc >= 80) return 'slot-full';
            if (bat.current_soc >= 30) return 'slot-medium';
            return 'slot-low';
        },

        showSlotDetail(slot) {
            if (slot.battery_id) {
                const bat = this.cabinetBatteries.find(b => b.id === slot.battery_id);
                if (bat) {
                    this.showBatteryDetail(bat);
                }
            }
        },

        async loadBatteries() {
            const params = new URLSearchParams({
                page: this.batteryPage,
                page_size: this.batteryPageSize,
                ...this.batteryFilter
            });
            const data = await this.request('get', `/battery/list?${params.toString()}`);
            if (data) {
                this.batteries = data.list || [];
                this.batteryTotal = data.total || 0;
            }
        },

        batteryPageChange(page) {
            this.batteryPage = page;
            this.loadBatteries();
        },

        batterySizeChange(size) {
            this.batteryPageSize = size;
            this.loadBatteries();
        },

        async showBatteryDetail(battery) {
            const data = await this.request('get', `/battery/${battery.id}`);
            this.currentBattery = data || battery;
            this.batteryDetailVisible = true;
        },

        async offlineBattery() {
            this.$confirm('确认下线该电池？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.request('post', '/battery/offline', {
                    battery_id: this.currentBattery.id,
                    reason: '管理员手动下线'
                });
                if (res) {
                    this.$message.success('电池已下线');
                    this.batteryDetailVisible = false;
                    this.loadBatteries();
                }
            }).catch(() => {});
        },

        async autoCheckAlerts() {
            const res = await this.request('post', '/alert/check-battery');
            if (res) {
                this.$message.success(`已检测，发现 ${res} 个新告警`);
                this.loadBatteries();
                if (this.currentPage === 'alert') this.loadAlerts();
            }
        },

        async loadOrders() {
            const params = new URLSearchParams({
                page: this.orderPage,
                page_size: this.orderPageSize,
                ...this.orderFilter
            });
            const data = await this.request('get', `/order/list?${params.toString()}`);
            if (data) {
                this.orders = data.list || [];
                this.orderTotal = data.total || 0;
            }
        },

        orderPageChange(page) {
            this.orderPage = page;
            this.loadOrders();
        },

        orderSizeChange(size) {
            this.orderPageSize = size;
            this.loadOrders();
        },

        async loadDispatchTasks() {
            const data = await this.request('get', '/dispatch/task/list');
            this.dispatchTasks = data || [];
        },

        async loadGaps() {
            const params = new URLSearchParams(this.planParams);
            const data = await this.request('get', `/dispatch/gaps?${params.toString()}`);
            this.gaps = data || [];
        },

        async generatePlan() {
            const data = await this.request('post', '/dispatch/plan', this.planParams);
            this.dispatchPlan = data || [];
            if (this.dispatchPlan.length === 0) {
                this.$message.info('暂无需调度的换电柜');
            } else {
                this.$message.success(`已生成最优路线，共 ${this.dispatchPlan.length} 站`);
            }
        },

        async createBatchTasks() {
            this.$confirm('确认一键生成所有调度任务？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.request('post', '/dispatch/auto-create');
                if (res) {
                    this.$message.success('调度任务已生成');
                    this.loadDispatchTasks();
                    this.dispatchPlan = [];
                }
            }).catch(() => {});
        },

        async autoCreateTasks() {
            const res = await this.request('post', '/dispatch/auto-create');
            if (res) {
                this.$message.success('自动生成调度任务完成');
                this.loadDispatchTasks();
                this.loadGaps();
            }
        },

        async loadOperators() {
            const data = await this.request('get', '/dispatch/operator/list');
            this.operators = data || [];
        },

        assignTask(task) {
            this.currentTask = task;
            this.assignForm.operator_id = null;
            this.assignTaskVisible = true;
        },

        async confirmAssign() {
            if (!this.assignForm.operator_id) {
                this.$message.warning('请选择运维人员');
                return;
            }
            const res = await this.request('post', '/dispatch/task/assign', {
                task_id: this.currentTask.id,
                operator_id: this.assignForm.operator_id
            });
            if (res) {
                this.$message.success('任务已分配');
                this.assignTaskVisible = false;
                this.loadDispatchTasks();
            }
        },

        async startTask(task) {
            this.$confirm('确认开始该任务？', '提示', {
                type: 'warning'
            }).then(async () => {
                const res = await this.request('post', `/dispatch/task/${task.id}/start`);
                if (res) {
                    this.$message.success('任务已开始');
                    this.loadDispatchTasks();
                }
            }).catch(() => {});
        },

        completeTask(task) {
            this.currentTask = task;
            this.completeForm.battery_ids = '';
            this.completeTaskVisible = true;
        },

        async confirmComplete() {
            const batteryIds = this.completeForm.battery_ids.split(',').map(s => parseInt(s.trim())).filter(Boolean);
            const res = await this.request('post', '/dispatch/task/complete', {
                task_id: this.currentTask.id,
                battery_ids: batteryIds
            });
            if (res) {
                this.$message.success('任务已完成');
                this.completeTaskVisible = false;
                this.loadDispatchTasks();
                this.loadGaps();
            }
        },

        async loadPackages() {
            const data = await this.request('get', '/package/list');
            this.packages = data || [];
        },

        async loadWallet() {
            const data = await this.request('get', '/wallet/1');
            this.wallet = data;
        },

        async loadUserPackages() {
            const data = await this.request('get', '/package/user/1');
            this.userPackages = data || [];
        },

        async loadTransactions() {
            const data = await this.request('get', '/wallet/transaction/list?user_id=1&page_size=20');
            this.transactions = data ? data.list : [];
        },

        async purchasePackage(pkg) {
            this.$confirm(`确认购买「${pkg.name}」套餐，价格 ¥${pkg.price.toFixed(2)}？`, '提示', {
                type: 'warning'
            }).then(async () => {
                const idempotentKey = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const res = await this.request('post', '/package/purchase', {
                    user_id: 1,
                    package_id: pkg.id,
                    pay_type: 1,
                    idempotent_key: idempotentKey
                });
                if (res) {
                    this.$message.success('购买成功');
                    this.loadUserPackages();
                    this.loadWallet();
                }
            }).catch(() => {});
        },

        showRechargeDialog() {
            this.rechargeForm.amount = 100;
            this.rechargeVisible = true;
        },

        async confirmRecharge() {
            const idempotentKey = `recharge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const res = await this.request('post', '/wallet/recharge', {
                user_id: 1,
                amount: this.rechargeForm.amount,
                pay_type: this.rechargeForm.pay_type,
                idempotent_key: idempotentKey
            });
            if (res) {
                this.$message.success('充值成功');
                this.rechargeVisible = false;
                this.loadWallet();
                this.loadTransactions();
            }
        },

        async loadAlerts() {
            const params = new URLSearchParams({
                page: this.alertPage,
                page_size: this.alertPageSize,
                ...this.alertFilter
            });
            const data = await this.request('get', `/alert/list?${params.toString()}`);
            if (data) {
                this.alerts = data.list || [];
                this.alertTotal = data.total || 0;
            }
        },

        async loadAlertStats() {
            this.alertStats = await this.request('get', '/alert/stats');
        },

        alertPageChange(page) {
            this.alertPage = page;
            this.loadAlerts();
        },

        alertSizeChange(size) {
            this.alertPageSize = size;
            this.loadAlerts();
        },

        handleAlert(alert) {
            this.currentAlert = alert;
            this.handleAlertForm.status = 3;
            this.handleAlertForm.handle_result = '';
            this.handleAlertVisible = true;
        },

        async confirmHandleAlert() {
            const res = await this.request('post', '/alert/handle', {
                alert_id: this.currentAlert.id,
                handler_id: 1,
                handler_name: '管理员',
                status: this.handleAlertForm.status,
                handle_result: this.handleAlertForm.handle_result
            });
            if (res) {
                this.$message.success('处理成功');
                this.handleAlertVisible = false;
                this.loadAlerts();
                this.loadAlertStats();
            }
        },

        async showAlertDetail(alert) {
            const data = await this.request('get', `/alert/${alert.id}`);
            if (data) {
                this.$alert(`
                    <div style="line-height: 2;">
                        <p><strong>告警编号：</strong>${data.alert_no}</p>
                        <p><strong>标题：</strong>${data.title}</p>
                        <p><strong>内容：</strong>${data.content}</p>
                        <p><strong>换电柜：</strong>${data.cabinet_name || '-'}</p>
                        <p><strong>电池：</strong>${data.battery_no || '-'}</p>
                        <p><strong>创建时间：</strong>${data.created_at}</p>
                        <p><strong>处理人：</strong>${data.handler_name || '-'}</p>
                        <p><strong>处理结果：</strong>${data.handle_result || '-'}</p>
                    </div>
                `, '告警详情');
            }
        }
    }
});
