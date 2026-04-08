# Frontend A/B/C execution roadmap

This guide maps implementation into small PR domains:

- M0 Stabilize (week 1)
- M1 UI System (week 2-3)
- M2 Data/TS (week 3-4)
- M3 Transactions + Hardening (week 4-5)

## Suggested issue breakdown

1. `[M0:stabilize] backend health banner + retry UX` labels: `frontend`, `ux`, `priority:p0`
2. `[M0:stabilize] fallback behavior for unsplash and empty states` labels: `frontend`, `perf`, `priority:p1`
3. `[M1:ui] token cleanup primitive->semantic->component` labels: `frontend`, `ux`, `priority:p1`
4. `[M1:responsive] touch/keyboard/safe-area audit` labels: `frontend`, `a11y`, `ux`, `priority:p0`
5. `[M2:data] zod schemas + typed query hooks` labels: `frontend`, `priority:p0`
6. `[M2:data] migrate transactions data flow to hooks` labels: `frontend`, `transactions`, `priority:p0`
7. `[M3:tx] websocket reconnect + optimistic send` labels: `transactions`, `perf`, `priority:p0`
8. `[M3:otp] otp input UX paste/auto-advance` labels: `transactions`, `ux`, `a11y`, `priority:p0`
9. `[M3:hardening] accessibility scan with axe` labels: `a11y`, `priority:p1`
10. `[M3:hardening] lighthouse CI gate` labels: `perf`, `ci-cd`, `priority:p1`

## Milestone setup checklist

- Create milestones `M0 Stabilize`, `M1 UI System`, `M2 Data/TS`, `M3 Transactions+Hardening`.
- Apply labels from `.github/labels.frontend-plan.json`.
- Use `.github/ISSUE_TEMPLATE/frontend-plan-task.yml` to open tasks.
- Link each PR to one issue and include test evidence in PR body.
