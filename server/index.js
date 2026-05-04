import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import * as db from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'canteen-admin'
const DEV_PASSCODE = process.env.DEV_PASSCODE || 'dev-mode'

app.use(cors())
app.use(express.json())

// 根路径处理，防止直接访问 3001 端口时显示错误
app.get('/', (req, res) => {
  res.send('🍚 食堂点评系统后端 API 已启动。请通过前端页面 (通常是 5173 端口) 访问系统。')
})

const getIP = req =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || '0.0.0.0'

const ok = (res, data) => res.json({ ok: true, ...data })
const fail = (res, msg, code = 400) => res.status(code).json({ ok: false, error: msg })

app.get('/api/notice', (req, res) => {
  ok(res, { notice: db.getActiveNotice() })
})

app.get('/api/config', (req, res) => {
  ok(res, {
    site_name: db.getConfig('site_name') || '食堂点评',
    site_subtitle: db.getConfig('site_subtitle') || '让每一餐都被听见',
    allow_anonymous: db.getConfig('allow_anonymous') !== 'false'
  })
})

app.get('/api/ranking', (req, res) => {
  const { stall } = req.query
  ok(res, { ranking: db.getRanking(stall), stalls: db.getStalls() })
})

app.get('/api/ratings/dish', (req, res) => {
  const { dish_name, stall } = req.query
  if (!dish_name || !stall) return fail(res, '缺少参数')
  ok(res, { ratings: db.getRatingsByDish(dish_name, stall) })
})

app.get('/api/ratings/student', (req, res) => {
  const { student_id } = req.query
  if (!student_id) return fail(res, '请输入学号')
  ok(res, {
    ratings: db.getRatingsByStudent(student_id),
    feedbacks: db.getFeedbacksByStudent(student_id)
  })
})

app.post('/api/ratings', (req, res) => {
  const { dish_name, stall, score, comment, student_id } = req.body
  if (!dish_name?.trim()) return fail(res, '请填写菜品名称')
  if (!stall?.trim()) return fail(res, '请填写档口名称')
  if (!score || score < 1 || score > 5) return fail(res, '评分需在 1-5 之间')
  db.addRating({ dish_name: dish_name.trim(), stall: stall.trim(), score, comment, student_id, ip: getIP(req) })
  ok(res, { message: '评分成功！' })
})

app.post('/api/feedbacks', (req, res) => {
  const { category, content, student_id } = req.body
  if (!content?.trim()) return fail(res, '请填写意见内容')
  if (content.trim().length < 5) return fail(res, '意见内容不少于5个字')
  db.addFeedback({ category: category || 'general', content: content.trim(), student_id, ip: getIP(req) })
  ok(res, { message: '意见已提交，感谢反馈！' })
})

app.get('/api/feedbacks/public', (req, res) => {
  const all = db.getFeedbacks('replied')
  ok(res, { feedbacks: all })
})

const adminAuth = (req, res, next) => {
  const passcode = req.headers['x-passcode'] || req.query.passcode
  if (passcode !== ADMIN_PASSCODE && passcode !== DEV_PASSCODE) return fail(res, '口令错误', 401)
  req.isDev = passcode === DEV_PASSCODE
  next()
}

app.post('/api/admin/auth', (req, res) => {
  const { passcode } = req.body
  if (passcode === ADMIN_PASSCODE) return ok(res, { role: 'admin' })
  if (passcode === DEV_PASSCODE) return ok(res, { role: 'dev' })
  fail(res, '口令错误', 401)
})

app.get('/api/admin/ratings', adminAuth, (req, res) => {
  ok(res, { ratings: db.getAllRatingsAdmin() })
})

app.patch('/api/admin/ratings/:id', adminAuth, (req, res) => {
  const { status } = req.body
  db.setRatingStatus(Number(req.params.id), status)
  ok(res, { message: '已更新' })
})

app.get('/api/admin/feedbacks', adminAuth, (req, res) => {
  const { status } = req.query
  ok(res, { feedbacks: db.getFeedbacks(status) })
})

app.patch('/api/admin/feedbacks/:id/reply', adminAuth, (req, res) => {
  const { reply } = req.body
  if (!reply?.trim()) return fail(res, '回复内容不能为空')
  db.replyFeedback(Number(req.params.id), reply.trim())
  ok(res, { message: '已回复' })
})

app.patch('/api/admin/feedbacks/:id', adminAuth, (req, res) => {
  const { status } = req.body
  db.setFeedbackStatus(Number(req.params.id), status)
  ok(res, { message: '已更新' })
})

app.post('/api/admin/notices', adminAuth, (req, res) => {
  const { title, content } = req.body
  if (!title || !content) return fail(res, '标题和内容不能为空')
  db.addNotice({ title, content })
  ok(res, { message: '公告已发布' })
})

app.patch('/api/admin/notices/:id', adminAuth, (req, res) => {
  db.toggleNotice(Number(req.params.id), req.body.is_active)
  ok(res, { message: '已更新' })
})

const distPath = join(__dirname, '../dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`🍚 食堂点评后端运行于 http://localhost:${PORT}`)
  console.log(`   管理员口令: ${ADMIN_PASSCODE}`)
})
