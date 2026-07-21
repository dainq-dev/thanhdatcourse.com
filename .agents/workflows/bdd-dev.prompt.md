---
description: Develop new feature based on bdd spec
---

Skills required: backend-dev, frontend-dev, e2e-test-writer

Implement selected bdd spec

1. Write e2e pytest testcases following spec docs in `tests` folder
   - **Traceability Matrix**: Create a tracking list in your `task.md` artifact mapping every single BDD behavior from the spec to its corresponding E2E test to guarantee 100% coverage.
2. Run tests (Red)
3. Write code to pass the test (Green). When writing code, run lint first to catch any issues and fix lint issues.
   - **Failure Layer Diagnosis**: If a test or implementation fails, do not blindly hack code to pass it. Evaluate if the failure is an Implementation Bug or a Spec Flaw. If the agreed BDD spec itself is flawed, incomplete, or contradictory, you MUST STOP and wait for user instruction. AI must not modify agreed BDD specs on behalf of both parties without involving the user.
4. Suggest refactor and confirm with user, then implement refactor (Refactor)
5. **Quality Review**: Before considering the implementation complete, trigger `/quality-review` against the implemented code to assure it strictly adheres to all constraints in the original BDD spec.
6. If the spec is updated, update the testcases in `tests` folder accordingly.

While running tests, write code, refactor, you can utilize browser for FE tasks to manually inspect, reproduce, debug