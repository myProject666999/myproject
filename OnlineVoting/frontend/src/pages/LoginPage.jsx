import { useEffect, useState, useCallback } from 'react'
import { captchaApi, authApi } from '../api'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captcha, setCaptcha] = useState({ id: '', image: '', error: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadCaptcha = useCallback(async () => {
    try {
      const res = await captchaApi.get()
      if (res.code === 0 && res.data && res.data.image) {
        setCaptcha({ id: res.data.id, image: res.data.image, error: '' })
      } else {
        setCaptcha({ id: '', image: '', error: res.message || '验证码加载失败' })
      }
    } catch (e) {
      console.error('captcha load error:', e)
      setCaptcha({ id: '', image: '', error: '网络错误，点击重试' })
    }
  }, [])

  useEffect(() => { loadCaptcha() }, [loadCaptcha])

  const handleImgError = () => {
    setCaptcha(prev => ({ ...prev, error: '图片加载失败，点击重试' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!username || !password || !captchaCode) {
      setErr('请填写完整信息')
      return
    }
    if (!captcha.id) {
      setErr('验证码未加载完成，请稍候')
      return
    }
    setLoading(true)
    const res = await authApi.login({
      username, password,
      captcha_id: captcha.id,
      captcha_code: captchaCode
    })
    setLoading(false)
    if (res.code === 0) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } else {
      setErr(res.message)
      setCaptchaCode('')
      loadCaptcha()
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">🎫 在线投票与抽奖</h2>
        <p className="login-subtitle">请登录以使用系统</p>
        {err && <div style={{ color: '#ef4444', background: '#fee2e2', padding: 10, borderRadius: 6, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="123456" />
          </div>
          <div className="form-group">
            <label className="form-label">验证码</label>
            <div className="captcha-wrap">
              <input
                className="form-input"
                value={captchaCode}
                onChange={e => setCaptchaCode(e.target.value)}
                placeholder="请输入右侧验证码"
                maxLength={6}
              />
              {captcha.image ? (
                <img
                  className="captcha-img"
                  src={`data:image/png;base64,${captcha.image}`}
                  alt="点击刷新验证码"
                  onClick={loadCaptcha}
                  onError={handleImgError}
                  title="点击刷新验证码"
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <div
                  className="captcha-img"
                  onClick={loadCaptcha}
                  title="点击刷新"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: captcha.error ? '#fef2f2' : '#f3f4f6',
                    color: captcha.error ? '#ef4444' : '#6b7280',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '0 6px',
                    lineHeight: 1.2,
                    border: '1px dashed #d1d5db'
                  }}
                >
                  {captcha.error || '加载中...'}
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ marginTop: 10 }}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
          默认账号：admin / 123456
        </div>
      </div>
    </div>
  )
}
