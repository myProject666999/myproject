import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { contactAPI } from '../services/api'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitStatus(null)

    try {
      await contactAPI.createContact(formData)
      setSubmitStatus({ type: 'success', message: '消息发送成功！我会尽快回复您。' })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.error || '发送失败，请稍后重试。'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      <Helmet>
        <title>联系我 - 个人作品集</title>
        <meta name="description" content="有项目想法或合作机会？随时联系我" />
      </Helmet>

      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">联系我</h1>
            <p className="text-gray-600 text-center mb-12">有项目想法或合作机会？随时与我联系</p>

            <div className="card p-8">
              {submitStatus && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">姓名 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">邮箱 *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">主题</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    maxLength={255}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">消息 *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    rows={6}
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      发送中...
                    </span>
                  ) : '发送消息'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
