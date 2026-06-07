# Minimal Demo Workbench

## Design Read

Reading this as: existing product UI for an education innovation demo, with a polished academic glass-card language, leaning toward targeted evolution rather than redesign.

Applied skills:

1. `redesign-existing-projects`: used for preservation rules, scoped edits, and style-risk control.
2. `design-taste-frontend`: used only as a final quality checklist. The project is not a landing page redesign, so its high-variance redesign rules do not apply.

## Task Boundary

目标是按“最小 demo 改法”把现有网站变成能支撑文书叙事的演示版本：

```text
用户动态画像 -> 专业黑盒解码 -> 可解释智慧招生 -> 生涯规划延伸
```

本次允许做：

1. 增加少量静态 demo 数据。
2. 扩展 admissions 数据类型。
3. 在现有页面和组件中增加解释型内容区块。
4. 增加必要的小组件，但必须沿用现有视觉风格。
5. 补充 QA 模板，让 AI 顾问能回答“专业黑盒、推荐理由、路径风险”等 demo 问题。

本次不做：

1. 不修改 `src/pages/Intro.tsx`。
2. 不重做首页、导航、背景、品牌视觉或动效体系。
3. 不引入新的 UI 框架。
4. 不做真实 RAG、真实多智能体、真实 MoE、真实数据库建模。
5. 不把模拟数据包装成权威真实结果。

## Minimal Demo Outcome

完成后，评委或老师应该能按下面路径理解产品：

1. 首页看到平台不是普通志愿推荐，而是“专业解码 + 智慧招生”。
2. 完成 MBTI 后，结果页形成用户画像：兴趣、能力、风险偏好、适配方向。
3. 进入院校页输入分数，看到院校推荐和冲稳保梯度。
4. 点开院校详情，不只看到分数线，还能看到专业解码：课程体系、能力要求、职业路径、推荐理由、风险提示。
5. 进入 AI 顾问，提问“为什么推荐这个专业”或“计算机专业适合我吗”，得到结构化解释。
6. 生涯探索页承接长期路径：职业画像、学习路径、跨专业迁移。

## Recommended File Scope

优先改这些文件：

```text
src/data/types/admissions.ts
public/data/provinces/gd/universities.json
src/components/admissions/UniversityDetailPanel.tsx
src/components/admissions/ScoreHero.tsx
src/pages/Admissions.tsx
src/pages/QuizResult.tsx
public/data/qa/intents.json
public/data/qa/templates.json
public/data/meta/synonyms.json
```

可选改这些文件：

```text
src/pages/Home.tsx
src/pages/Explore.tsx
src/pages/QA.tsx
src/components/admissions/UniversityGrid.tsx
src/components/admissions/PlanBlueprintSheet.tsx
public/data/quiz/mapping.json
public/data/explore/careers_detail/*.json
```

禁止改：

```text
src/pages/Intro.tsx
src/components/layout/DockNavigation.tsx
src/components/layout/MainLayout.tsx
index.css
App.tsx
```

如果 Claude Code 判断必须改禁止文件，必须先停止并说明原因。

## Implementation Slices

### Slice 1: Data Contract

扩展 `UniversityDetail`，建议新增字段：

```ts
majorDecode?: {
  major: string;
  fitScore: number;
  coreCourses: string[];
  abilityRequirements: string[];
  careerPaths: string[];
  matchReasons: string[];
  riskTips: string[];
  alternativePaths: string[];
}[];
decisionNotes?: string[];
```

### Slice 2: Guangdong Demo Data

只给广东样例院校补充 2 到 3 个专业解码样例即可，优先：

```text
中山大学: 临床医学 / 计算机科学
华南理工大学: 人工智能 / 电子信息
深圳大学: 软件工程 / 金融科技
华南师范大学: 心理学 / 教育学
暨南大学: 新闻传播 / 国际关系
```

### Slice 3: Detail Panel Explanation

在 `UniversityDetailPanel.tsx` 的现有详情滚动区域中新增解释模块，位置建议放在 `Ace Majors` 后或前：

1. 推荐理由
2. 专业解码卡片
3. 风险提示
4. 替代路径

不要改变 header、弹层宽度、背景、主色、圆角、动画方式。

### Slice 4: User Profile Signal

在 `QuizResult.tsx` 里把 MBTI 结果页文案向“动态画像”靠拢：

1. 能力维度雷达图保持不变。
2. 增加“画像标签 / 推荐解释入口”。
3. 主按钮仍然跳转 admissions。

### Slice 5: QA Demo Templates

新增 intent/template：

```text
major_decode
recommendation_reason
risk_explain
career_path
```

保持现有 block 格式：title、text、list、cta、disclaimer。

### Slice 6: Verification

每一小步后运行：

```bash
npm run demo:loop
```

如果失败，读取：

```text
docs/workbench/minimal-demo-latest-report.json
```

只修失败项。

## Acceptance Criteria

1. `src/pages/Intro.tsx` hash 未变。
2. 视觉变更只发生在 `minimal-demo-config.json` 白名单内。
3. 所有视觉变更写入 `minimal-demo-change-log.md`。
4. `npm run check:data` 通过。
5. `npm run check:types` 通过。
6. `npm run build` 通过。
7. 页面风格仍然是原来的深蓝、琥珀、玻璃态、圆角卡片和 Framer Motion 体系。
8. 演示链路能讲清楚“专业黑盒解码 -> 智慧招生 -> 生涯规划”。
