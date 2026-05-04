import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// 为管理接口添加口令头
api.interceptors.request.use(config => {
  const passcode = localStorage.getItem('admin_passcode')
  if (passcode) {
    config.headers['x-passcode'] = passcode
  }
  return config
})

export const getRanking = (stall) => api.get('/ranking', { params: { stall } }).then(res => res.data)
export const getDishRatings = (dish_name, stall) => api.get('/ratings/dish', { params: { dish_name, stall } }).then(res => res.data)
export const getStudentHistory = (student_id) => api.get('/ratings/student', { params: { student_id } }).then(res => res.data)
export const submitRating = (data) => api.post('/ratings', data).then(res => res.data)
export const submitFeedback = (data) => api.post('/feedbacks', data).then(res => res.data)
export const getPublicFeedbacks = () => api.get('/feedbacks/public').then(res => res.data)

// 管理员接口
export const adminAuth = (passcode) => api.post('/admin/auth', { passcode }).then(res => res.data)
export const getAdminRatings = () => api.get('/admin/ratings').then(res => res.data)
export const updateRatingStatus = (id, status) => api.patch(`/admin/ratings/${id}`, { status }).then(res => res.data)
export const getAdminFeedbacks = (status) => api.get('/admin/feedbacks', { params: { status } }).then(res => res.data)
export const replyFeedback = (id, reply) => api.patch(`/admin/feedbacks/${id}/reply`, { reply }).then(res => res.data)
export const updateFeedbackStatus = (id, status) => api.patch(`/admin/feedbacks/${id}`, { status }).then(res => res.data)
export const postNotice = (data) => api.post('/admin/notices', data).then(res => res.data)
export const toggleNotice = (id, is_active) => api.patch(`/admin/notices/${id}`, { is_active }).then(res => res.data)

export default api
