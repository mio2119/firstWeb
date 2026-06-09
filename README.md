<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1m1A0oWggtN34AjklWDYyusyJOm5Km0mg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 如何运行数据校验

运行校验脚本并生成报告：
`node scripts/validate-data.mjs`

校验结果会写入：`public/data/meta/validation_report.json`

## 使用 D:\工作台

本项目已接入外部 Codex Workbench。可在项目根目录直接运行：

```powershell
.\cw.ps1 doctor
.\cw.ps1 project scan
.\cw.ps1 verify
.\cw.ps1 run list
```

`cw.ps1`/`wb.ps1` 会调用 `D:\工作台` 的工作台引擎，但把数据库、日志和索引写入本项目的 `.workbench`。项目专属任务在 `.codex-workbench/tasks.yaml`，校验入口会运行 `npm run check`。
