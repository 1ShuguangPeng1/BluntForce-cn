#!/usr/bin/env sh
set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
backup_dir="$project_dir/backups"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$backup_dir"

cd "$project_dir"
docker compose --env-file .env.production exec -T postgres sh -c \
  'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "$backup_dir/database-$timestamp.sql.gz"

docker run --rm \
  -v bluntforce_uploads_data:/source:ro \
  -v "$backup_dir:/backup" \
  alpine:3.20 \
  tar -czf "/backup/uploads-$timestamp.tar.gz" -C /source .

echo "Backup created in $backup_dir"
