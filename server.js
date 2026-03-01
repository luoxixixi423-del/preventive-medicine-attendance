/**
 * 预防医学留学生签到系统 v2
 * ══════════════════════════════════════════
 *  修改 CONFIG 中的配置后运行 npm start
 * ══════════════════════════════════════════
 */

const express  = require('express');
const crypto   = require('crypto');
const fs       = require('fs');
const path     = require('path');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  ✏️  CONFIG — 修改这里
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CONFIG = {
  port:          process.env.PORT          || 3000,
  adminPassword: process.env.ADMIN_PW      || 'KMUST2026',    // 管理员密码
  baseUrl:       process.env.BASE_URL      || 'http://localhost:3000', // 公网地址
  tokenSecret:   process.env.TOKEN_SECRET  || 'pmatt-secret-change-me', // Token密钥
  tokenSeconds:  5,    // 二维码每隔多少秒刷新一次（5秒）
  dataFile:      './data/attendance.json',
};
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── 课程数据 ───────────────────────────────────────────────
const SESSIONS = [
  { id:1,  date:'2026-03-02', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'晏家骢', zh:'预防医学概述+流行病学和统计概述+循证医学-临床决策', en:'Intro to Prev. Med. + Epidemiology Overview + EBM' },
  { id:2,  date:'2026-03-06', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'李蔚源', zh:'定量数据统计描述+正态分布', en:'Quantitative Data Description + Normal Distribution' },
  { id:3,  date:'2026-03-09', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'李明颖', zh:'环境卫生+职业卫生与职业医学', en:'Environmental Health + Occupational Health' },
  { id:4,  date:'2026-03-13', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'杨景晖', zh:'流行病学基础+疾病的分布、病因推断', en:'Epidemiology Basics + Disease Distribution' },
  { id:5,  date:'2026-03-16', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'刘岚',   zh:'食物与健康+慢性非传染性疾病预防与控制', en:'Food & Health + NCD Prevention' },
  { id:6,  date:'2026-03-20', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'杨景晖', zh:'描述性研究', en:'Descriptive Studies' },
  { id:7,  date:'2026-03-23', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'杨斌',   zh:'队列研究', en:'Cohort Studies' },
  { id:8,  date:'2026-03-27', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'张雯',   zh:'传染性疾病+突发公卫事件', en:'Infectious Diseases + Public Health Emergencies' },
  { id:9,  date:'2026-03-30', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'肖罗茜', zh:'病例-对照研究', en:'Case-Control Studies' },
  { id:10, date:'2026-04-03', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'李明颖', zh:'预防医学实践', en:'Preventive Medicine Practice' },
  { id:11, date:'2026-04-10', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'杨继春', zh:'T检验+方差分析', en:'T-Test + ANOVA' },
  { id:12, date:'2026-04-13', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'张瑞仙', zh:'筛检与诊断试验的评价', en:'Screening & Diagnostic Test Evaluation' },
  { id:13, date:'2026-04-17', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'何光宇', zh:'定性数据统计描述+统计表+参数估计与假设检验', en:'Qualitative Data + Hypothesis Testing' },
  { id:14, date:'2026-04-20', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'张雯',   zh:'预后研究', en:'Prognostic Studies' },
  { id:15, date:'2026-04-24', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'张瑞仙', zh:'文献解析分享', en:'Literature Analysis & Sharing' },
  { id:16, date:'2026-04-27', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'李蔚源', zh:'卡方检验', en:'Chi-Square Test' },
  { id:17, date:'2026-05-08', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'张瑞仙', zh:'疾病监测', en:'Disease Surveillance' },
  { id:18, date:'2026-05-11', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'杨斌',   zh:'实验流行病学研究', en:'Experimental Epidemiology' },
  { id:19, date:'2026-05-15', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'何光宇', zh:'SPSS实操 I', en:'SPSS Practice I' },
  { id:20, date:'2026-05-18', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'杨继春', zh:'线性回归与相关+Logistic回归', en:'Linear Regression + Logistic Regression' },
  { id:21, date:'2026-05-22', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'张雯',   zh:'SPSS实操 II', en:'SPSS Practice II' },
  { id:22, date:'2026-05-25', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'杨继春', zh:'非参数的秩和检验', en:'Non-Parametric Rank-Sum Test' },
  { id:23, date:'2026-05-29', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'何光宇', zh:'SPSS实操 III', en:'SPSS Practice III' },
  { id:24, date:'2026-06-01', wd:'周一', time:'13:30', end:'16:55', h:4, type:'Lecture',   teacher:'肖罗茜', zh:'临床研究问题的PICOS原则', en:'PICOS Principles in Clinical Research' },
  { id:25, date:'2026-06-05', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'林娜',   zh:'系统综述、meta分析', en:'Systematic Review & Meta-Analysis' },
  { id:26, date:'2026-06-08', wd:'周一', time:'13:30', end:'15:55', h:3, type:'Practicum', teacher:'肖罗茜', zh:'循证案例PICOS原则课堂讨论', en:'PICOS Principles Discussion' },
  { id:27, date:'2026-06-12', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Practicum', teacher:'林娜',   zh:'GRADE评分系统', en:'GRADE Rating System' },
  { id:28, date:'2026-06-19', wd:'周五', time:'09:50', end:'12:15', h:3, type:'Lecture',   teacher:'晏家骢', zh:'循证医学中的证据分级', en:'Evidence Grading in EBM' },
];

// ── 启动准备 ───────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(CONFIG.dataFile)) fs.writeFileSync(CONFIG.dataFile, '{}');

// ── 数据读写 ───────────────────────────────────────────────
function readDB()      { try { return JSON.parse(fs.readFileSync(CONFIG.dataFile,'utf8')); } catch(e){return {};} }
function writeDB(data) { fs.writeFileSync(CONFIG.dataFile, JSON.stringify(data, null, 2)); }

// ── Token 生成/验证 ────────────────────────────────────────
// Token = HMAC(secret, sessionId:timeWindow)
// timeWindow = floor(now / tokenSeconds) — changes every N seconds
function makeToken(sessionId, window) {
  return crypto.createHmac('sha256', CONFIG.tokenSecret)
               .update(`${sessionId}:${window}`)
               .digest('hex')
               .slice(0, 16);
}

function currentWindow() {
  return Math.floor(Date.now() / (CONFIG.tokenSeconds * 1000));
}

function isValidToken(sessionId, token) {
  const w = currentWindow();
  // Accept current window and the one before (grace period for slow scanners)
  return token === makeToken(sessionId, w) || token === makeToken(sessionId, w - 1);
}

// ── API: 公开 ──────────────────────────────────────────────

// 获取当前 token（管理员用，用于生成二维码URL）
app.get('/api/token/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const s  = SESSIONS.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: 'Session not found' });

  const w   = currentWindow();
  const tok = makeToken(id, w);
  const nextRefreshMs = ((w + 1) * CONFIG.tokenSeconds * 1000) - Date.now();
  const url = `${CONFIG.baseUrl}/?s=${id}&t=${tok}`;

  res.json({ token: tok, url, nextRefreshMs, sessionId: id });
});

