# Workbench Memory

## Project Identity

项目是“慧招启航 / Smart Enroll”，一个高考志愿、MBTI 测评、生涯探索和智能问答一体化网站。

## Non-Negotiable Constraints

1. 不改变现有前端风格。
2. 可以新增必要组件，但必须沿用现有设计语言。
3. 后端化应先接管数据来源和状态持久化，再考虑认证、数据库和 AI/RAG。
4. 当前阶段是工作台和骨架，不宣称已经完成生产级后端。

## Important Frontend Files

```text
App.tsx
src/pages/Admissions.tsx
src/pages/Explore.tsx
src/pages/QA.tsx
src/pages/Quiz.tsx
src/pages/QuizResult.tsx
src/pages/Profile.tsx
src/hooks/useData.ts
src/hooks/useSmartQA.ts
src/hooks/useQAMatcher.ts
src/hooks/useExplore.ts
src/hooks/useMBTI.ts
src/context/UserContext.tsx
src/context/PlanContext.tsx
src/services/apiClient.ts
```

## Important Backend Files

```text
backend/app/main.py
backend/app/core/config.py
backend/app/core/paths.py
backend/app/services/json_repository.py
backend/app/services/qa_engine.py
backend/app/services/state_store.py
backend/app/routers/*.py
backend/requirements.txt
backend/node_server.mjs
```

## Workbench Commands

```bash
npm run workbench:manifest
npm run workbench:verify
npm run workbench:loop
npm run backend:dev
npm run backend:dev:fastapi
npm run build
```

## Current Integration State

1. `useData` keeps existing page calls intact but reads `data/*.json` through `/api/data/*` first, then falls back to the static Vite/GitHub Pages path.
2. `useSmartQA` calls `/api/qa/chat` first and falls back to the existing frontend matcher.
3. `useMBTI` submits answers to `/api/quiz/submit` after local scoring, preserving the original animation timing.
4. `UserContext` and `PlanContext` sync to demo backend state while preserving LocalStorage fallback.
5. `Home.tsx` uses `apiClient.getUniversities()` for hot universities; the style manifest was regenerated after confirming this was a data-source-only change.

## Auto-Fix Loop

1. 运行 `npm run workbench:verify`。
2. 阅读 `docs/workbench/latest-report.json`。
3. 只修改失败项对应文件。
4. 如果涉及前端页面或组件，先确认是否是风格必要改动。
5. 重复运行验证，直到通过或把阻塞原因写入最终说明。
