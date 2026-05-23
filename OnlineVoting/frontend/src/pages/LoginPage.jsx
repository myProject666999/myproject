import { useEffect, useState } from 'react'
import { captchaApi, authApi } from '../api'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const [captcha, setCaptcha] = useState({ id: '', image: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadCaptcha = async () => {
    const res = await captchaApi.get()
    if (res.code === 0) {
      setCaptcha(res.data)
    }
  }

  useEffect(() => { loadCaptcha() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!username || !password || !captchaCode) {
      setErr('请填写完整信息')
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
      loadCaptcha()
      setCaptchaCode('')
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
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="123456" />
          </div>
          <div className="form-group">
            <label className="form-label">验证码</label>
            <div className="captcha-wrap">
              <input className="form-input" value={captchaCode} onChange={e => setCaptchaCode(e.target.value)} placeholder="请输入验证码" />
              {captcha.image && (
                <img
                  className="captcha-img"
                  src={`data:image/png;base64,${captcha.image}`}
                  alt="captcha"
                  onClick={loadCaptcha}
                  title="点击刷新"
                />
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
