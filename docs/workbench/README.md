# Workbench Directory

这个目录保存本次全栈化任务的“项目记忆”和检验结果。

## Files

```text
docs/workbench/
  README.md
  frontend-style-manifest.json
  latest-report.json
```

`frontend-style-manifest.json` 是当前前端页面与组件的风格保护基线。后续如果迁移 API 时误改了 `src/pages` 或 `src/components`，`npm run workbench:verify` 会直接报出变化文件。

`latest-report.json` 是自动检验报告，由脚本生成，不需要手动维护。

