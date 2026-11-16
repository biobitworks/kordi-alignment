# Kordi agent HTTP 403 diagnostic boundary

HTTP 403 means the server refused the request. It does **not** identify which backend component refused it or demonstrate a relationship to this plugin.

## Initial triage (read-only)

- Identify response source: Kordi cloud API, GitHub API, model provider, or the local agent host. Log only the endpoint **class**, time, sanitized status/error code, and model/provider category.
- Provider 403: examine whether the selected account/plan is authorized for the model. Kordi has specific GitHub Copilot 403 diagnostics; no repeated retries.
- Kordi chat 403: assess `CHAT_FORBIDDEN` (membership/permissions) or a browser origin allowlist condition where applicable. Do not change memberships or allowlists without authorization.
- Kordi agent handoff 403: assess owner/consent checks. A 403 may be expected when an agent is not available to the sender.
- Do not print or commit cookies, OAuth tokens, headers, full URLs with secrets, raw provider response bodies, or private chat content.

## Separation

The Alignment Compass plugin has no network calls and cannot remedy a production permission rejection. Isolated scoring tests never test or prove live agent login or Kordi cloud access.

## Gate

Remediation requires an observed, sanitized error code and clear source of the 403. Until observed, root cause stays UNKNOWN and deployment stays NOT_TESTED.
