const Answer = {
    scaleId: null,
    scaleDetail: null,
    sessionUuid: null,
    currentIndex: 0,
    answers: {},
    startTime: null,
    timerInterval: null,
    autoSaveTimer: null,
    autoSaveInterval: 30000,
    autoNextOnSelect: true,
    isSubmitting: false,
    hasUnsavedChanges: false,

    async init() {
        this.scaleId = Common.getQueryParam('scale_id') || Common.getQueryParam('scaleId');
        if (!this.scaleId) {
            Common.showToast('请先选择量表', 'error');
            setTimeout(() => location.href = 'scales.html', 1500);
            return;
        }

        document.getElementById('privacyAgree').addEventListener('change', (e) => {
            document.getElementById('startAnswerBtn').disabled = !e.target.checked;
        });

        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges && !this.isSubmitting) {
                e.preventDefault();
                e.returnValue = '您有未保存的作答数据，确定要离开吗？';
                return e.returnValue;
            }
        });

        window.addEventListener('popstate', (e) => {
            if (this.hasUnsavedChanges && !this.isSubmitting) {
                if (!confirm('您有未保存的作答数据，确定要离开吗？')) {
                    history.pushState(null, null, location.href);
                }
            }
        });

        try {
            this.scaleDetail = await API.scales.getDetail(this.scaleId);
            this.scaleDetail = this.scaleDetail.data || this.scaleDetail;
            document.getElementById('scaleName').textContent = this.scaleDetail.name;
            this.showPrivacyModal();
        } catch (error) {
            Common.showToast('加载量表信息失败', 'error');
        }
    },

    showPrivacyModal() {
        document.getElementById('privacyModal').style.display = 'flex';
    },

    async startAnswering() {
        document.getElementById('privacyModal').style.display = 'none';

        try {
            const sessionData = await API.answers.startSession(this.scaleId);
            this.sessionUuid = sessionData.data.session_uuid;
            this.startTime = Date.now();
            this.startTimer();
            this.startAutoSave();
            this.renderAnswerGrid();
            this.renderQuestion();
            this.updateProgress();
            this.restoreAutoSavedAnswers();
        } catch (error) {
            Common.showToast('开始作答失败', 'error');
        }
    },

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timeElapsed').textContent = `⏱ ${minutes}:${seconds}`;
        }, 1000);
    },

    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            if (Object.keys(this.answers).length > 0 && this.hasUnsavedChanges) {
                this.performAutoSave();
            }
        }, this.autoSaveInterval);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    async performAutoSave() {
        if (this.isSubmitting) return;

        try {
            this.updateAutoSaveStatus('saving');
            await API.answers.autoSave(this.sessionUuid, this.answers);
            this.hasUnsavedChanges = false;
            this.updateAutoSaveStatus('saved');
        } catch (error) {
            this.updateAutoSaveStatus('error');
        }
    },

    updateAutoSaveStatus(status) {
        const statusEl = document.getElementById('autoSaveStatus');
        const textEl = statusEl.querySelector('.auto-save-text');
        const dotEl = statusEl.querySelector('.auto-save-dot');

        dotEl.className = 'auto-save-dot';
        if (status === 'saving') {
            textEl.textContent = '保存中...';
            dotEl.classList.add('saving');
        } else if (status === 'saved') {
            textEl.textContent = '已保存';
            dotEl.classList.add('saved');
        } else if (status === 'error') {
            textEl.textContent = '保存失败';
            dotEl.classList.add('error');
        }
    },

    async restoreAutoSavedAnswers() {
        try {
            const data = await API.answers.getAutoSave(this.sessionUuid);
            const savedAnswers = data.data?.answers || {};
            if (Object.keys(savedAnswers).length > 0) {
                this.answers = savedAnswers;
                this.hasUnsavedChanges = false;
                this.renderAnswerGrid();
                this.renderQuestion();
                this.updateProgress();
                Common.showToast('已恢复上次作答进度', 'info');
            }
        } catch (error) {
            console.log('No saved answers found');
        }
    },

    renderAnswerGrid() {
        const questions = this.scaleDetail.questions;
        const grid = document.getElementById('answerGrid');
        grid.innerHTML = '';

        questions.forEach((q, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-dot';
            btn.textContent = index + 1;
            if (this.answers[q.id]) {
                btn.classList.add('answered');
            }
            if (index === this.currentIndex) {
                btn.classList.add('current');
            }
            btn.onclick = () => this.goToQuestion(index);
            grid.appendChild(btn);
        });

        this.updateAnswerSummary();
    },

    updateAnswerSummary() {
        const total = this.scaleDetail.questions.length;
        const answered = Object.keys(this.answers).length;
        document.getElementById('answeredCount').textContent = answered;
        document.getElementById('unansweredCount').textContent = total - answered;
    },

    renderQuestion() {
        const questions = this.scaleDetail.questions;
        const question = questions[this.currentIndex];
        if (!question) return;

        document.getElementById('questionNumber').textContent = `第 ${question.question_number} 题`;
        document.getElementById('questionText').textContent = question.question_text;
        document.getElementById('questionHint').textContent = question.question_hint || '';
        document.getElementById('questionRequired').style.display = question.is_required ? 'inline-block' : 'none';

        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';

        question.options.forEach((opt) => {
            const label = document.createElement('label');
            label.className = 'option-item';
            const isSelected = this.answers[question.id] === opt.id;
            label.innerHTML = `
                <input type="radio" name="question_${question.id}" value="${opt.id}" ${isSelected ? 'checked' : ''}>
                <span class="option-circle"></span>
                <span class="option-text">${opt.option_text}</span>
            `;
            label.onclick = () => this.selectOption(question.id, opt.id);
            optionsList.appendChild(label);
        });

        document.getElementById('prevBtn').disabled = this.currentIndex === 0;
        document.getElementById('nextBtn').textContent = this.currentIndex === questions.length - 1 ? '完成' : '下一题';

        this.renderAnswerGrid();
    },

    selectOption(questionId, optionId) {
        this.answers[questionId] = optionId;
        this.hasUnsavedChanges = true;
        this.updateAnswerSummary();
        this.renderAnswerGrid();
        this.updateProgress();

        if (this.autoNextOnSelect && this.currentIndex < this.scaleDetail.questions.length - 1) {
            setTimeout(() => this.nextQuestion(), 300);
        }
    },

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderQuestion();
        }
    },

    nextQuestion() {
        if (this.currentIndex < this.scaleDetail.questions.length - 1) {
            this.currentIndex++;
            this.renderQuestion();
        } else {
            this.checkAndSubmit();
        }
    },

    goToQuestion(index) {
        this.currentIndex = index;
        this.renderQuestion();
    },

    updateProgress() {
        const total = this.scaleDetail.questions.length;
        const answered = Object.keys(this.answers).length;
        const progress = (answered / total) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('questionProgress').textContent = `${answered} / ${total}`;
    },

    checkAndSubmit() {
        const questions = this.scaleDetail.questions;
        const unansweredRequired = questions.filter(q => q.is_required && !this.answers[q.id]);
        const unansweredOptional = questions.filter(q => !q.is_required && !this.answers[q.id]);

        let warning = '';
        if (unansweredRequired.length > 0) {
            warning = `还有 ${unansweredRequired.length} 道必答题未完成：第 ${unansweredRequired.map(q => q.question_number).join('、')} 题`;
        } else if (unansweredOptional.length > 0) {
            warning = `还有 ${unansweredOptional.length} 道题目未作答，是否继续提交？`;
        }

        const warningEl = document.getElementById('unansweredWarning');
        if (warning) {
            warningEl.textContent = warning;
            warningEl.style.display = 'block';
        } else {
            warningEl.style.display = 'none';
        }

        document.getElementById('confirmModal').style.display = 'flex';
    },

    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
    },

    async submitAnswers() {
        if (this.isSubmitting) return;

        this.closeConfirmModal();
        this.isSubmitting = true;

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> 提交中...';

        try {
            await this.performAutoSave();
            const result = await API.answers.submit(this.sessionUuid, this.answers);
            this.hasUnsavedChanges = false;
            clearInterval(this.timerInterval);
            clearInterval(this.autoSaveTimer);
            Common.showToast('提交成功', 'success');
            setTimeout(() => {
                location.href = `result.html?session_uuid=${this.sessionUuid}`;
            }, 1000);
        } catch (error) {
            this.isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Answer.init());
