import { defineStore } from 'pinia'
import { login, startQuiz, submitAnswer, finishQuiz } from '@/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: localStorage.getItem('userId') || null,
    username: localStorage.getItem('username') || '',
    nickname: localStorage.getItem('nickname') || '',
    avatar: localStorage.getItem('avatar') || ''
  }),

  actions: {
    async login(username, nickname) {
      const res = await login({ username, nickname })
      const data = res.data
      this.userId = data.userId
      this.username = data.username
      this.nickname = data.nickname
      this.avatar = data.avatar
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('username', data.username)
      localStorage.setItem('nickname', data.nickname)
      localStorage.setItem('avatar', data.avatar)
      return data
    },

    logout() {
      this.userId = null
      this.username = ''
      this.nickname = ''
      this.avatar = ''
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('nickname')
      localStorage.removeItem('avatar')
    }
  }
})

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    gameId: null,
    questions: [],
    currentIndex: 0,
    answers: [],
    currentAnswer: null,
    timeLeft: 30,
    quizTime: 30,
    isSubmitting: false,
    score: 0,
    correctCount: 0,
    maxCombo: 0,
    currentCombo: 0,
    accuracy: 0,
    totalQuestions: 0
  }),

  getters: {
    currentQuestion: (state) => {
      return state.questions[state.currentIndex] || null
    },
    progress: (state) => {
      return state.questions.length > 0 
        ? Math.round((state.currentIndex / state.questions.length) * 100) 
        : 0
    }
  },

  actions: {
    async startQuiz(params) {
      const res = await startQuiz(params)
      const data = res.data
      this.gameId = data.gameId
      this.questions = data.questions
      this.quizTime = data.quizTime
      this.timeLeft = data.quizTime
      this.currentIndex = 0
      this.answers = []
      this.currentAnswer = null
      this.score = 0
      this.correctCount = 0
      this.maxCombo = 0
      this.currentCombo = 0
      this.totalQuestions = data.questions.length
      return data
    },

    async submitAnswer(userAnswer) {
      if (this.isSubmitting || !this.currentQuestion) return
      
      this.isSubmitting = true
      this.currentAnswer = userAnswer
      
      try {
        const res = await submitAnswer({
          gameId: this.gameId,
          questionId: this.currentQuestion.id,
          userAnswer,
          clientTime: this.quizTime - this.timeLeft
        })
        
        const data = res.data
        this.answers.push({
          questionId: this.currentQuestion.id,
          userAnswer,
          isCorrect: data.isCorrect,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation
        })
        
        if (data.isCorrect) {
          this.correctCount++
          this.currentCombo++
          if (this.currentCombo > this.maxCombo) {
            this.maxCombo = this.currentCombo
          }
        } else {
          this.currentCombo = 0
        }
        
        return data
      } finally {
        this.isSubmitting = false
      }
    },

    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
        this.currentAnswer = null
        this.timeLeft = this.quizTime
        return true
      }
      return false
    },

    async finishQuiz() {
      const res = await finishQuiz({ gameId: this.gameId })
      const data = res.data
      this.score = data.score
      this.correctCount = data.correctCount
      this.maxCombo = data.maxCombo
      this.accuracy = data.accuracy
      this.totalQuestions = data.totalQuestions
      return data
    },

    resetQuiz() {
      this.gameId = null
      this.questions = []
      this.currentIndex = 0
      this.answers = []
      this.currentAnswer = null
      this.timeLeft = 30
      this.quizTime = 30
      this.isSubmitting = false
      this.score = 0
      this.correctCount = 0
      this.maxCombo = 0
      this.currentCombo = 0
      this.accuracy = 0
      this.totalQuestions = 0
    }
  }
})
