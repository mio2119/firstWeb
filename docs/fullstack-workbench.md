# Fullstack Workbench

## 1. Task Boundary

本次任务的目标是把现有前端项目升级为可继续全栈化开发的网站工程，但不改变当前前端视觉风格。

当前阶段只做三件事：

1. 明确后端化范围、目标、阶段和验收标准。
2. 搭建后端工程骨架，让数据、问答、测评、志愿方案等能力具备 API 化入口。
3. 建立前后端联调工作台，确保后续迁移时不破坏现有页面风格。

本轮已完成的实现边界：

1. `src/services/apiClient.ts` 作为统一 API 客户端，覆盖数据读取、问答、测评提交、用户状态和志愿方案读写。
2. `src/hooks/useData.ts` 对原有 `data/*.json` 调用采用 API 优先策略：先请求 `/api/data/*`，失败后回退到 GitHub Pages 静态路径。
3. `src/hooks/useSmartQA.ts` 优先调用 `/api/qa/chat`，后端不可用时保留前端规则匹配兜底。
4. `src/hooks/useMBTI.ts` 保持原有卡片动画和本地计分体验，同时在完成后提交 `/api/quiz/submit` 做后端结果校验。
5. `src/context/UserContext.tsx` 和 `src/context/PlanContext.tsx` 接入后端 demo 状态持久化，保留 LocalStorage 作为离线/静态部署兜底。

本阶段不做：

1. 不重设计首页、测评页、院校页、问答页、个人中心。
2. 不改动现有页面配色、布局、动效、卡片样式和导航风格。
3. 不承诺已经完成生产级登录注册、权限体系、RAG、模型微调或多 Agent。
4. 不删除现有 `public/data` JSON 数据，后端先复用它们作为数据源。

## 2. Target State

项目最终应形成前后端分离架构：

```text
React + TypeScript + Vite
        |
        | /api
        v
FastAPI Backend
        |
        | JSON bootstrap first, database later
        v
SQLite / PostgreSQL
```

目标能力：

1. 院校、职业、MBTI、问答模板等数据通过后端 API 提供。
2. 用户档案、MBTI 结果、收藏、浏览历史、志愿方案可以后端持久化。
3. 智能问答从前端规则匹配逐步迁移到后端，后续可接入大模型或 RAG。
4. 前端仅替换数据来源，不改变视觉组件和页面风格。
5. 支持本地联调、构建验证和后续部署。

## 3. Current Evidence

当前前端已有能力：

1. `src/pages/Admissions.tsx`: 院校筛选、详情弹层、分数分析入口。
2. `src/hooks/useSmartQA.ts` 和 `src/hooks/useQAMatcher.ts`: 规则问答、同义词、槽位抽取、模板回复。
3. `src/hooks/useMBTI.ts`: MBTI 四维度计分和结果计算。
4. `src/hooks/useExplore.ts`: 职业探索、偏好评分、标签和搜索筛选。
5. `src/context/UserContext.tsx`: 用户档案、收藏、历史、MBTI 的 LocalStorage 持久化。
6. `src/context/PlanContext.tsx`: 志愿方案的 LocalStorage 持久化。
7. `public/data`: 当前静态数据源。

## 4. Style Preservation Rules

后续开发必须遵守：

1. 前端视觉组件优先保持原样，只改数据获取和状态来源。
2. 新增组件必须沿用现有设计语言，例如玻璃态、深蓝主色、琥珀强调色、Framer Motion 动效节奏。
3. 不新增营销式落地页，不把已有应用改成介绍页。
4. 不把后端状态错误直接裸露到页面，应通过现有 loading/error 样式承接。
5. 所有 API 迁移先经 `src/services/apiClient.ts` 统一接入，避免页面里散落接口地址。

## 5. Backend Scope

第一阶段后端接口：

```text
GET  /api/health
GET  /api/workbench
GET  /api/data/{relative_json_path}

GET  /api/universities
GET  /api/universities/{university_id}

GET  /api/careers
GET  /api/careers/{career_id}

GET  /api/quiz/questions
GET  /api/quiz/mapping/{mbti_type}
POST /api/quiz/submit

POST /api/qa/chat

GET  /api/state
PUT  /api/state
DELETE /api/state
PUT  /api/state/profile
PUT  /api/state/mbti
PUT  /api/state/favorites
POST /api/state/favorites
DELETE /api/state/favorites/{item_id}
PUT  /api/state/history
POST /api/state/history
DELETE /api/state/history

GET  /api/plans
PUT  /api/plans
POST /api/plans
DELETE /api/plans/{uni_id}
```

第一阶段数据策略：

1. 继续复用 `public/data` 作为后端数据源。
2. 用户状态先写入 `backend/runtime/demo_state.json`。
3. 数据库迁移放到第二阶段，避免一次改动过大。

## 6. Migration Phases

阶段 1：工作台和后端最小骨架

1. 新增 `backend/`。
2. 新增 API 路由和服务层。
3. 新增前端 API client。
4. Vite dev server 代理 `/api` 到后端。
5. 确认前端构建不受影响。

阶段 2：前端数据源迁移

1. 已通过 `useData` 把旧 JSON 数据读取切到 `/api/data/*` 优先，保留静态兜底。
2. 首页热门院校已切到 `apiClient.getUniversities()`。
3. MBTI 完成后已提交 `/api/quiz/submit`，失败时使用本地计算兜底。
4. 问答模块已切到 `/api/qa/chat` 优先，失败时保留前端模板匹配兜底。

阶段 3：用户状态后端化

1. `UserContext` 已接入 `/api/state` 读写。
2. `PlanContext` 已接入 `/api/plans` 读写。
3. 保留 LocalStorage 作为短期降级缓存。

阶段 4：数据库和认证

1. SQLite 起步，后续可迁移 PostgreSQL。
2. 增加用户注册、登录、JWT 或 Session。
3. 状态表按用户隔离。

阶段 5：AI/RAG 能力

1. 将院校、职业、专业和问答模板整理为可检索知识库。
2. 后端先做结构化数据检索，再调用模型生成回答。
3. 返回结构化 blocks，保持前端聊天气泡风格不变。

## 7. Acceptance Criteria

本阶段完成标准：

1. 文档说明清楚任务边界、目标、阶段和不变约束。
2. 后端目录存在，且 API 路由职责清晰。
3. 前端有统一 API client，可作为后续迁移入口。
4. Vite 有 `/api` 代理配置，便于本地联调。
5. 没有改动现有页面视觉风格。
6. 前端构建仍能通过，或明确记录失败原因。
7. `npm run workbench:loop` 可以验证通用数据接口、问答、测评提交、状态写入和志愿方案增删。

## 8. Local Commands

安装后端依赖：

```bash
python -m pip install -r backend/requirements.txt
```

启动后端：

```bash
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

启动前端：

```bash
npm run dev
```

访问：

```text
Frontend: http://localhost:3000/firstWeb/
Backend:  http://127.0.0.1:8000/api/health
Docs:     http://127.0.0.1:8000/docs
```
