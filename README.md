# YTops — YouTube Operations Hub v3.0

Single-owner AI research and content-operations workspace for faceless YouTube channels targeting US viewers.

## Modules
- Command dashboard and strategic niche-scoring engine
- AI Research Agent with optional OpenAI web search
- China Signal Lab for owner-provided research notes (no automated scraping)
- China-to-US transformation into five differentiated original concepts
- Script writer, production package and repurposing planner
- Channel manager and production board
- Performance Lab for manually entered YouTube Studio metrics
- Quality, copyright and monetization risk review
- Workspace persistence and JSON backup/export
- Optional single-owner access password and Docker deployment files

## Requirements
- Node.js 20+ or Docker
- OpenAI API key and a model enabled for your API project

## Local setup (Windows)
1. Extract the ZIP.
2. Open PowerShell in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your API key and choose a model available to your OpenAI API project.
6. Run `npm start` and open http://localhost:3000.

The sample model is `gpt-4.1-mini`; access depends on your API project. Change `OPENAI_MODEL` in `.env` if needed. API usage is billed separately from a ChatGPT subscription.

## Deploy to VPS with Docker
1. Install Docker Engine and Docker Compose plugin.
2. Clone `https://github.com/sunswagz/ytb`.
3. Create `.env` on the VPS; never commit it.
4. Set `OPENAI_API_KEY` and a long random `APP_ACCESS_PASSWORD`.
5. Run `docker compose up -d --build`.
6. Put Nginx/Caddy in front with HTTPS and restrict direct access to port 3000.
7. Back up the mounted `data/` directory regularly.

## GitHub and secrets
Repository: `https://github.com/sunswagz/ytb`

Keep the repository **Private**. The connected GitHub API currently reports its visibility as Public, so change it under Settings → General → Danger Zone → Change repository visibility if you intended Private. `.gitignore` excludes `.env` and `data/*.json`. Never commit API keys, workspace backups, private analytics, or source material you do not have rights to share.

## API routes
- `GET /api/health`
- `GET/PUT /api/workspace`
- `GET /api/dashboard`
- `POST /api/ai` tasks: `research`, `niche`, `china_analyze`, `transform`, `script`, `production`, `compliance`, `repurpose`, `analytics`

## Security notes
- API keys remain server-side in `.env`; never put them in frontend code.
- `APP_ACCESS_PASSWORD` is a basic single-owner gate, not a full identity provider. Use HTTPS, firewall rules, unique credentials and backups.
- Before exposing the app publicly, consider stronger authentication, CSRF protection, database migrations, audit logs, request quotas and encrypted backups.

## Source-use and platform policy
- No automatic scraping or login bypass on Douyin, Bilibili, Xiaohongshu, Kuaishou, Weibo or WeChat.
- Submit only source material you are authorized to analyze. Use source trends as research intelligence, not as material to translate or republish.
- AI reports are drafts; independently verify claims, dates and citations.
- Copyright permission and YouTube reused/inauthentic-content monetization review are separate. No edit percentage guarantees fair use or monetization.
