# Claude Code Prompt Pack For Minimal Demo

下面的 prompt 可以直接复制给 Claude Code。当前协作边界是双轨：

```text
Claude: 前端展示实现
Codex: 后端 / JSON / 数据结构 / QA 数据 / 工作台脚本
```

Claude 可以读取 Codex 产出的 JSON 和类型，但默认不要修改它们。如果 Claude 发现缺字段、缺 demo 数据或接口不匹配，应输出需求清单，交给 Codex 修改。

## 0. Environment Command

```powershell
cd "C:\Users\zzh\Desktop\新建文件夹(1)\新建文件夹\firstWeb-main\firstWeb-main"
npm run demo:manifest
```

## 1. Claude Frontend Master Prompt

```text
你正在负责当前 Vite + React + TypeScript 项目的“最小 demo 前端展示改造”。

重要边界：
- 前端展示由 Claude 实现。
- 后端、JSON、数据结构、QA 模板由 Codex 实现。
- 你可以读取 public/data/**、src/data/types/**、backend/**，但默认不要修改它们。
- 如果前端需要新字段、新 JSON 数据或新接口，请列出“Codex 数据需求清单”，不要自己改 JSON。

先阅读：
- docs/workbench/minimal-demo-workbench.md
- docs/workbench/minimal-demo-check-loop.md
- docs/workbench/minimal-demo-config.json
- .codex/minimal-demo-memory.md
- .agents/minimal-demo-agents.md

硬性约束：
- 不要修改 src/pages/Intro.tsx。
- 不要修改 public/data/**、backend/**、src/data/types/**，除非用户明确临时授权。
- 不要改变前端风格。
- 可以增加必要组件，但必须沿用现有深蓝 #0A2463、琥珀强调、白色/玻璃态卡片、圆角、Framer Motion 动效节奏。
- 不要重做导航、App 路由、全局 CSS、品牌视觉或 Intro 动画。
- 不要引入新 UI 框架。除非绝对必要，不新增依赖。
- 不要把 demo 数据说成真实权威数据。

Claude 允许修改：
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
- src/components/demo/** 如需要新增小组件
- docs/workbench/minimal-demo-change-log.md

Claude 禁止修改：
- src/pages/Intro.tsx
- App.tsx
- index.css
- src/components/layout/DockNavigation.tsx
- src/components/layout/MainLayout.tsx
- public/data/**
- backend/**
- src/data/types/**

前端最小实现目标：
1. 在 UniversityDetailPanel.tsx 中展示 Codex 已提供的专业黑盒解码内容。
2. 展示结构包括：推荐理由、核心课程、能力要求、职业路径、风险提示、替代路径。
3. 在 QuizResult.tsx 中把 MBTI 结果表达为用户动态画像，但保持原页面风格。
4. 如 Admissions 或 Home 需要承接 demo 叙事，只做文案/信息层增强，不重做布局。
5. 如有视觉文件变更，更新 docs/workbench/minimal-demo-change-log.md。
6. 运行 npm run demo:loop，根据 docs/workbench/minimal-demo-latest-report.json 修复属于 Claude 前端范围的失败项。

开始前先输出：
- 任务边界
- 你准备修改的前端文件清单
- 每个文件的修改目的
- 你不会修改的 Codex-owned 文件清单
- 若缺数据，列出 Codex 数据需求清单
- 验收标准

然后再实施。每次只做小步改动。
```

## 2. Codex Data / Backend Prompt

这段不是给 Claude 的，是给 Codex 或 Codex 子 agent 的：

```text
你负责最小 demo 的数据/后端轨，不负责前端展示。

只允许修改：
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

目标：
- 在 UniversityDetail 类型中加入专业解码字段，例如 majorDecode、decisionNotes。
- 给广东 5 所院校补充 2 个左右专业解码样例。
- 每个专业解码要包含：课程体系、能力要求、职业路径、推荐理由、风险提示、替代路径。
- 新增 QA intent/template，覆盖：专业黑盒、专业解码、推荐理由、风险提示、职业路径。
- 如 Claude 提供“数据需求清单”，优先满足这些字段。

约束：
- JSON 必须合法。
- 不要改 src/pages/Intro.tsx。
- 不要替 Claude 重做前端视觉。
- 不要改前端页面和组件，除非用户明确临时授权。

完成后运行：
npm run check:data
npm run check:types
npm run demo:loop
```

## 3. Claude Frontend Explanation Prompt

```text
执行最小 demo 的前端展示改造。

先阅读：
- docs/workbench/minimal-demo-workbench.md
- docs/workbench/minimal-demo-config.json
- .codex/minimal-demo-memory.md

允许修改：
- src/components/admissions/UniversityDetailPanel.tsx
- src/components/admissions/ScoreHero.tsx
- src/pages/Admissions.tsx
- src/pages/QuizResult.tsx
- src/components/demo/** 如需要新增小组件
- docs/workbench/minimal-demo-change-log.md

目标：
- 在院校详情弹层中展示专业黑盒解码内容。
- 展示结构包括：推荐理由、核心课程、能力要求、职业路径、风险提示、替代路径。
- 保持现有弹层 header、宽度、背景、颜色、圆角、动效。
- QuizResult 只做“动态画像”表达增强，不重排整个页面。
- 所有视觉文件变更写入 minimal-demo-change-log。

禁止：
- 不改 src/pages/Intro.tsx。
- 不改 App.tsx、index.css、DockNavigation、MainLayout。
- 不改 public/data/**、backend/**、src/data/types/**。
- 不新增 UI 框架。
- 不改变现有视觉风格。

如果缺数据：
- 不要自己改 JSON。
- 输出 Codex 数据需求清单。

完成后运行：
npm run demo:loop
```

## 4. Verification Prompt

```text
请作为验证 agent 检查最小 demo。

运行：
npm run demo:loop

如果失败，读取：
docs/workbench/minimal-demo-latest-report.json

规则：
- 只修失败项。
- src/pages/Intro.tsx 不得修改。
- 视觉文件变更必须在 docs/workbench/minimal-demo-change-log.md 记录。
- 不要通过重新生成 baseline 来隐藏失败。
- 数据/后端/JSON 失败交给 Codex。
- 前端展示/视觉白名单失败交给 Claude。

最后输出：
- 通过/失败状态
- 失败项和 owner
- 修复方式或交接需求
- 是否仍有残余风险
```

## 5. One-Shot Claude Code Command

如果希望 Claude Code 接管前端轨，可使用：

```powershell
claude --dangerously-skip-permissions
```

然后只粘贴 `Claude Frontend Master Prompt`。

不要把 `Codex Data / Backend Prompt` 粘贴给 Claude，除非你决定临时让 Claude 接管数据轨。

## 6. Expected Final Verification

```powershell
npm run demo:loop
npm run check:data
npm run check:types
npm run build
```
