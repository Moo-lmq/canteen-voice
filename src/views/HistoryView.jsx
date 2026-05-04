import React, { useState, useEffect } from 'react'
import { getStudentHistory } from '../api'
import { Card, Loading } from '../components'
import { History, User } from 'lucide-react'

const HistoryView = () => {
  const [studentId, setStudentId] = useState(localStorage.getItem('student_id') || '')
  const [history, setHistory] = useState({ ratings: [], feedbacks: [] })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (studentId) {
      handleSearch()
    }
  }, [])

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!studentId.trim()) return
    
    setLoading(true)
    setHasSearched(true)
    try {
      localStorage.setItem('student_id', studentId)
      const data = await getStudentHistory(studentId)
      setHistory(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <History size={24} />
        <h2 style={{ margin: 0 }}>个人评价与反馈历史</h2>
      </div>

      <Card>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              value={studentId} 
              onChange={e => setStudentId(e.target.value)}
              placeholder="请输入您的学号进行查询"
              style={{ paddingLeft: '35px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit">查询</button>
        </form>
      </Card>

      {loading ? <Loading /> : hasSearched && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          
          {/* 评价历史 */}
          <div>
            <h3>我的评分 ({history.ratings.length})</h3>
            {history.ratings.map(r => (
              <div key={r.id} style={{ backgroundColor: 'rgba(255, 193, 7, 0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{r.dish_name}</span>
                  <span style={{ color: '#ffc107' }}>{r.score}分</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>{r.stall}</div>
                {r.comment && <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>{r.comment}</p>}
                <div style={{ fontSize: '0.7rem', color: '#bbb' }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
            {history.ratings.length === 0 && <p style={{ color: '#999' }}>暂无评分记录</p>}
          </div>

          {/* 反馈历史 */}
          <div>
            <h3>我的反馈 ({history.feedbacks.length})</h3>
            {history.feedbacks.map(f => (
              <div key={f.id} style={{ backgroundColor: 'rgba(100, 108, 255, 0.05)', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ 
                    color: f.status === 'replied' ? '#2e7d32' : '#ed6c02',
                    fontWeight: 'bold'
                  }}>
                    {f.status === 'replied' ? '● 已回复' : '● 待处理'}
                  </span>
                  <span style={{ color: '#888' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>{f.content}</p>
                {f.admin_reply && (
                  <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#fff', borderRadius: '4px', fontSize: '0.85rem', borderLeft: '2px solid #646cff' }}>
                    {f.admin_reply}
                  </div>
                )}
              </div>
            ))}
            {history.feedbacks.length === 0 && <p style={{ color: '#999' }}>暂无反馈记录</p>}
          </div>

        </div>
      )}
    </div>
  )
}

export default HistoryView
