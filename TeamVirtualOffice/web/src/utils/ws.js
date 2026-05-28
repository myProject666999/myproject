class WebSocketClient {
  constructor(options) {
    this.url = options.url
    this.onOpen = options.onOpen || (() => {})
    this.onClose = options.onClose || (() => {})
    this.onMessage = options.onMessage || (() => {})
    this.onError = options.onError || (() => {})
    this.onReconnect = options.onReconnect || (() => {})
    this.ws = null
    this.heartbeatInterval = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.reconnectDelay = 1000
    this.manualClose = false
  }

  connect() {
    this.manualClose = false
    try {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
    } catch (error) {
      this.onError(error)
      this.scheduleReconnect()
    }
  }

  handleOpen() {
    this.reconnectAttempts = 0
    this.reconnectDelay = 1000
    this.startHeartbeat()
    this.onOpen()
  }

  handleClose(event) {
    this.stopHeartbeat()
    this.onClose(event)
    if (!this.manualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)
      this.onMessage(data)
    } catch (error) {
      this.onError(error)
    }
  }

  handleError(error) {
    this.onError(error)
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  scheduleReconnect() {
    this.onReconnect()
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    setTimeout(() => {
      if (!this.manualClose) {
        this.connect()
      }
    }, Math.min(delay, 30000))
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect() {
    this.manualClose = true
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default WebSocketClient
