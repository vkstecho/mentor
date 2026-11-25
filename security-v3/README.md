# Mentor 3.0 Security v3

Read in this order:
1. `SECURITY_AUDIT.md` — source-backed baseline findings.
2. `PHASE1B_IMPLEMENTATION.md` — what this package adds and what remains.
3. `REGRESSION_TESTS.md` — required verification.
4. `functions/` — trusted backend operations and tests.
5. `database.rules.v3.json` and `storage.rules.v3.txt` — staging rules only.

This is an additive staging implementation. It does not migrate legacy records or integrate all existing browser workflows. Never deploy restrictive rules to production until the release gates are satisfied.