// 获取课程信息（学生扫码后用）
app.get('/api/session/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const s  = SESSIONS.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  const db = readDB();
  const count = (db['s'+id] || []).length;
  res.json({ session: s, count });
});

// 签到提交
app.post('/api/checkin', (req, res) => {
  const { sessionId, token, name, studentId, deviceId } = req.body;

  const id = parseInt(sessionId);
  const s  = SESSIONS.find(x => x.id === id);
  if (!s) return res.status(400).json({ ok:false, error:'课程不存在' });

  // 验证 token
  if (!isValidToken(id, token)) {
    return res.status(400).json({ ok:false, error:'二维码已过期，请让老师刷新后重新扫码 / QR code expired, please ask teacher to refresh' });
  }

  if (!name || !name.trim())      return res.status(400).json({ ok:false, error:'请填写姓名 / Please enter your name' });
  if (!studentId || !studentId.trim()) return res.status(400).json({ ok:false, error:'请填写学号 / Please enter student ID' });
  if (!deviceId)                  return res.status(400).json({ ok:false, error:'设备标识缺失，请刷新重试' });

  const db  = readDB();
  const key = 's' + id;
  if (!db[key]) db[key] = [];

  // 检查 deviceId 是否已签到（每个微信/设备只能签一次）
  if (db[key].find(r => r.deviceId === deviceId)) {
    return res.status(400).json({ ok:false, error:'您已经签到过本次课程，不能重复签到' });
  }

  // 检查学号是否重复
  if (db[key].find(r => r.studentId.toLowerCase() === studentId.trim().toLowerCase())) {
    return res.status(400).json({ ok:false, error:`学号 ${studentId.trim()} 已签到，如有问题请联系老师` });
  }

  // 保存
  const now = new Date();
  const record = {
    name: name.trim(),
    studentId: studentId.trim(),
    deviceId,
    time: now.toLocaleTimeString('zh-CN',{hour12:false,timeZone:'Asia/Shanghai'}),
    timestamp: now.toISOString(),
  };
  db[key].push(record);
  writeDB(db);

  res.json({ ok:true, session:s, record });
});

