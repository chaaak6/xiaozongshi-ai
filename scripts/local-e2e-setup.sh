#!/bin/bash
# ============================================
# 小宗师AI 本地 E2E 测试环境搭建脚本
# 无需 Docker，使用本地 PostgreSQL
# ============================================
set -e

PGBIN="/c/Program Files/PostgreSQL/16/bin"
PGDATA="$HOME/pgdata_e2e"
PGPORT=5433

echo "=== 步骤 1: 启动 PostgreSQL ==="
export PGDATA
mkdir -p "$PGDATA"

# 如果数据目录不存在，初始化
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "初始化 PostgreSQL 数据目录..."
  "$PGBIN/initdb" -D "$PGDATA" --username=postgres --auth=trust
fi

# 停止已有的实例
"$PGBIN/pg_ctl" -D "$PGDATA" stop 2>/dev/null || true

# 启动
"$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PGPORT" -l "$PGDATA/pg.log" start
echo "PostgreSQL started on port $PGPORT"

# 创建数据库（如不存在）
"$PGBIN/psql" -h localhost -p $PGPORT -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='lobechat'" | grep -q 1 || \
  "$PGBIN/psql" -h localhost -p $PGPORT -U postgres -c "CREATE DATABASE lobechat;"

echo "=== 步骤 2: 应用数据库迁移 ==="
for f in packages/database/migrations/*.sql; do
  "$PGBIN/psql" -h localhost -p $PGPORT -U postgres -d lobechat -f "$f" 2>&1 | grep -E "ERROR|FATAL" || true
done
echo "迁移完成（忽略扩展不存在的错误）"

echo "=== 步骤 3: 创建 .env ==="
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lobechat
DATABASE_DRIVER=node
AUTH_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=
AUTH_EMAIL_VERIFICATION=false
KEY_VAULTS_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=
NEWAPI_PROXY_URL=https://your-newapi-server.com
NEWAPI_API_KEY=sk-test-key
APP_URL=http://localhost:3010
ENABLE_MOCK_DEV_USER=1
S3_ACCESS_KEY_ID=e2e-mock-access-key
S3_SECRET_ACCESS_KEY=e2e-mock-secret-key
S3_BUCKET=e2e-mock-bucket
S3_ENDPOINT=https://e2e-mock-s3.localhost
S3_ENABLE_PATH_STYLE=1
S3_SET_ACL=0
SSRF_ALLOW_PRIVATE_IP_ADDRESS=1
LLM_VISION_IMAGE_USE_BASE64=1
EOF
echo ".env created"

echo "=== 步骤 4: 安装 Playwright 浏览器 ==="
npx playwright install chromium 2>&1 | tail -3

echo "=== 完成 ==="
echo ""
echo "接下来可以运行："
echo "  1. 启动 dev server: bun run dev:next"
echo "  2. 运行单元测试: cd packages/model-runtime && npx vitest run"
echo "  3. E2E 冒烟测试: cd e2e && cross-env PORT=3010 DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lobechat npx cucumber-js --config cucumber.config.js --tags '@admin and @smoke'"
echo "  4. E2E NewAPI测试: cd e2e && cross-env PORT=3010 DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lobechat npx cucumber-js --config cucumber.config.js --tags '@newapi and @smoke'"
