# Portfolio Management System - Frontend

A modern, responsive portfolio management system frontend built with Next.js, Tailwind CSS, and Framer Motion. This application allows you to manage projects, organize them by categories, and securely share them with clients using time-limited links.

## Features

- **Admin Dashboard** - Comprehensive project management interface
- **Project Management** - Create, edit, delete, and organize projects with rich media support
- **Category Management** - Create and organize projects by category
- **Portfolio Sharing** - Generate time-limited shareable links to send to clients
- **Secure Authentication** - Email/Password authentication with JWT tokens (email restricted to authorized users)
- **Public Portfolio View** - Modern, animated portfolio showcase with category filtering
- **Responsive Design** - Mobile-first responsive layout that works on all devices
- **Modern Animations** - Smooth, professional animations powered by Framer Motion
- **Dark/Light Theme** - Automatic theme detection with customizable colors

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios with JWT interceptors
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Notifications**: Sonner Toast

## Project Structure

```
app/
├── (admin)/                    # Admin routes
│   └── admin/
│       ├── login/             # Admin login page
│       ├── dashboard/         # Admin dashboard
│       ├── projects/          # Project management
│       ├── categories/        # Category management
│       └── sharing/           # Portfolio sharing
├── (public)/                   # Public routes
│   ├── portfolio/             # Public portfolio view
│   └── layout.tsx
├── page.tsx                    # Home page
└── layout.tsx                  # Root layout

components/
├── admin/                      # Admin components
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── project-form.tsx
└── public/                     # Public components
    ├── project-card.tsx
    └── project-modal.tsx

lib/
├── api-client.ts              # Axios API client with interceptors
├── auth-context.tsx           # Authentication context
├── types.ts                   # TypeScript interfaces
└── utils.ts                   # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### For Admin Users

1. **Login**: Go to `/admin/login` and use the authorized email `mengkheykhorn@gmail.com`
2. **Dashboard**: View statistics and quick actions
3. **Categories**: Create project categories for filtering
4. **Projects**: Add, edit, delete, or hide projects
   - Upload thumbnail, images, videos, PDFs
   - Add project links and descriptions
   - Add private notes visible only to admin
5. **Sharing**: Generate time-limited portfolio links to share with clients

### For Portfolio Viewers

1. **Access Portfolio**: Use a shared link with token: `/portfolio?token=<token>`
2. **Browse Projects**: View projects in a modern gallery layout
3. **Filter by Category**: Use category filters to find specific projects
4. **View Details**: Click on projects to see full details, images, videos, and links

## API Integration

The frontend communicates with a Node.js/Express backend. The API client is configured in `lib/api-client.ts`:

### Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is automatically included in all requests
5. On 401 response, user is redirected to login

### Key API Endpoints (Expected)

```
POST   /api/auth/login                 # Login
GET    /api/projects                   # Fetch projects
POST   /api/projects                   # Create project
PUT    /api/projects/:id               # Update project
DELETE /api/projects/:id               # Delete project
GET    /api/categories                 # Fetch categories
POST   /api/categories                 # Create category
PUT    /api/categories/:id             # Update category
DELETE /api/categories/:id             # Delete category
POST   /api/share-links                # Generate share link
GET    /api/portfolio?token=...        # Fetch portfolio by token
```

## Environment Variables

```env
# API Base URL (backend server)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Application URL (for sharing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Authentication

- **Admin Email**: `mengkheykhorn@gmail.com` (hardcoded, only this email can access admin)
- **Password**: Managed by backend
- **Token Storage**: JWT token stored in localStorage
- **Token Expiry**: Handled by backend

## Customization

### Theme Colors

Edit `/app/globals.css` to customize the color scheme:

```css
:root {
  --primary: oklch(0.35 0.15 230);      /* Primary color */
  --accent: oklch(0.65 0.18 230);       /* Accent color */
  --background: oklch(0.98 0 0);        /* Background */
  --foreground: oklch(0.15 0 0);        /* Text */
  /* ... more color variables */
}
```

### Typography

Fonts are configured in `app/layout.tsx` using Google Fonts (Geist and Geist Mono).

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient re-renders with React optimization
- CSS-in-JS with Tailwind for minimal bundle size

## Security Considerations

- JWT tokens stored in localStorage (consider using httpOnly cookies)
- CORS should be configured on backend
- Sensitive endpoints require authorization token
- Email validation on login

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

```bash
pnpm run build
pnpm start
```

## Common Issues

### API Connection Failed
- Ensure backend server is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings on backend

### Login Not Working
- Verify email is `mengkheykhorn@gmail.com`
- Check backend authentication endpoint
- Clear localStorage and try again

### Portfolio Link Expired
- Generate new share link from admin dashboard
- Check link expiration date

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## License

This project is proprietary and confidential.

## Support

For issues or questions, please contact the development team.

## Future Enhancements

- [ ] Portfolio customization (colors, fonts, layout)
- [ ] Social media sharing
- [ ] Analytics dashboard
- [ ] Multiple users/teams
- [ ] Project versioning
- [ ] Comments/feedback on projects
- [ ] Advanced filtering and search
- [ ] Portfolio statistics
