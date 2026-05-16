# pSEO 自动化部署指南

## 🚀 一键部署到云端

### 前置条件

1. 拥有 GitHub 账号
2. 创建一个新的 GitHub 仓库
3. 安装 Git 并配置 SSH 密钥

### 步骤 1：配置 GitHub Secrets

在你的 GitHub 仓库中，进入 **Settings > Secrets and variables > Actions**，添加以下 secrets：

#### 用于 Vercel 部署（二选一）
| Secret 名称 | 值 | 获取方式 |
|------------|---|---------|
| `VERCEL_TOKEN` | Vercel API Token | Vercel 控制台 > Account Settings > Tokens |
| `VERCEL_ORG_ID` | Vercel 组织 ID | Vercel 组织设置页面 |
| `VERCEL_PROJECT_ID` | Vercel 项目 ID | Vercel 项目设置页面 |

#### 用于 Cloudflare Pages 部署（二选一）
| Secret 名称 | 值 | 获取方式 |
|------------|---|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare > My Profile > API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID | Cloudflare 首页右下角 |
| `CLOUDFLARE_PROJECT_NAME` | Pages 项目名称 | Cloudflare Pages 控制台 |

#### 用于通知（可选）
| Secret 名称 | 值 | 说明 |
|------------|---|------|
| `DISCORD_WEBHOOK` | Discord Webhook URL | 用于接收部署通知 |
| `EMAIL_USERNAME` | Gmail 邮箱地址 | 用于发送邮件通知 |
| `EMAIL_PASSWORD` | Gmail App Password | 需要开启 2FA |
| `NOTIFICATION_EMAIL` | 接收通知的邮箱 | 你的个人邮箱 |

### 步骤 2：选择部署方案

#### 方案 A：Vercel（推荐）

1. 在 Vercel 创建新项目，关联你的 GitHub 仓库
2. 设置构建命令：`npm run build`
3. 设置输出目录：`dist`
4. 取消勾选 "Install command"（使用默认）

#### 方案 B：Cloudflare Pages

1. 在 Cloudflare Pages 创建新项目
2. 关联你的 GitHub 仓库
3. 设置构建命令：`npm run build`
4. 设置输出目录：`dist`

### 步骤 3：配置域名（可选）

1. 在 Vercel/Cloudflare 中添加自定义域名
2. 在域名服务商处添加 DNS 记录
3. 配置 SSL 证书

### 步骤 4：验证自动化流程

手动触发一次 workflow 测试：
1. 进入 GitHub 仓库 > Actions
2. 选择 "pSEO Automation Pipeline"
3. 点击 "Run workflow"
4. 观察运行状态

### ⏰ 定时任务配置

当前配置为每天凌晨 2:00 UTC 自动运行：
```yaml
cron: '0 2 * * *'
```

可修改 `.github/workflows/deploy.yml` 调整频率：
- 每6小时：`0 */6 * * *`
- 每天：`0 2 * * *`
- 每周：`0 2 * * 0`

### 📊 监控与日志

1. **GitHub Actions**：查看每次运行的详细日志
2. **Vercel/Cloudflare**：查看部署历史和性能指标
3. **Discord/Email**：接收部署状态通知

### 🔧 本地测试

```bash
# 安装依赖
npm install

# 生成内容（含安全验证）
npm run generate

# 构建站点
npm run build

# 启动开发服务器
npm run dev
```

### 📝 项目结构

```
pseo-project/
├── .github/workflows/
│   ├── deploy.yml          # Vercel 部署配置
│   └── deploy-cloudflare.yml # Cloudflare 部署配置
├── scripts/
│   ├── generate-content.js  # 内容生成器
│   ├── build-site.js        # 站点构建器
│   ├── content-validator.js # 安全验证器
│   └── review-pending.js    # 待审核管理
├── content/                 # 已批准的文章
├── content-rejected/        # 被拦截的文章（回收站）
├── dist/                    # 构建输出
└── package.json
```

### 🚨 故障排除

**问题 1：构建失败**
- 检查 Node.js 版本是否正确
- 检查依赖是否完整安装

**问题 2：部署失败**
- 检查 API Token 是否正确
- 检查项目 ID 是否匹配

**问题 3：定时任务不运行**
- 确保仓库有最新提交
- 检查 GitHub Actions 是否启用

---

完成以上配置后，你的 pSEO 系统将实现完全自动化运行！🎉