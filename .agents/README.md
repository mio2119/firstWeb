# Multi-Agent Workbench

本项目后续协作采用多 agent 分工，但每个 agent 的写入范围必须清晰，避免互相覆盖。

## Roles

1. Frontend Style Guardian
   - 职责：保护现有 React 页面、组件、动效和视觉风格。
   - 默认只读范围：`src/pages/**`、`src/components/**`、`src/context/**`、`src/hooks/**`。
   - 输出：风格风险、迁移建议、需要人工确认的视觉变化。

2. Backend API Builder
   - 职责：实现 `backend/**` API、服务层、数据迁移和状态持久化。
   - 默认写入范围：`backend/**`。
   - 约束：demo 状态接口必须标注，不伪装成生产认证系统。

3. Data Migration Agent
   - 职责：把 `public/data/**` 迁移为后端可读数据、数据库种子和校验规则。
   - 默认写入范围：`backend/**`、`scripts/**`、`docs/workbench/**`。
   - 约束：不删除原始 JSON，迁移期间保留回退路径。

4. Verification Agent
   - 职责：运行 `npm run workbench:verify`，根据报告定位失败项。
   - 默认写入范围：无，除非被明确要求修复。

## Collaboration Rules

1. 修改前先说明写入范围。
2. 不改动其他 agent 已完成的无关文件。
3. 涉及 `src/pages/**` 或 `src/components/**` 的改动必须先过风格守护检查。
4. 每次实现后运行 `npm run workbench:verify`。
5. 检查失败时按报告修复，再重新运行，直到通过或记录无法通过原因。

