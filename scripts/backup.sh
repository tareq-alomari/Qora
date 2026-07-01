#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/qor3a/backups"
DB_NAME="${DB_NAME:-qor3a}"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR/database" "$BACKUP_DIR/uploads"

pg_dump -h "${DB_HOST:-localhost}" -U "${DB_USER:-postgres}" "$DB_NAME" | gzip > "$BACKUP_DIR/database/qor3a_$TIMESTAMP.sql.gz"

tar -czf "$BACKUP_DIR/uploads/uploads_$TIMESTAMP.tar.gz" -C /app uploads

find "$BACKUP_DIR/database" -name "qor3a_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR/uploads" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $TIMESTAMP"
