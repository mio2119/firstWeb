# Minimal Demo Memory

## User Request

用户要按最小 demo 改法制作“慧招启涯”项目 demo：

1. 不改 `src/pages/Intro.tsx`。
2. 修改时不能改变前端风格。
3. 可以增加必要组件。
4. 先明确任务边界与目标。
5. 搭建任务工作台、任务流程、检验后自动修改循环、可用脚本、目录与内容记忆。
6. 实现多 agent 合作。
7. 使用恰当 skill。
8. 生成详细规划与 Claude Code prompt 命令。

## Narrative Source

参考文档核心叙事：

```text
专业黑盒存在 -> 平台负责解码 -> 解码后形成更高质量的招生决策 -> 沉淀为智慧招生 -> 延伸到生涯规划
```

一句话定义：

```text
慧招启涯是一款以专业黑盒解码为核心、以智慧招生为关键成果、以生涯规划为长期延伸的交互式智能决策平台。
```

## Existing Stack

```text
Vite + React + TypeScript
Tailwind utility classes in JSX
Framer Motion
GSAP on Intro only
lucide-react
Chart.js
FastAPI and Node demo backend already present
```

## Style Contract

Keep:

1. Deep navy `#0A2463`.
2. Amber accent.
3. Cream/off-white page background.
4. Glass or white cards.
5. Rounded panels.
6. Serif headings where already used.
7. Framer Motion entrance and slide animations.
8. Bottom dock navigation.

Avoid:

1. New color palette.
2. New nav structure.
3. New landing page.
4. Purple AI gradient look.
5. Dense enterprise dashboard look.
6. Full redesign of existing cards.

## Key Files

```text
docs/workbench/minimal-demo-workbench.md
docs/workbench/minimal-demo-check-loop.md
docs/workbench/minimal-demo-claude-code.md
docs/workbench/minimal-demo-config.json
docs/workbench/minimal-demo-change-log.md
docs/workbench/minimal-demo-style-baseline.json
scripts/minimal-demo-manifest.mjs
scripts/minimal-demo-verify.mjs
scripts/minimal-demo-loop.mjs
.agents/minimal-demo-agents.md
```

## Demo Implementation Target

Minimum viable demo:

1. Add `majorDecode` style data to Guangdong universities.
2. Show professional decode cards inside `UniversityDetailPanel`.
3. Keep admissions flow score-first, but enrich explanation after selecting a school.
4. Make QuizResult feel like user dynamic profile.
5. Add QA templates for professional decode and recommendation reasons.
6. Verify with `npm run demo:loop`.

## Current Do-Not-Touch

```text
src/pages/Intro.tsx
src/components/layout/DockNavigation.tsx
src/components/layout/MainLayout.tsx
App.tsx
index.css
```
