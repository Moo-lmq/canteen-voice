import React, { useState, useEffect } from 'react'
import { submitFeedback, getPublicFeedbacks } from '../api'
import { Card, Loading } from '../components'
import { MessageCircle, Send } from 'lucide-react'

const FeedbackView = () => {
  const [formData, setFormData] = useState({
    category: 'general',
    content: '',
    student_id: localStorage.getItem('student_id') || ''
  })
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const data = await getPublicFeedbacks()
      setFeedbacks(data.feedbacks || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.content.length < 5) {
      setMessage('反馈内容至少5个字')
      return
    }
    
    setSubmitting(true)
    setMessage('')
    try {
      if (formData.student_id) {
        localStorage.setItem('student_id', formData.student_id)
      }
      const res = await submitFeedback(formData)
      setMessage(res.message || '反馈已提交！')
      setFormData({ ...formData, content: '' })
      fetchFeedbacks()
    } catch (err) {
      setMessage(err.response?.data?.error || '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* 左侧：提交表单 */}
        <div>
          <h2><Send size={20} /> 发表意见</h2>
          <Card>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>分类</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="general">一般建议</option>
                  <option value="food">食品质量</option>
                  <option value="service">服务态度</option>
                  <option value="environment">卫生环境</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="form-group">
                <label>反馈内容</label>
                <textarea 
                  rows="5" 
                  value={formData.content} 
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="请输入您的反馈意见（不少于5个字）"
                  required
                />
              </div>

              <div className="form-group">
                <label>学号 (可选)</label>
                <input 
                  type="text" 
                  value={formData.student_id} 
                  onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="方便我们为您精准解决问题"
                />
              </div>

              <button type="submit" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? '提交中...' : '提交反馈'}
              </button>
              
              {message && <p style={{ textAlign: 'center', marginTop: '10px', color: message.includes('成功') ? '#2e7d32' : '#d32f2f' }}>{message}</p>}
            </form>
          </Card>
        </div>

        {/* 右侧：公开展示 */}
        <div>
          <h2><MessageCircle size={20} /> 公开回复</h2>
          {loading ? <Loading /> : (
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
              {feedbacks.map(fb => (
                <div key={fb.id} style={{ 
                  backgroundColor: 'rgba(100, 108, 255, 0.05)', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  borderLeft: '4px solid #646cff'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{fb.category === 'food' ? '🍔 食品' : fb.category === 'service' ? '👨‍🍳 服务' : '📝 建议'}</span>
                    <span>{new Date(fb.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ margin: '5px 0', fontWeight: '500' }}>{fb.content}</p>
                  
                  {fb.admin_reply && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.5)', 
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      <strong style={{ color: '#646cff' }}>食堂回复：</strong>
                      {fb.admin_reply}
                    </div>
                  )}
                </div>
              ))}
              {feedbacks.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>暂无公开回复</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default FeedbackView
