# Minimal Demo Check And Fix Loop

本工作台只服务本次“最小 demo 改造”。它不替代原有 `workbench:*` 全栈校验，而是额外保护三件事：

1. `src/pages/Intro.tsx` 绝对不改。
2. 允许必要页面和组件做小范围 demo 增强，但必须在白名单内。
3. 每次视觉文件变更必须写入 `docs/workbench/minimal-demo-change-log.md`。

## Loop

```text
read memory and plan
  -> implement one small slice
  -> npm run demo:loop
  -> read docs/workbench/minimal-demo-latest-report.json
  -> fix only failed scopes
  -> update change log if visual files changed
  -> rerun npm run demo:loop
```

## Commands

```bash
npm run demo:manifest
npm run demo:verify
npm run demo:loop
npm run check:data
npm run check:types
npm run build
```

## Baseline Rule

`npm run demo:manifest` records the current hashes of `src/pages/**` and `src/components/**`.

Run it only when setting or deliberately refreshing the baseline. Do not regenerate the baseline just to hide an unexpected visual change.

## Auto-Fix Rules

1. Fix the smallest failed scope.
2. Never edit `src/pages/Intro.tsx`.
3. Do not introduce a new design language, palette, radius system, typography system, navigation style, or motion style.
4. New components must inherit existing Tailwind patterns: `#0A2463`, amber accents, white or glass surfaces, serif headings where already used, rounded cards, Framer Motion transitions.
5. Keep all generated demo claims labeled as demo or sample data.
6. Do not add dependencies unless the existing stack cannot solve the task.
