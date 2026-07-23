# Web client (frozen / non-product for v1)

Reference UI for Divoké deväťdesiate. **v1 product target is Expo (iOS-first)** — see parent issue #13. This Vite app is kept as a runnable reference and import consumer of shared packages; do not invest in new web features for v1.

Package manager: **pnpm** (workspace root).

```bash
# from repo root
pnpm install
pnpm --filter web dev
pnpm test                 # content + simulation + web UI tests
pnpm --filter web typecheck
pnpm --filter web build
```

Shared engine packages:

- `@devedesiatky/simulation`
- `@devedesiatky/content`
