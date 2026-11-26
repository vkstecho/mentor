# Mentor 3.0 UI changelog

**Date:** 2026-11-26

## Scope

Presentation-only improvements. Existing learning content, prices, authentication, Firebase configuration and rules, Functions, payment logic, data paths, IDs, event attributes, and workflows were left unchanged. The only existing HTML edits add a stylesheet reference at the end of each affected document head. One shared stylesheet contains the visual changes.

## Screens improved

- **Public landing page:** refined navigation and hero spacing, improved focus feedback, strengthened card and FAQ hover/open states, and tightened small-screen spacing and button touch size.
- **Main Mentor app:** polished auth surfaces and controls, improved workspace and topic card depth, made forms and buttons easier to use, and constrained dialogs to small viewport heights with safe-area spacing.
- **Met Train PRO:** refined the top bar, cards, page headers, focus feedback, desktop reading space, and mobile content/table scrolling.
- **MR Skill and self-contained modules:** improved headers, type hierarchy, card surfaces, badges, inputs, navigation pills, action controls, code/formula panels, presentation slides, and mobile spacing.

## Files changed

- Added `css/mentor-premium-ui.css`.
- Added a presentation stylesheet link in `index.html`, `mentor.html`, `Met_Train_Pro/met_train_pro.html`, `MR_Skill/mr_skill.html`, `modules/met_cost_pro.html`, `modules/timestudy.html`, `modules/excel_expert.html`, `modules/kpi_dashboard.html`, and `modules/supskill.html`.
- Added this changelog and `UI_REGRESSION_REPORT.md`.

The stylesheet is additive. It does not replace the app's existing Tailwind setup, theme handling, multilingual support, PWA setup, image assets, or module-specific styles.

## Input archive note

The prompt specified `Mentor-3.0-secure-staging-development(2).zip`. That exact filename was unavailable in Downloads and the workspace. Work therefore started from the latest available prior delivery, `Mentor-3.0-secure-staging-development.zip`, in this workspace. The produced release contains the complete archive plus this UI-only update.