# Claude Code Prompt Pack For Minimal Demo

下面的 prompt 可以直接复制给 Claude Code。建议一次只执行一个阶段，避免改动过大。

## 0. Environment Command

```powershell
cd "C:\Users\zzh\Desktop\新建文件夹(1)\新建文件夹\firstWeb-main\firstWeb-main"
npm run demo:manifest
```

## 1. Master Prompt

```text
你正在修改一个 Vite + React + TypeScript 项目，目标是按最小 demo 改法，把“慧招启涯”从普通志愿推荐展示升级为能演示“专业黑盒解码 -> 可解释智慧招生 -> 生涯规划延伸”的 demo。

先阅读：
- docs/workbench/minimal-demo-workbench.md
- docs/workbench/minimal-demo-check-loop.md
- docs/workbench/minimal-demo-config.json
- .codex/minimal-demo-memory.md
- .agents/minimal-demo-agents.md

硬性约束：
- 不要修改 src/pages/Intro.tsx。
- 不要改变前端风格。
- 可以增加必要组件，但必须沿用现有深蓝 #0A2463、琥珀强调、白色/玻璃态卡片、圆角、Framer Motion 动效节奏。
- 不要重做导航、App 路由、全局 CSS、品牌视觉或 Intro 动画。
- 不要引入新 UI 框架。除非绝对必要，不新增依赖。
- 不要把 demo 数据说成真实权威数据。

最小实现目标：
1. 扩展 admissions 类型，支持专业解码字段。
2. 给 public/data/provinces/gd/universities.json 的广东院校补专业解码样例。
3. 在 UniversityDetailPanel.tsx 中展示推荐理由、课程体系、能力要求、职业路径、风险提示和替代路径。
4. 在 QuizResult.tsx 中把 MBTI 结果表达为用户动态画像，但保持原页面风格。
5. 在 QA 数据中增加专业解码、推荐理由、风险解释、职业路径相关模板。
6. 如有视觉文件变更，更新 docs/workbench/minimal-demo-change-log.md。
7. 运行 npm run demo:loop，根据 docs/workbench/minimal-demo-latest-report.json 修复失败项，直到通过或说明阻塞原因。

请先输出你将修改的文件清单和每个文件的目的，然后再实施。每次只做小步改动。
```

## 2. Data Contract Prompt

```text
执行最小 demo 的数据层改造。

只允许修改：
- src/data/types/admissions.ts
- public/data/provinces/gd/universities.json
- public/data/qa/intents.json
- public/data/qa/templates.json
- public/data/meta/synonyms.json

目标：
- 在 UniversityDetail 类型中加入专业解码字段，例如 majorDecode、decisionNotes。
- 给广东 5 所院校补充 2 个左右专业解码样例。
- 每个专业解码要包含：课程体系、能力要求、职业路径、推荐理由、风险提示、替代路径。
- 新增 QA intent/template，覆盖：专业黑盒、专业解码、推荐理由、风险提示、职业路径。

约束：
- JSON 必须合法。
- 不要改任何页面和组件。
- 不要改 src/pages/Intro.tsx。

完成后运行：
npm run check:data
npm run check:types
```

## 3. Frontend Explanation Prompt

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
- 不新增 UI 框架。
- 不改变现有视觉风格。

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

最后输出：
- 通过/失败状态
- 失败项和修复方式
- 是否仍有残余风险
```

## 5. One-Shot Claude Code Command

如果希望 Claude Code 一次接管，可使用：

```powershell
claude --dangerously-skip-permissions
```

然后粘贴 `Master Prompt`。

更稳妥的方式是分三轮粘贴：

```text
Data Contract Prompt
Frontend Explanation Prompt
Verification Prompt
```

## 6. Expected Final Verification

```powershell
npm run demo:loop
npm run check:data
npm run check:types
npm run build
```
