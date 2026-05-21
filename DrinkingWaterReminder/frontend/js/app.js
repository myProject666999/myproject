const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;

createApp({
    setup() {
        const currentPage = ref('today');
        const todayRecords = ref([]);
        const todayTotal = ref(0);
        const dailyTarget = ref(2000);
        const weight = ref(60);
        const reminderInterval = ref(60);
        const reminderEnabled = ref(true);
        const customAmount = ref(200);
        const achievementMsg = ref(false);
        const saveMsg = ref('');
        const notificationPermission = ref('default');
        const continuousDays = ref(0);
        const weeklyAchievedDays = ref(0);
        const monthlyAchievedDays = ref(0);
        const weeklyData = ref([]);
        const nextReminderTime = ref('--:--');

        let reminderTimer = null;
        let nextReminder = null;

        const quickAmounts = [100, 200, 300, 500];

        const progressPercent = computed(() => {
            if (dailyTarget.value === 0) return 0;
            return Math.min(100, Math.round((todayTotal.value / dailyTarget.value) * 100));
        });

        const remaining = computed(() => {
            return Math.max(0, dailyTarget.value - todayTotal.value);
        });

        const progressDasharray = computed(() => 2 * Math.PI * 75);

        const progressDashoffset = computed(() => {
            const circumference = progressDasharray.value;
            return circumference - (progressPercent.value / 100) * circumference;
        });

        const calculatedTarget = computed(() => {
            return Math.round(weight.value * 35);
        });

        const notificationText = computed(() => {
            switch (notificationPermission.value) {
                case 'granted': return '已授权';
                case 'denied': return '已拒绝';
                default: return '未授权';
            }
        });

        const showSaveMsg = (msg) => {
            saveMsg.value = msg;
            setTimeout(() => {
                saveMsg.value = '';
            }, 2000);
        };

        const loadTodayData = async () => {
            try {
                const [records, summary] = await Promise.all([
                    api.getTodayRecords(),
                    api.getTodaySummary()
                ]);
                todayRecords.value = records;
                todayTotal.value = summary.totalAmount || 0;
            } catch (error) {
                console.error('加载今日数据失败:', error);
            }
        };

        const loadSetting = async () => {
            try {
                const setting = await api.getSetting();
                weight.value = setting.weight;
                dailyTarget.value = setting.dailyTarget;
                reminderInterval.value = setting.reminderInterval;
                reminderEnabled.value = setting.reminderEnabled;
                updateReminderTimer();
            } catch (error) {
                console.error('加载设置失败:', error);
            }
        };

        const loadStatistics = async () => {
            try {
                const stats = await api.getStatistics();
                continuousDays.value = stats.continuousDays || 0;
                weeklyAchievedDays.value = stats.weeklyAchievedDays || 0;
                monthlyAchievedDays.value = stats.monthlyAchievedDays || 0;

                if (stats.weeklyData && stats.weeklyData.length > 0) {
                    const maxAmount = Math.max(...stats.weeklyData.map(d => d.totalAmount), dailyTarget.value);
                    weeklyData.value = stats.weeklyData.map(d => ({
                        date: d.summaryDate,
                        dateLabel: formatDateLabel(d.summaryDate),
                        totalAmount: d.totalAmount,
                        height: Math.max(5, (d.totalAmount / maxAmount) * 100),
                        isAchieved: d.isAchieved
                    }));
                } else {
                    const dates = [];
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        dates.push({
                            date: date.toISOString().split('T')[0],
                            dateLabel: formatDateLabel(date.toISOString().split('T')[0]),
                            totalAmount: 0,
                            height: 5,
                            isAchieved: false
                        });
                    }
                    weeklyData.value = dates;
                }
            } catch (error) {
                console.error('加载统计数据失败:', error);
            }
        };

        const formatDateLabel = (dateStr) => {
            const date = new Date(dateStr);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (dateStr === today.toISOString().split('T')[0]) {
                return '今天';
            } else if (dateStr === yesterday.toISOString().split('T')[0]) {
                return '昨天';
            } else {
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
        };

        const drinkWater = async (amount) => {
            if (!amount || amount <= 0) return;

            try {
                await api.drinkWater(amount);
                await loadTodayData();

                if (todayTotal.value >= dailyTarget.value && todayTotal.value - amount < dailyTarget.value) {
                    achievementMsg.value = true;
                }
            } catch (error) {
                console.error('记录饮水失败:', error);
                alert('记录失败，请重试');
            }
        };

        const deleteRecord = async (id) => {
            if (!confirm('确定删除这条记录吗？')) return;

            try {
                await api.deleteRecord(id);
                await loadTodayData();
            } catch (error) {
                console.error('删除记录失败:', error);
            }
        };

        const onWeightChange = async () => {
            try {
                const setting = await api.updateWeight(weight.value);
                dailyTarget.value = setting.dailyTarget;
                showSaveMsg('设置已保存');
            } catch (error) {
                console.error('更新体重失败:', error);
            }
        };

        const onTargetChange = async () => {
            try {
                await api.updateSetting({ dailyTarget: dailyTarget.value });
                showSaveMsg('设置已保存');
            } catch (error) {
                console.error('更新目标失败:', error);
            }
        };

        const onSettingChange = async () => {
            try {
                await api.updateSetting({
                    reminderInterval: reminderInterval.value,
                    reminderEnabled: reminderEnabled.value
                });
                updateReminderTimer();
                showSaveMsg('设置已保存');
            } catch (error) {
                console.error('更新设置失败:', error);
            }
        };

        const updateReminderTimer = () => {
            if (reminderTimer) {
                clearInterval(reminderTimer);
                reminderTimer = null;
            }

            if (reminderEnabled.value && reminderInterval.value > 0) {
                nextReminder = new Date();
                nextReminder.setMinutes(nextReminder.getMinutes() + reminderInterval.value);
                updateNextReminderDisplay();

                reminderTimer = setInterval(() => {
                    const now = new Date();
                    if (now >= nextReminder) {
                        showNotification();
                        nextReminder = new Date();
                        nextReminder.setMinutes(nextReminder.getMinutes() + reminderInterval.value);
                    }
                    updateNextReminderDisplay();
                }, 1000);
            }
        };

        const updateNextReminderDisplay = () => {
            if (nextReminder) {
                const hours = nextReminder.getHours().toString().padStart(2, '0');
                const minutes = nextReminder.getMinutes().toString().padStart(2, '0');
                nextReminderTime.value = `${hours}:${minutes}`;
            } else {
                nextReminderTime.value = '--:--';
            }
        };

        const showNotification = () => {
            if (notificationPermission.value === 'granted') {
                const notification = new Notification('💧 饮水提醒', {
                    body: '该喝水啦！保持充足饮水对身体有益。',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💧</text></svg>'
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };

                setTimeout(() => {
                    notification.close();
                }, 5000);
            }
        };

        const requestNotificationPermission = async () => {
            if (!('Notification' in window)) {
                alert('您的浏览器不支持通知功能');
                return;
            }

            try {
                const permission = await Notification.requestPermission();
                notificationPermission.value = permission;

                if (permission === 'granted') {
                    showSaveMsg('通知已开启');
                    new Notification('💧 饮水提醒', {
                        body: '通知已开启，我们会定时提醒您喝水。'
                    });
                }
            } catch (error) {
                console.error('请求通知权限失败:', error);
            }
        };

        watch(currentPage, (newPage) => {
            if (newPage === 'today') {
                loadTodayData();
            } else if (newPage === 'stats') {
                loadStatistics();
            } else if (newPage === 'settings') {
                loadSetting();
            }
        });

        onMounted(() => {
            if ('Notification' in window) {
                notificationPermission.value = Notification.permission;
            }

            loadTodayData();
            loadSetting();

            setInterval(() => {
                if (currentPage.value === 'today') {
                    loadTodayData();
                }
            }, 30000);
        });

        onUnmounted(() => {
            if (reminderTimer) {
                clearInterval(reminderTimer);
            }
        });

        return {
            currentPage,
            todayRecords,
            todayTotal,
            dailyTarget,
            weight,
            reminderInterval,
            reminderEnabled,
            customAmount,
            achievementMsg,
            saveMsg,
            notificationPermission,
            continuousDays,
            weeklyAchievedDays,
            monthlyAchievedDays,
            weeklyData,
            nextReminderTime,
            quickAmounts,
            progressPercent,
            remaining,
            progressDasharray,
            progressDashoffset,
            calculatedTarget,
            notificationText,
            drinkWater,
            deleteRecord,
            onWeightChange,
            onTargetChange,
            onSettingChange,
            requestNotificationPermission
        };
    }
}).mount('#app');
