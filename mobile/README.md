# Mobile (Expo) — v1 product client

iOS-first Expo app for Divoké deväťdesiate. Consumes `@devedesiatky/simulation` and `@devedesiatky/content`.

```bash
# from repo root
pnpm install
pnpm --filter mobile start
pnpm --filter mobile ios
pnpm --filter mobile test
pnpm --filter mobile typecheck
```

Portrait-only. Android is not a v1 ship target but remains buildable from this project.

If the iOS Simulator cannot reach Metro at `127.0.0.1:8081` (IPv6-only listen), start with:

```bash
NODE_OPTIONS='--dns-result-order=ipv4first' pnpm --filter mobile start -- --host localhost
```

