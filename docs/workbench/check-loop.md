# Check And Fix Loop

本文件定义本次任务工作台的“检验后自动修改循环”。脚本负责发现问题并生成报告，agent 或实现者根据报告做最小范围修复，再重复验证。

## Loop

```text
implement
  -> npm run workbench:loop
  -> read docs/workbench/latest-report.json
  -> fix only failed scopes
  -> rerun npm run workbench:loop
```

## Commands

```bash
npm run workbench:manifest
npm run workbench:verify
npm run workbench:loop
npm run check:data
npm run check:types
npm run check:backend
npm run build
npm run backend:dev
npm run backend:dev:fastapi
```

`npm run build` uses `scripts/run-vite-build.mjs`, which prefers the Codex bundled Node runtime when available. This avoids the Rollup native crash observed with the system Node in this workspace path.

## What The Loop Checks

1. Required workbench files exist.
2. `src/pages/**` and `src/components/**` match the recorded style baseline.
3. Vite has a local `/api` proxy.
4. Backend Python files compile.
5. Zero-dependency Node API server passes smoke checks, including `/api/data`, `/api/qa/chat`, `/api/quiz/submit`, profile writes, and plan replace/delete.
6. JSON data validation still runs.
7. TypeScript type check runs.
8. Frontend production build runs.

## Auto-Fix Rules

1. Fix only failed checks.
2. Do not change `src/pages/**` or `src/components/**` unless the task explicitly needs it.
3. If a visual file must change, regenerate the manifest only after confirming the visual style is preserved.
4. Keep demo backend endpoints labeled as demo until auth and database persistence are implemented.
5. Never hide a failing check by deleting it from the verifier.
