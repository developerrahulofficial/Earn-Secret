# Earn Secret

## Deployment

### Environment Variables Required:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Random secret for sessions
- `NODE_ENV`: Set to "production"
- `PORT`: Railway/Render will set this automatically

### Deploy to Railway:
1. Connect your GitHub repo to Railway
2. Add environment variables
3. Railway will automatically detect and deploy

### Deploy to Render:
1. Connect your GitHub repo to Render
2. Set Build Command: `npm run build`
3. Set Start Command: `npm start`
4. Add environment variables

## Local Development
```bash
npm install
npm run dev
```
