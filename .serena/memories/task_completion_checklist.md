# Task Completion Checklist

Before marking a task as complete:

1. **Verify Requirements:** Ensure all parts of the user's request are addressed.
2. **Run Tests:** Execute `npm test` to ensure no regressions.
3. **Type Check:** Run `npm run typecheck` to catch TypeScript errors.
4. **Lint/Format:** (If applicable) Run available linting tools (none explicit in `package.json`, but adhere to existing style).
5. **Clean Up:** Remove any temporary debug logs or files.
6. **Documentation:** Update relevant documentation if architecture or features changed.
7. **Confirm Safety:** Ensure no secrets were exposed and no critical data was lost.
