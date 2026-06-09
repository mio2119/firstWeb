# Minimal Demo Change Log

本文件记录允许的最小 demo 前端视觉文件变更。任何 `src/pages/**` 或 `src/components/**` 的变更，都必须说明为什么不会改变现有风格。

## Format

```text
YYYY-MM-DD
- file: src/pages/Admissions.tsx
  reason: Add demo data wiring only; preserve existing layout, colors, spacing, typography, motion.
  visual-style-risk: low
  verification: npm run demo:loop
```

## Entries

2026-06-07
- file: src/pages/QuizResult.tsx
  reason: Reframe header as "动态画像"; add profile tags section (strengths, blindspots, majors) using existing data. No layout, color, or motion changes — uses same glass-card, rounded, deep-navy, amber, Framer Motion patterns.
  visual-style-risk: low
  verification: npm run demo:loop

- file: src/components/admissions/UniversityDetailPanel.tsx
  reason: Add conditional majorDecode section after Ace Majors — shows 推荐理由, 核心课程, 能力要求, 职业路径, 风险提示, 替代路径. Only renders when data exists. Uses same slate/white cards, rounded-2xl, deep-navy headings, amber accents, Framer Motion entrance.
  visual-style-risk: low
  verification: npm run demo:loop
