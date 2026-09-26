# BluntForce CN

宠物健康记录与经验分享社区。保留原有 Next.js 页面和业务结构，后端完全由阿里云资源承载：

- ECS：Docker 运行 Next.js 与 Nginx
- RDS PostgreSQL：用户、宠物、健康记录、帖子、评论、点赞与收藏
- OSS：头像及帖子图片
- 应用自身认证：bcrypt 密码哈希 + HttpOnly JWT Cookie

本项目不使用 Supabase 或 Vercel。

## 本地配置

```bash
cp .env.production.example .env.local
npm install
npm run dev
```

设置 `DATABASE_URL`、`SESSION_SECRET` 和全部 `OSS_*` 参数。用 `database/init.sql` 初始化一套全新的 RDS PostgreSQL 数据库。

## ECS 部署

```bash
cp .env.production.example .env.production
# 编辑 .env.production，填入真实的 RDS、OSS 与 SESSION_SECRET 值
docker compose --env-file .env.production up --build -d
```

应用通过 Compose 内的 Nginx 监听 80 端口；正式域名和备案完成后，再在 Nginx 前配置 HTTPS 证书。

## GitHub 自动部署

`.github/workflows/deploy.yml` 会在 `main` 分支推送后 SSH 到 ECS 并执行 `git pull --ff-only` 与 `docker compose up --build -d`。它需要以下 GitHub Actions Secrets：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_PATH`，例如 `/opt/bluntforce`

生产密钥只保存在 ECS 的 `.env.production`，不放入 GitHub Secrets 或仓库。
