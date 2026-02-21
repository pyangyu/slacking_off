# ☕ Keep Alive — Slacking Off App

A static Next.js app hosted on GitHub Pages. One-click copy a PowerShell "keep alive" script that prevents your PC from going idle during work hours.

---

## Commands Used (Full Project History)

### 1. Create Next.js Project

```powershell
cd "d:\workspace"
npx create-next-app@latest slacking-off-app --typescript --tailwind --eslint --app --src-dir --no-import-alias --use-npm
```

> ⚠ Directory names with spaces (e.g. `slacking off app`) will fail npm naming restrictions. Create with a hyphenated name first, then copy files over.

### 2. Copy Files to Workspace Folder (if folder name has spaces)

```powershell
xcopy "d:\workspace\slacking-off-app\*" "d:\workspace\slacking off app\" /E /H /Y /I
```

| Flag | Meaning |
|------|---------|
| `/E` | Copy all subdirectories including empty ones |
| `/H` | Copy hidden and system files |
| `/Y` | Suppress overwrite confirmation |
| `/I` | Treat destination as a directory |

### 3. Install Dependencies

```powershell
cd "d:\workspace\slacking off app"
npm install
```

### 4. Run Dev Server

```powershell
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### 5. Build Static Export

```powershell
npm run build
```

Output goes to the `out/` directory — ready for GitHub Pages.

### 6. (Optional) Clean Up Temp Project Folder

```powershell
Remove-Item -Recurse -Force "d:\workspace\slacking-off-app"
```

---

## Project Configuration

### `next.config.ts` — Static Export for GitHub Pages

```ts
const nextConfig: NextConfig = {
  output: "export",          // generates static HTML into out/
  images: { unoptimized: true },
  // basePath: "/repo-name", // uncomment if deploying to github.io/repo-name
};
```

### GitHub Actions Workflow (`.github/workflows/deploy.yml`)

Auto-builds and deploys on every push to `main`.

---

## Deploy to GitHub Pages

```powershell
# 1. Init git & push
cd "d:\workspace\slacking off app"
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main

# 2. In GitHub repo Settings → Pages → Source: "GitHub Actions"
#    The included workflow will handle the rest automatically.
```

If the site will live at `https://<USERNAME>.github.io/<REPO>/`, uncomment the `basePath` line in `next.config.ts`:

```ts
basePath: "/slacking-off-app",
```

---

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**
- **Tailwind CSS 4**
- **GitHub Actions** (CI/CD → GitHub Pages)
