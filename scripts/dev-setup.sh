#!/bin/bash
# 小宗师AI 本地开发环境一键启动

set -e
PGBIN="/c/Program Files/PostgreSQL/16/bin"
PGDATA="$HOME/pgdata"
PGPORT=5433

echo "=== 1. 启动 PostgreSQL ==="
mkdir -p "$PGDATA"
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  "$PGBIN/initdb" -D "$PGDATA" --username=postgres --auth=trust
fi
"$PGBIN/pg_ctl" -D "$PGDATA" stop 2>/dev/null || true
"$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PGPORT" -l "$PGDATA/pg.log" start
"$PGBIN/psql" -h localhost -p $PGPORT -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='lobechat'" | grep -q 1 || \
  "$PGBIN/psql" -h localhost -p $PGPORT -U postgres -c "CREATE DATABASE lobechat;"

echo "=== 2. 数据库迁移 ==="
for f in packages/database/migrations/*.sql; do
  "$PGBIN/psql" -h localhost -p $PGPORT -U postgres -d lobechat -f "$f" 2>/dev/null || true
done

echo "=== 3. 初始化测试用户和模型 ==="
"$PGBIN/psql" -h localhost -p $PGPORT -U postgres -d lobechat << 'DBINIT'
-- Test user
INSERT INTO users (id, email, "fullName", created_at, updated_at) 
VALUES ('user_e2e_test_user_001', 'e2e-test@lobehub.com', 'E2E Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- NewAPI provider with credentials
INSERT INTO ai_providers (id, name, user_id, enabled, source, key_vaults, settings, fetch_on_client, check_model) 
VALUES ('newapi', 'AI 中转站', 'user_e2e_test_user_001', true, 'builtin', 
  '{"apiKey":"sk-WUL6JHiR0r2OPpCblfCG6zSGoxhoc5Jtn3OCMqCWtTIOO6SO","baseURL":"https://aihub.bielcrystal.com"}',
  '{"sdkType":"router","showModelFetcher":true,"supportResponsesApi":true}',
  false, 'gpt-4o-mini')
ON CONFLICT (id, user_id) DO UPDATE SET key_vaults = EXCLUDED.key_vaults, enabled = true;

-- AI Models
INSERT INTO ai_models (id, display_name, enabled, provider_id, type, user_id, source) VALUES
('openai/gpt-5.5', 'GPT 5.5', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote'),
('openai/gpt-5.4', 'GPT 5.4', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote'),
('anthropic/claude-sonnet-4.6', 'Claude Sonnet 4.6', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote'),
('anthropic/claude-opus-4.7', 'Claude Opus 4.7', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote'),
('deepseek-v4-pro', 'DeepSeek V4 Pro', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote'),
('qwen3.7-max', 'Qwen 3.7 Max', true, 'newapi', 'chat', 'user_e2e_test_user_001', 'remote')
ON CONFLICT (id, provider_id, user_id) DO NOTHING;

-- Default agent
INSERT INTO agents (id, slug, title, description, model, provider, user_id, created_at, updated_at)
VALUES ('agent_01', 'default', 'AI 中转站助手', '通过 NewAPI 中转站访问多种大模型', 'openai/gpt-5.5', 'newapi', 'user_e2e_test_user_001', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET model = 'openai/gpt-5.5', provider = 'newapi', updated_at = NOW();
DBINIT

echo "=== 4. 创建 .env ==="
cat > .env << 'ENVEOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/lobechat
DATABASE_DRIVER=node
AUTH_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=
AUTH_EMAIL_VERIFICATION=false
KEY_VAULTS_SECRET=ww+0igxjGRAAR/eTNFQ55VmhQB5KE5trFZseuntThJs=
NEWAPI_PROXY_URL=https://aihub.bielcrystal.com
NEWAPI_API_KEY=sk-WUL6JHiR0r2OPpCblfCG6zSGoxhoc5Jtn3OCMqCWtTIOO6SO
APP_URL=http://localhost:3010
ENABLE_MOCK_DEV_USER=1
MOCK_DEV_USER_ID=user_e2e_test_user_001
S3_ACCESS_KEY_ID=e2e-mock-access-key
S3_SECRET_ACCESS_KEY=e2e-mock-secret-key
S3_BUCKET=e2e-mock-bucket
S3_ENDPOINT=https://e2e-mock-s3.localhost
S3_ENABLE_PATH_STYLE=1
S3_SET_ACL=0
SSRF_ALLOW_PRIVATE_IP_ADDRESS=1
LLM_VISION_IMAGE_USE_BASE64=1
ENVEOF

echo "=== 5. 启动开发服务器 ==="
echo "启动 Vite SPA (9876)..."
BROWSER=none pnpm run dev:spa &
echo "等待 10 秒..."
sleep 10
echo "启动 Next.js (3010)..."
pnpm run dev:next &
echo "等待服务器就绪..."
sleep 15

echo ""
echo "=== 小宗师AI 开发环境就绪 ==="
echo ""
echo "  AI 聊天:   http://localhost:9876/agent/agent_01"
echo "  管理后台:  http://localhost:9876/admin"
echo "  NewAPI设置: http://localhost:9876/settings/provider/newapi"
echo ""
echo "  注意: 首次访问需要等待 Vite 编译 (约30秒)"
