# Quick Start Guide

Get the Portfolio Management System up and running in 5 minutes.

## Prerequisites

- Node.js 18+ (download from https://nodejs.org/)
- pnpm (install with: `npm install -g pnpm`)
- Your backend API running (Node.js/Express)

## Installation

1. **Navigate to project directory**
   ```bash
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local`** (edit with your favorite editor)
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## First Steps

### 1. Access Admin Dashboard
- Click "Admin Login" or go to http://localhost:3000/admin/login
- Email: `mengkheykhorn@gmail.com`
- Password: (ask your backend developer)

### 2. Create Categories
- Go to "Categories" in sidebar
- Add categories like: Website, Mobile App, Design, etc.

### 3. Add Your First Project
- Go to "Projects" → "Add Project"
- Fill in:
  - **Title**: Project name
  - **Description**: What you built
  - **Category**: Select from your categories
  - **Label**: Private notes (only you see)
  - **Media**: Upload images, videos, PDFs, etc.
  - **Links**: Add project links

### 4. Generate Share Link
- Go to "Share Portfolio"
- Click "Generate Link"
- Choose expiration (7 days, 30 days, etc.)
- Copy the link and share with clients

### 5. View Public Portfolio
- Click the generated share link
- Share with `?token=...` query parameter
- Portfolio viewers see:
  - All visible projects
  - Filter by category
  - Project details & media
  - Links to your work

## File Structure

```
my-app/
├── app/
│   ├── (admin)/admin/          # Admin pages
│   ├── (public)/portfolio/     # Public portfolio
│   ├── page.tsx                # Home page
│   └── layout.tsx              # Root layout
├── components/
│   ├── admin/                  # Admin components
│   └── public/                 # Public components
├── lib/
│   ├── api-client.ts           # API requests
│   ├── auth-context.tsx        # Auth state
│   └── types.ts                # TypeScript types
├── .env.local                  # Your environment
├── README.md                   # Full documentation
└── API_INTEGRATION.md          # Backend API guide
```

## Common Tasks

### Add a Project
1. Admin Dashboard → Projects
2. Click "Add Project"
3. Fill form with project details
4. Upload media (images, videos, PDFs)
5. Add external links
6. Click "Create Project"

### Edit a Project
1. Projects page → Find project
2. Click edit icon
3. Update details
4. Save changes

### Delete a Project
1. Projects page → Find project
2. Click trash icon
3. Confirm deletion

### Hide a Project (from public view)
1. Projects page → Find project
2. Click eye/eye-off icon
3. Hidden projects won't show in public portfolio

### Share with Client
1. Go to "Share Portfolio"
2. Generate new link
3. Select expiration time
4. Copy full URL
5. Send to client

## Troubleshooting

### Port 3000 already in use
```bash
pnpm dev -- -p 3001
```

### API connection failed
- Check backend is running on http://localhost:3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings on backend

### Login failed
- Verify email is: `mengkheykhorn@gmail.com`
- Check password with backend admin
- Clear browser cache and try again

### Styling looks wrong
- Clear `node_modules`: `rm -rf node_modules`
- Reinstall: `pnpm install`
- Restart dev server: `pnpm dev`

### Images not showing
- Check image URLs are accessible
- Verify Cloudflare R2 configuration on backend
- Check CORS settings for image CDN

## Development Tips

### Enable Debug Mode
```bash
DEBUG=* pnpm dev
```

### Check Build
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

### Format Code
```bash
pnpm format
```

## Keyboard Shortcuts

- `Cmd/Ctrl + K` - Command palette (when available)
- `Cmd/Ctrl + B` - Toggle sidebar
- `ESC` - Close modals

## Backend API Requirements

Your backend must provide these endpoints:

**Authentication**
- `POST /auth/login` - Login with email/password

**Projects**
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**Categories**
- `GET /categories` - Get categories
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

**Sharing**
- `POST /share-links` - Generate share link
- `DELETE /share-links/:id` - Delete share link

**Public**
- `GET /portfolio?token=...` - Get portfolio by token

See `API_INTEGRATION.md` for full API specs.

## Next Steps

1. Read `README.md` for full documentation
2. Check `API_INTEGRATION.md` for backend specs
3. See `DEPLOYMENT.md` for production deployment
4. Customize colors in `app/globals.css`
5. Deploy to Vercel or your hosting

## Support

- Frontend issues: Check `README.md` and `API_INTEGRATION.md`
- Backend issues: Contact your backend developer
- Hosting questions: See `DEPLOYMENT.md`

## Production Deployment

When ready to deploy:

```bash
# Build for production
pnpm build

# Test production build
pnpm start

# Deploy to Vercel (recommended)
# - Push to GitHub
# - Connect to Vercel
# - Set environment variables
# - Auto-deploy on push
```

See `DEPLOYMENT.md` for detailed deployment instructions.

---

**Happy building! 🚀**
