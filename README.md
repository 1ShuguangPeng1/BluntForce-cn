# BluntForce CN

宠物健康记录与经验分享社区。当前部署模式是在一台阿里云 ECS 上运行完整服务：

- ECS：Docker 运行 Next.js 与 Nginx
- PostgreSQL 容器：用户、宠物、健康记录、帖子、评论、点赞与收藏
- 本地持久化卷：头像及帖子图片
- 应用自身认证：bcrypt 密码哈希 + HttpOnly JWT Cookie

本项目不使用 Supabase 或 Vercel。

## 本地配置

```bash
cp .env.production.example .env.local
npm install
npm run dev
```

设置 `SESSION_SECRET`、`POSTGRES_*` 与 `DATABASE_URL`。PostgreSQL 首次启动时会自动执行 `database/init.sql`。

## ECS 部署

```bash
cp .env.production.example .env.production
# 编辑 .env.production，确保 POSTGRES_PASSWORD 与 DATABASE_URL 中的密码完全一致
docker compose --env-file .env.production up --build -d
```

应用通过 Compose 内的 Nginx 监听 80 端口。`postgres_data` 和 `uploads_data` 是持久化卷，普通的重新构建不会删除数据。不要执行 `docker compose down -v`。正式域名准备好后再配置 HTTPS。

手动备份数据库和图片：

```bash
sh scripts/backup.sh
```

备份写入仓库目录下的 `backups/`。同盘备份只能防误操作，不能防系统盘损坏；正式运营前应把备份再复制到另一台设备或云存储。

## GitHub 自动部署

`.github/workflows/deploy.yml` 会在 `main` 分支推送后 SSH 到 ECS 并执行 `git pull --ff-only` 与 `docker compose up --build -d`。它需要以下 GitHub Actions Secrets：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_PATH`，例如 `/opt/bluntforce`

生产密钥只保存在 ECS 的 `.env.production`，不放入 GitHub Secrets 或仓库。
