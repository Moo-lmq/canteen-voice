import React, { useState } from 'react'
import { submitRating } from '../api'
import { Card } from '../components'

const SubmitView = () => {
  const [formData, setFormData] = useState({
    dish_name: '',
    stall: '',
    score: 5,
    comment: '',
    student_id: localStorage.getItem('student_id') || ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.dish_name.trim() || !formData.stall.trim()) {
      setMessage('请填写菜名和档口')
      return
    }
    
    setSubmitting(true)
    setMessage('')
    try {
      if (formData.student_id) {
        localStorage.setItem('student_id', formData.student_id)
      }
      const res = await submitRating(formData)
      setMessage(res.message || '评价提交成功！')
      setFormData({ ...formData, dish_name: '', comment: '' })
    } catch (err) {
      setMessage(err.response?.data?.error || '提交失败，请重试。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>评价今天的菜品</h2>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>菜品名称</label>
            <input 
              type="text"
              value={formData.dish_name} 
              onChange={e => setFormData({ ...formData, dish_name: e.target.value })}
              placeholder="例如：红烧肉"
              required
            />
          </div>

          <div className="form-group">
            <label>档口/餐厅</label>
            <input 
              type="text"
              value={formData.stall} 
              onChange={e => setFormData({ ...formData, stall: e.target.value })}
              placeholder="例如：一食堂二楼"
              required
            />
          </div>
          
          <div className="form-group">
            <label>评分 (1-5分)</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={formData.score} 
              onChange={e => setFormData({ ...formData, score: parseInt(e.target.value) })}
            />
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#ffc107' }}>
              {formData.score} 分
            </div>
          </div>

          <div className="form-group">
            <label>评价内容</label>
            <textarea 
              rows="4" 
              value={formData.comment} 
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              placeholder="味道如何？分量够吗？(可选)"
            />
          </div>

          <div className="form-group">
            <label>学号 (可选，用于同步您的历史)</label>
            <input 
              type="text"
              value={formData.student_id} 
              onChange={e => setFormData({ ...formData, student_id: e.target.value })}
              placeholder="您的学号"
            />
          </div>

          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '12px', fontSize: '1.1rem' }}>
            {submitting ? '提交中...' : '提交评价'}
          </button>
          
          {message && (
            <p style={{ 
              textAlign: 'center', 
              marginTop: '15px', 
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: message.includes('成功') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              color: message.includes('成功') ? '#2e7d32' : '#d32f2f' 
            }}>
              {message}
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}

export default SubmitView