// ── API: 管理员 ────────────────────────────────────────────

function authCheck(req, res) {
  // 支持 query string、请求头、请求体三种方式传密码
  const pw = req.query.pw || req.headers['x-admin-pw'] || (req.body && req.body.pw) || '';
  if (pw !== CONFIG.adminPassword) {
    res.status(401).json({ error:'密码错误 / Unauthorized' });
    return false;
  }
  return true;
}

// POST 登录接口 — 密码放在 body，不出现在 URL
app.post('/api/admin/login', (req, res) => {
  if (!authCheck(req, res)) return;
  const db = readDB();
  const result = SESSIONS.map(s => ({
    ...s,
    attendees: (db['s'+s.id] || []).map(r => ({ name:r.name, studentId:r.studentId, time:r.time })),
    count: (db['s'+s.id] || []).length,
  }));
  res.json({ ok: true, sessions: result });
});

// 获取全部签到数据
app.get('/api/admin/data', (req, res) => {
  if (!authCheck(req, res)) return;
  const db = readDB();
  const result = SESSIONS.map(s => ({
    ...s,
    attendees: (db['s'+s.id] || []).map(r => ({ name:r.name, studentId:r.studentId, time:r.time })),
    count: (db['s'+s.id] || []).length,
  }));
  res.json({ sessions: result, config: { tokenSeconds: CONFIG.tokenSeconds, baseUrl: CONFIG.baseUrl } });
});

// 导出单节课 CSV
app.get('/api/admin/export/:id', (req, res) => {
  if (!authCheck(req, res)) return;
  const id = parseInt(req.params.id);
  const s  = SESSIONS.find(x => x.id === id);
  if (!s) return res.status(404).json({ error:'Session not found' });

  const db = readDB();
  const list = db['s'+id] || [];
  const rows = [
    ['序号','姓名','学号','签到时间','课程','日期','教师'].join(','),
    ...list.map((r,i) => [i+1, `"${r.name}"`, r.studentId, r.time, `"${s.zh}"`, s.date, s.teacher].join(','))
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="session_${id}_${s.date}_${s.teacher}.csv"`);
  res.send('\ufeff' + rows.join('\n'));
});

// 导出全部（ZIP：每节课一个CSV）
app.get('/api/admin/export-all', (req, res) => {
  if (!authCheck(req, res)) return;
  const db = readDB();

  // 生成一个大CSV，用空行分隔每节课
  let out = '';
  SESSIONS.forEach((s, i) => {
    out += `\n== Session ${i+1}: ${s.date} ${s.zh} (${s.teacher}) ==\n`;
    out += ['序号','姓名','学号','签到时间'].join(',') + '\n';
    const list = db['s'+s.id] || [];
    if (list.length === 0) {
      out += '（无签到记录）\n';
    } else {
      list.forEach((r, j) => { out += [j+1, `"${r.name}"`, r.studentId, r.time].join(',') + '\n'; });
    }
    out += `共 ${list.length} 人签到\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="全部签到记录.csv"');
  res.send('\ufeff' + out);
});

// 公开配置（给前端用）
app.get('/api/config', (req, res) => {
  res.json({ sessions: SESSIONS, tokenSeconds: CONFIG.tokenSeconds, baseUrl: CONFIG.baseUrl });
});

// SPA fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(CONFIG.port, () => {
  console.log(`\n🏥  预防医学签到系统 v2 已启动`);
  console.log(`    本地访问:   http://localhost:${CONFIG.port}`);
  console.log(`    管理员后台: http://localhost:${CONFIG.port}/admin`);
  console.log(`    管理员密码: ${CONFIG.adminPassword}`);
  console.log(`    二维码刷新: 每 ${CONFIG.tokenSeconds} 秒\n`);
});
