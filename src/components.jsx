import React from 'react'
import { Star } from 'lucide-react'

export const RatingStars = ({ rating, count }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star 
        key={i} 
        size={16} 
        fill={i <= Math.round(rating) ? "#ffc107" : "none"} 
        color={i <= Math.round(rating) ? "#ffc107" : "#ccc"} 
      />
    )
  }
  return (
    <div className="rating-stars" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {stars}
      <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '4px' }}>
        ({rating?.toFixed(1) || 0} / {count || 0}人评价)
      </span>
    </div>
  )
}

export const Card = ({ title, children, footer }) => (
  <div className="card">
    {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
    <div className="card-body">{children}</div>
    {footer && <div className="card-footer" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>{footer}</div>}
  </div>
)

export const Loading = () => <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
