# 预防医学签到系统 v2
# Preventive Medicine Attendance System

## 功能特点
- ✅ 下拉菜单选择课程，按月分组
- ✅ 动态二维码（每10分钟自动刷新，防止截图传播）
- ✅ 倒计时显示下次刷新时间
- ✅ 每个微信/设备只能签到一次
- ✅ 实时显示签到人数（每10秒刷新）
- ✅ 管理员后台查看全部记录
- ✅ 每节课单独导出 CSV / 导出全部汇总
- ✅ 数据存储在服务器，不依赖浏览器

---

## 三步部署（Railway，免费，最简单）

### 方法一：Railway 一键部署（推荐）

1. 注册 [Railway](https://railway.app)（免费）
2. 新建项目 → Deploy from GitHub
3. 上传这三个文件到 GitHub 仓库
4. 设置环境变量（在 Railway 控制台 → Variables）：
   ```
   ADMIN_PW     = 你的管理员密码
   TOKEN_SECRET = 随便填一串字符（密钥）
   BASE_URL     = https://你的项目.up.railway.app
   PORT         = 3000
   ```
5. 部署完成后访问你的 URL

### 方法二：Render（同样免费）

同理，上传到 GitHub → 在 render.com 新建 Web Service → 设置环境变量。

### 方法三：本地/内网运行（最简单）

```bash
# 1. 安装 Node.js（https://nodejs.org）
# 2. 安装依赖
npm install

# 3. 启动（本机）
npm start

# 4. 访问
# 管理员：http://localhost:3000
# 如需内网其他设备访问，将 BASE_URL 改成本机IP
```

---

## 配置说明（server.js 顶部 CONFIG）

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `adminPassword` | 管理员登录密码 | KMUST@2026 |
| `baseUrl` | 公网地址（生成二维码用）| http://localhost:3000 |
| `tokenSecret` | Token签名密钥（随意填写） | pmatt-secret |
| `tokenMinutes` | 二维码多少分钟刷新一次 | 10 |

---

## 使用流程

### 老师（管理员）
1. 访问 `你的网址`，输入密码登录
2. 顶部下拉菜单选择今天的课程
3. 出现大二维码，投影展示给学生扫
4. 右上角显示实时签到人数，10秒刷新
5. 二维码每10分钟自动更新（倒计时可见）
6. 切换到"签到记录"标签查看详情，点击 CSV 按钮导出

### 学生
1. 微信扫描二维码
2. 填写姓名 + 学号
3. 点击签到 → 完成
4. 同一手机不能重复签到（设备绑定）

---

## 文件结构

```
pmatt4/
├── server.js        # 服务器（API + 静态文件）
├── package.json     # 依赖
├── data/
│   └── attendance.json  # 签到数据（自动生成）
└── public/
    └── index.html   # 前端（管理员 + 学生）
```
