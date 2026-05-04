import { readFileSync } from 'fs'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.SQLITE_FILE || join(__dirname, '../data/canteen.db')

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode=WAL')
db.exec('PRAGMA foreign_keys=ON')

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)

export function addRating({ dish_name, stall, score, comment, student_id, ip }) {
  return db.prepare(
    `INSERT INTO ratings (dish_name, stall, score, comment, student_id, ip)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(dish_name, stall, Number(score), comment || '', student_id || '', ip || '')
}

export function getRanking(stall_filter) {
  if (stall_filter && stall_filter !== 'all') {
    return db.prepare(`SELECT * FROM dish_ranking WHERE stall = ? LIMIT 100`).all(stall_filter)
  }
  return db.prepare(`SELECT * FROM dish_ranking LIMIT 100`).all()
}

export function getRatingsByDish(dish_name, stall) {
  return db.prepare(
    `SELECT id, score, comment, student_id, created_at FROM ratings
     WHERE dish_name = ? AND stall = ? AND status = 'active'
     ORDER BY created_at DESC LIMIT 50`
  ).all(dish_name, stall)
}

export function getRatingsByStudent(student_id) {
  return db.prepare(
    `SELECT id, dish_name, stall, score, comment, created_at FROM ratings
     WHERE student_id = ? AND status = 'active'
     ORDER BY created_at DESC LIMIT 30`
  ).all(student_id)
}

export function getAllRatingsAdmin(limit = 200) {
  return db.prepare(
    `SELECT id, dish_name, stall, score, comment, student_id, ip, status, created_at
     FROM ratings ORDER BY created_at DESC LIMIT ?`
  ).all(limit)
}

export function setRatingStatus(id, status) {
  return db.prepare(`UPDATE ratings SET status = ? WHERE id = ?`).run(status, id)
}

export function getStalls() {
  return db.prepare(
    `SELECT DISTINCT stall FROM ratings WHERE status='active' ORDER BY stall`
  ).all().map(r => r.stall)
}

export function getStats() {
  const total = db.prepare(`SELECT COUNT(*) as c FROM ratings WHERE status='active'`).get()
  const dishes = db.prepare(`SELECT COUNT(DISTINCT dish_name||stall) as c FROM ratings WHERE status='active'`).get()
  const avg = db.prepare(`SELECT ROUND(AVG(score),2) as c FROM ratings WHERE status='active'`).get()
  const today = db.prepare(
    `SELECT COUNT(*) as c FROM ratings WHERE status='active' AND date(created_at)=date('now','+8 hours')`
  ).get()
  const stall_dist = db.prepare(
    `SELECT stall, COUNT(*) as count FROM ratings WHERE status='active' GROUP BY stall ORDER BY count DESC`
  ).all()
  const top10 = db.prepare(`SELECT dish_name, stall, avg_score, vote_count FROM dish_ranking LIMIT 10`).all()
  return { total: total.c, dishes: dishes.c, avg: avg.c, today: today.c, stall_dist, top10 }
}

export function addFeedback({ category, content, student_id, ip }) {
  return db.prepare(
    `INSERT INTO feedbacks (category, content, student_id, ip) VALUES (?, ?, ?, ?)`
  ).run(category, content, student_id || '', ip || '')
}

export function getFeedbacks(status_filter) {
  if (status_filter && status_filter !== 'all') {
    return db.prepare(
      `SELECT * FROM feedbacks WHERE status=? ORDER BY created_at DESC LIMIT 100`
    ).all(status_filter)
  }
  return db.prepare(`SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 100`).all()
}

export function getFeedbacksByStudent(student_id) {
  return db.prepare(
    `SELECT id, category, content, status, admin_reply, replied_at, created_at
     FROM feedbacks WHERE student_id=? ORDER BY created_at DESC LIMIT 20`
  ).all(student_id)
}

export function replyFeedback(id, admin_reply) {
  return db.prepare(
    `UPDATE feedbacks SET admin_reply=?, status='replied',
     replied_at=datetime('now','+8 hours') WHERE id=?`
  ).run(admin_reply, id)
}

export function setFeedbackStatus(id, status) {
  return db.prepare(`UPDATE feedbacks SET status=? WHERE id=?`).run(status, id)
}

export function getActiveNotice() {
  return db.prepare(`SELECT * FROM notices WHERE is_active=1 ORDER BY id DESC LIMIT 1`).get()
}

export function getAllNotices() {
  return db.prepare(`SELECT * FROM notices ORDER BY id DESC`).all()
}

export function addNotice({ title, content }) {
  db.prepare(`UPDATE notices SET is_active=0`).run()
  return db.prepare(`INSERT INTO notices (title, content) VALUES (?, ?)`).run(title, content)
}

export function toggleNotice(id, is_active) {
  return db.prepare(`UPDATE notices SET is_active=? WHERE id=?`).run(is_active ? 1 : 0, id)
}

export function getConfig(key) {
  return db.prepare(`SELECT value FROM sys_config WHERE key=?`).get(key)?.value
}

export function setConfig(key, value) {
  return db.prepare(`INSERT OR REPLACE INTO sys_config VALUES (?, ?)`).run(key, value)
}
