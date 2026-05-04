CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dish_name TEXT NOT NULL,
  stall TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  student_id TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

CREATE VIEW IF NOT EXISTS dish_ranking AS
SELECT
  dish_name,
  stall,
  ROUND(AVG(score), 2) AS avg_score,
  COUNT(*) AS vote_count,
  MAX(created_at) AS last_voted
FROM ratings
WHERE status = 'active'
GROUP BY dish_name, stall
ORDER BY avg_score DESC, vote_count DESC;

CREATE TABLE IF NOT EXISTS feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  student_id TEXT DEFAULT '',
  ip TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  admin_reply TEXT DEFAULT '',
  replied_at TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now', '+8 hours'))
);

CREATE TABLE IF NOT EXISTS sys_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO sys_config VALUES ('site_name', '食堂点评');
INSERT OR IGNORE INTO sys_config VALUES ('site_subtitle', '让诉求都被听见');
INSERT OR IGNORE INTO sys_config VALUES ('allow_anonymous', 'true');
INSERT OR IGNORE INTO sys_config VALUES ('notice_content', '欢迎使用食堂点评！请文明留言，理性评分。');
