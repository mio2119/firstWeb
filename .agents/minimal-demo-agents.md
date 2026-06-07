# Minimal Demo Multi-Agent Plan

本次任务采用多 agent 协作，但写入范围必须分离。所有 agent 都需要知道：你不是一个人在代码库里工作，不要回滚其他人的改动，要适配已经存在的变更。

## Agent 1: Demo Product Planner

Type: explorer or planning-only agent

Ownership:

```text
read-only
```

Task:

1. 对照 `docs/workbench/minimal-demo-workbench.md` 检查 demo 叙事是否完整。
2. 确认演示路径是否能讲清楚专业黑盒解码。
3. 输出缺口，不直接改文件。

## Agent 2: Data Contract Worker

Type: worker

Ownership:

```text
src/data/types/admissions.ts
public/data/provinces/gd/universities.json
public/data/qa/intents.json
public/data/qa/templates.json
public/data/meta/synonyms.json
```

Task:

1. 扩展 admissions 类型。
2. 补广东院校专业解码 demo 数据。
3. 补 QA 模板和意图。
4. 运行 `npm run check:data`。

## Agent 3: Frontend Explanation Worker

Type: worker

Ownership:

```text
src/components/admissions/UniversityDetailPanel.tsx
src/components/admissions/ScoreHero.tsx
src/pages/Admissions.tsx
src/pages/QuizResult.tsx
src/components/demo/**
```

Task:

1. 在现有风格内展示专业解码和推荐解释。
2. 不改 Intro。
3. 不改导航。
4. 不引入新 UI 框架。
5. 把所有视觉文件变更写入 `docs/workbench/minimal-demo-change-log.md`。

## Agent 4: Verification Agent

Type: explorer or worker after implementation

Ownership:

```text
docs/workbench/minimal-demo-latest-report.json
```

Task:

1. 运行 `npm run demo:loop`。
2. 读取失败项。
3. 只修复自己被授权的范围。
4. 不通过时输出阻塞原因。

## Coordination Order

```text
Planner reads and confirms scope
  -> Data Contract Worker implements data and templates
  -> Frontend Explanation Worker renders the data
  -> Verification Agent runs demo loop
  -> failed checks route back to the owning agent
```

## Spawn Prompts

### Data Contract Worker Prompt

```text
你负责最小 demo 的数据和类型，不负责页面视觉。
工作区：当前仓库根目录。
请只修改：
- src/data/types/admissions.ts
- public/data/provinces/gd/universities.json
- public/data/qa/intents.json
- public/data/qa/templates.json
- public/data/meta/synonyms.json

约束：
- 不改 src/pages/Intro.tsx。
- 不改页面组件。
- 数据必须支撑“专业黑盒解码 -> 可解释智慧招生 -> 生涯规划延伸”。
- 保持 JSON 合法。
- 运行 npm run check:data。
最终列出修改文件、数据字段、验证结果。
```

### Frontend Explanation Worker Prompt

```text
你负责把 demo 数据展示到现有 UI，不负责改数据结构。
工作区：当前仓库根目录。
请只修改：
- src/components/admissions/UniversityDetailPanel.tsx
- src/components/admissions/ScoreHero.tsx
- src/pages/Admissions.tsx
- src/pages/QuizResult.tsx
- src/components/demo/** 如确实需要新增组件
- docs/workbench/minimal-demo-change-log.md

约束：
- 不改 src/pages/Intro.tsx。
- 不改导航、App 路由、全局 CSS。
- 不改变现有风格：沿用深蓝 #0A2463、琥珀强调、玻璃态/白卡、圆角、Framer Motion。
- 不引入新 UI 框架。
- 每个视觉文件变更都写入 change log。
- 运行 npm run demo:loop。
最终列出修改文件、验证结果、任何残余风险。
```
