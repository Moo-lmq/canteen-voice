import React, { useState, useEffect } from 'react'
import { adminAuth, getAdminRatings, updateRatingStatus, getAdminFeedbacks, replyFeedback, updateFeedbackStatus, postNotice } from '../api'
import { Card, Loading } from '../components'
import { ShieldCheck, MessageSquare, Star, Megaphone } from 'lucide-react'

const AdminView = () => {
  const [passcode, setPasscode] = useState(localStorage.getItem('admin_passcode') || '')
  const [isAuth, setIsAuth] = useState(false)
  const [tab, setTab] = useState('ratings') // ratings, feedbacks, notices
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [replyText, setReplyText] = useState({})
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' })

  useEffect(() => {
    if (passcode) {
      handleAuth()
    }
  }, [])

  const handleAuth = async (e) => {
    if (e) e.preventDefault()
    try {
      await adminAuth(passcode)
      localStorage.setItem('admin_passcode', passcode)
      setIsAuth(true)
      fetchData()
    } catch (err) {
      alert('口令错误')
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (tab === 'ratings') {
        const res = await getAdminRatings()
        setData(res.ratings || [])
      } else if (tab === 'feedbacks') {
        const res = await getAdminFeedbacks('all')
        setData(res.feedbacks || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuth) fetchData()
  }, [tab])

  const handleUpdateRating = async (id, status) => {
    try {
      await updateRatingStatus(id, status)
      fetchData()
    } catch (err) {
      alert('更新失败')
    }
  }

  const handleReplyFeedback = async (id) => {
    const reply = replyText[id]
    if (!reply?.trim()) return
    try {
      await replyFeedback(id, reply)
      setReplyText({ ...replyText, [id]: '' })
      fetchData()
    } catch (err) {
      alert('回复失败')
    }
  }

  const handlePostNotice = async (e) => {
    e.preventDefault()
    try {
      await postNotice(noticeForm)
      alert('公告已发布')
      setNoticeForm({ title: '', content: '' })
    } catch (err) {
      alert('发布失败')
    }
  }

  if (!isAuth) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto' }}>
        <Card title="管理员验证">
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label>管理口令</label>
              <input 
                type="password" 
                value={passcode} 
                onChange={e => setPasscode(e.target.value)}
                placeholder="请输入管理口令"
                required
              />
            </div>
            <button type="submit" style={{ width: '100%' }}>验证</button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <ShieldCheck color="#646cff" /> 管理后台
        </h2>
        <div className="nav" style={{ margin: 0 }}>
          <button onClick={() => setTab('ratings')} className={tab === 'ratings' ? 'active' : ''}><Star size={16} /> 评价管理</button>
          <button onClick={() => setTab('feedbacks')} className={tab === 'feedbacks' ? 'active' : ''}><MessageSquare size={16} /> 反馈管理</button>
          <button onClick={() => setTab('notices')} className={tab === 'notices' ? 'active' : ''}><Megaphone size={16} /> 公告发布</button>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div style={{ textAlign: 'left' }}>
          
          {tab === 'ratings' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px' }}>时间</th>
                  <th style={{ padding: '10px' }}>菜品/档口</th>
                  <th style={{ padding: '10px' }}>评分</th>
                  <th style={{ padding: '10px' }}>内容</th>
                  <th style={{ padding: '10px' }}>状态</th>
                  <th style={{ padding: '10px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                    <td style={{ padding: '10px' }}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>{r.dish_name}<br/><small style={{ color: '#999' }}>{r.stall}</small></td>
                    <td style={{ padding: '10px', color: '#ffc107', fontWeight: 'bold' }}>{r.score}</td>
                    <td style={{ padding: '10px' }}>{r.comment || '-'}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ color: r.status === 'active' ? 'green' : 'red' }}>
                        {r.status === 'active' ? '正常' : '已屏蔽'}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button 
                        onClick={() => handleUpdateRating(r.id, r.status === 'active' ? 'hidden' : 'active')}
                        style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                      >
                        {r.status === 'active' ? '屏蔽' : '恢复'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'feedbacks' && (
            <div style={{ display: 'grid', gap: '20px' }}>
              {data.map(fb => (
                <Card key={fb.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>[{fb.category}] {fb.student_id || '匿名用户'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(fb.created_at).toLocaleString()}</span>
                  </div>
                  <p>{fb.content}</p>
                  {fb.admin_reply ? (
                    <div style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                      <strong>已回复：</strong> {fb.admin_reply}
                    </div>
                  ) : (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        value={replyText[fb.id] || ''} 
                        onChange={e => setReplyText({ ...replyText, [fb.id]: e.target.value })}
                        placeholder="输入回复内容..."
                        style={{ flex: 1 }}
                      />
                      <button onClick={() => handleReplyFeedback(fb.id)}>回复</button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {tab === 'notices' && (
            <Card title="发布全站公告">
              <form onSubmit={handlePostNotice}>
                <div className="form-group">
                  <label>公告标题</label>
                  <input 
                    type="text" 
                    value={noticeForm.title} 
                    onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>公告内容</label>
                  <textarea 
                    rows="5" 
                    value={noticeForm.content} 
                    onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })}
                    required
                  />
                </div>
                <button type="submit">立即发布 (将覆盖当前活跃公告)</button>
              </form>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}

export default AdminView
