# Static Deploy

This project supports a static export flow for Cloudflare Pages / GitHub Pages style hosting.

## Build

```bash
npm run build:static
```

This runs:

- `STATIC_EXPORT=1 NEXT_PUBLIC_STATIC_EXPORT=1 npm run build --workspace desktop`
- `STATIC_EXPORT=1 NEXT_PUBLIC_STATIC_EXPORT=1 NEXT_PUBLIC_DESKTOP_BASE_PATH=/desktop npm run build --workspace web`
- copies `apps/desktop/out` into `apps/web/out/desktop`

## Output

Deploy this folder:

```text
apps/web/out
```

Expected structure:

```text
apps/web/out/
  index.html
  pocket/index.html
  assets/
  desktop/
    index.html
```

## Cloudflare Pages

- Build command: `npm run build:static`
- Output directory: `apps/web/out`

Recommended environment variables for build:

```text
STATIC_EXPORT=1
NEXT_PUBLIC_STATIC_EXPORT=1
NEXT_PUBLIC_DESKTOP_BASE_PATH=/desktop
```

### GitHub Actions

If you want GitHub to deploy directly to Cloudflare Pages, this repo now includes:

```text
.github/workflows/cloudflare-pages.yml
```

Set these repository secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Set this repository variable:

```text
CLOUDFLARE_PAGES_PROJECT
```

The workflow will:

1. run `npm ci`
2. run `npm run build:static`
3. deploy `apps/web/out` with Wrangler Pages

## Notes

- Local development is unchanged and can still use:
  - `npm run dev:web`
  - `npm run dev:desktop`
- Static hosting does not use the local `/desktop -> localhost:3001` proxy.
- In static export mode, the web app targets same-origin `/desktop/`.
