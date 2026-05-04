import React, { useState, useEffect } from 'react'
import { getRanking } from '../api'
import { Card, RatingStars, Loading } from '../components'
import { Trophy, Filter } from 'lucide-react'

const RankingView = () => {
  const [ranking, setRanking] = useState([])
  const [stalls, setStalls] = useState([])
  const [stallFilter, setStallFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRanking()
  }, [stallFilter])

  const fetchRanking = async () => {
    setLoading(true)
    try {
      const data = await getRanking(stallFilter)
      setRanking(data.ranking || [])
      setStalls(data.stalls || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Trophy color="#ffc107" /> 菜品排行榜
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#666" />
          <select 
            value={stallFilter} 
            onChange={e => setStallFilter(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="all">所有档口</option>
            {stalls.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="ranking-list">
          {ranking.map((dish, index) => (
            <Card key={`${dish.dish_name}-${dish.stall}`} title={`${index + 1}. ${dish.dish_name}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '5px 0', color: '#666' }}>{dish.stall}</p>
                  <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#888' }}>
                    最后评价: {new Date(dish.last_voted).toLocaleDateString()}
                  </p>
                </div>
                <RatingStars rating={dish.avg_score} count={dish.vote_count} />
              </div>
            </Card>
          ))}
          {ranking.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>暂无数据</p>}
        </div>
      )}
    </div>
  )
}

export default RankingView
