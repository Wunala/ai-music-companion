# AI Music Companion

一个理解用户当下状态，并解释“为什么此刻适合听这首歌”的 AI 音乐伴侣 MVP。

歌单是入口，用户拥有的音乐记忆才是产品核心。V0.1 已跑通：

```text
描述状态 → 生成歌单 → 记录真实感受 → 音乐记忆时间线 → 派生音乐人格
```

## 项目结构

```text
frontend/   Next.js + TypeScript + Tailwind CSS
backend/    FastAPI + 可替换的 Playlist Agent
```

## 本地运行

### 1. 启动后端

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API 文档：<http://localhost:8000/docs>

### 2. 启动前端

```powershell
cd frontend
npm install
npm run dev
```

访问：<http://localhost:3000>

默认 API 地址为 `http://localhost:8000`。如需修改，复制
`frontend/.env.example` 为 `frontend/.env.local`。

## API

- `GET /health`：健康检查
- `POST /api/v1/playlists/generate`：根据用户状态生成歌单
- `POST /api/v1/memories`：保存歌曲、场景与用户感受
- `GET /api/v1/memories`：读取用户的音乐记忆时间线
- `GET /api/v1/profile`：读取由记忆派生的音乐人格

当前使用 `MockPlaylistAgent`。后续接入真实 LLM 时，实现
`PlaylistAgent` 协议，并在 `backend/agents/__init__.py` 中替换即可。

## Agent 互操作方向

未来提供给其他 Agent 的不是原始私人记忆，而是经过用户授权、用途限制和
隐私过滤的派生偏好。`GET /api/v1/profile` 中的 `agent_context` 是这个边界
的最小原型：包含置信度和证据范围，并明确不暴露原始记忆。
