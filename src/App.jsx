import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import RankingView from './views/RankingView'
import SubmitView from './views/SubmitView'
import FeedbackView from './views/FeedbackView'
import HistoryView from './views/HistoryView'
import AdminView from './views/AdminView'
import api from './api'
import { Utensils, Star, MessageSquare, History, ShieldCheck, Megaphone } from 'lucide-react'

function App() {
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    api.get('/notice').then(res => {
      if (res.data.ok && res.data.notice) {
        setNotice(res.data.notice)
      }
    })
  }, [])

  return (
    <Router>
      <div className="container">
        {notice && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            textAlign: 'left'
          }}>
            <Megaphone size={16} />
            <strong>{notice.title}:</strong> {notice.content}
          </div>
        )}
        <header style={{ marginBottom: '40px' }}>
          <h1>🍴 食堂点评</h1>
          <p>让每一份建议都有回响，让每一道美食都被发现</p>
        </header>

        <nav className="nav">
          <NavLink to="/" end><Utensils size={18} /> 排行榜</NavLink>
          <NavLink to="/submit"><Star size={18} /> 评价</NavLink>
          <NavLink to="/history"><History size={18} /> 历史</NavLink>
          <NavLink to="/feedback"><MessageSquare size={18} /> 反馈</NavLink>
          <NavLink to="/admin"><ShieldCheck size={18} /> 管理</NavLink>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<RankingView />} />
            <Route path="/submit" element={<SubmitView />} />
            <Route path="/history" element={<HistoryView />} />
            <Route path="/feedback" element={<FeedbackView />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </main>

        <footer style={{ marginTop: '50px', padding: '20px', fontSize: '0.9rem', color: '#888' }}>
          &copy; 2024 食堂点评项目组 | 打造更好的校园餐饮体验
        </footer>
      </div>
    </Router>
  )
}

export default App
