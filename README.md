# BluntForce CN

宠物健康记录与经验分享社区。当前部署模式是在一台阿里云 ECS 上运行完整服务：

- ECS：Docker 运行 Next.js 与 Nginx
- PostgreSQL 容器：用户、宠物、健康记录、帖子、评论、点赞与收藏
- 社交功能：好友申请、好友管理与一对一私信
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
应用启动时还会执行幂等迁移，为已有数据库补充新表和索引，不会清空现有数据。
将站长登录邮箱写入 `ADMIN_EMAILS`；多个管理员邮箱使用英文逗号分隔。只有这里列出的账号可以置顶或取消置顶帖子。

## ECS 部署

```bash
cp .env.production.example .env.production
# 编辑 .env.production，确保 POSTGRES_PASSWORD 与 DATABASE_URL 中的密码完全一致
docker compose --env-file .env.production up --build -d
```

应用通过 Compose 内的 Nginx 监听 80 端口。`postgres_data` 和 `uploads_data` 是持久化卷，普通的重新构建不会删除数据。不要执行 `docker compose down -v`。正式域名准备好后再配置 HTTPS。

通过公网 IP 的 HTTP 测试阶段保持 `SESSION_COOKIE_SECURE=false`。配置 HTTPS 后必须改为 `true` 并重启应用。

手动备份数据库和图片：

```bash
sh scripts/backup.sh
```

备份写入仓库目录下的 `backups/`。同盘备份只能防误操作，不能防系统盘损坏；正式运营前应把备份再复制到另一台设备或云存储。

## GitHub 自动部署

`.github/workflows/deploy.yml` 会在 `main` 分支推送后，把 Git bundle 主动上传到 ECS，再执行仅快进更新和 `docker compose up --build -d`。ECS 不需要主动访问 GitHub。它需要以下 GitHub Actions Secrets：

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_PRIVATE_KEY_B64`，部署私钥经过 Base64 编码后的单行内容
- `DEPLOY_PATH`，例如 `/opt/bluntforce`

生产密钥只保存在 ECS 的 `.env.production`，不放入 GitHub Secrets 或仓库。
