# Minimal Demo Multi-Agent Plan

本次任务采用多 agent 协作，但写入范围必须分离。所有 agent 都需要知道：你不是一个人在代码库里工作，不要回滚其他人的改动，要适配已经存在的变更。

## Global Boundary

```text
Claude: frontend display implementation
Codex: backend / JSON / data contracts / QA data / scripts / workbench
```

Claude 可以读取 Codex-owned 文件，但默认不修改它们。Claude 若缺字段或缺数据，应输出 Codex 数据需求清单。

Codex 可以读取 Claude-owned 文件以理解展示需求，但不替 Claude 重做前端视觉。

## Agent 1: Product Scope Agent

Type: explorer or planning-only agent

Ownership:

```text
read-only
```

Task:

1. 对照 `docs/workbench/minimal-demo-workbench.md` 检查 demo 叙事是否完整。
2. 确认演示路径是否能讲清楚专业黑盒解码。
3. 输出缺口，不直接改文件。

## Agent 2: Codex Data / Backend Agent

Type: worker

Ownership:

```text
backend/**
src/data/types/**
src/services/**
src/hooks/useSmartQA.ts
src/hooks/useQAMatcher.ts
public/data/**
scripts/**
docs/workbench/**
.codex/**
.agents/**
```

Task:

1. 扩展 admissions 类型。
2. 补广东院校专业解码 demo 数据。
3. 补 QA 模板和意图。
4. 维护工作台、脚本和校验规则。
5. 运行 `npm run check:data`、`npm run check:types`、`npm run demo:loop`。

Do not:

1. 不改 `src/pages/Intro.tsx`。
2. 不替 Claude 重做前端页面视觉。
3. 不回滚 Claude 的前端展示改动。

## Agent 3: Claude Frontend Agent

Type: worker

Ownership:

```text
src/components/admissions/UniversityDetailPanel.tsx
src/components/admissions/ScoreHero.tsx
src/components/admissions/UniversityGrid.tsx
src/components/admissions/PlanBlueprintSheet.tsx
src/components/qa/ChatInterface.tsx
src/pages/Home.tsx
src/pages/Admissions.tsx
src/pages/QuizResult.tsx
src/pages/Explore.tsx
src/pages/QA.tsx
src/components/demo/**
docs/workbench/minimal-demo-change-log.md
```

Task:

1. 在现有风格内展示专业解码和推荐解释。
2. 不改 Intro。
3. 不改导航、App 路由、全局 CSS。
4. 不改 JSON、后端或数据类型。
5. 不引入新 UI 框架。
6. 把所有视觉文件变更写入 `docs/workbench/minimal-demo-change-log.md`。
7. 缺数据时输出 Codex 数据需求清单。

Do not:

1. 不改 `public/data/**`。
2. 不改 `backend/**`。
3. 不改 `src/data/types/**`。
4. 不回滚 Codex 的数据/后端改动。

## Agent 4: Verification Agent

Type: explorer or worker after implementation

Ownership:

```text
docs/workbench/minimal-demo-latest-report.json
public/data/meta/validation_report.json
dist/**
```

Task:

1. 运行 `npm run demo:loop`。
2. 读取失败项。
3. 按 ownership 路由失败项：数据/后端给 Codex，前端展示给 Claude。
4. 不通过时输出阻塞原因。

## Coordination Order

```text
Product Scope Agent reads and confirms scope
  -> Codex Data / Backend Agent implements data, types, QA templates, scripts
  -> Claude Frontend Agent renders Codex data in existing UI
  -> Verification Agent runs demo loop
  -> failed checks route back to the owning agent
```

## Spawn Prompts

### Codex Data / Backend Agent Prompt

```text
你负责最小 demo 的数据/后端轨，不负责页面视觉。
工作区：当前仓库根目录。

请只修改：
- backend/**
- src/data/types/**
- src/services/**
- src/hooks/useSmartQA.ts
- src/hooks/useQAMatcher.ts
- public/data/**
- scripts/**
- docs/workbench/**
- .codex/**
- .agents/**

约束：
- 不改 src/pages/Intro.tsx。
- 不改前端页面和组件，除非用户明确临时授权。
- 不回滚 Claude 的前端展示改动。
- 数据必须支撑“专业黑盒解码 -> 可解释智慧招生 -> 生涯规划延伸”。
- 保持 JSON 合法。

完成后运行：
- npm run check:data
- npm run check:types
- npm run demo:loop

最终列出修改文件、数据字段、验证结果。
```

### Claude Frontend Agent Prompt

```text
你负责把 demo 数据展示到现有 UI，不负责改数据结构。
工作区：当前仓库根目录。

请只修改：
- src/components/admissions/UniversityDetailPanel.tsx
- src/components/admissions/ScoreHero.tsx
- src/components/admissions/UniversityGrid.tsx
- src/components/admissions/PlanBlueprintSheet.tsx
- src/components/qa/ChatInterface.tsx
- src/pages/Home.tsx
- src/pages/Admissions.tsx
- src/pages/QuizResult.tsx
- src/pages/Explore.tsx
- src/pages/QA.tsx
- src/components/demo/** 如确实需要新增组件
- docs/workbench/minimal-demo-change-log.md

约束：
- 不改 src/pages/Intro.tsx。
- 不改 public/data/**。
- 不改 backend/**。
- 不改 src/data/types/**。
- 不改导航、App 路由、全局 CSS。
- 不改变现有风格：沿用深蓝 #0A2463、琥珀强调、玻璃态/白卡、圆角、Framer Motion。
- 不引入新 UI 框架。
- 每个视觉文件变更都写入 change log。
- 缺字段或缺数据时输出 Codex 数据需求清单，不要自己改 JSON。

完成后运行：
- npm run demo:loop

最终列出修改文件、验证结果、Codex 数据需求清单、任何残余风险。
```
