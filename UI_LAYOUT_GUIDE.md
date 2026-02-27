# UI Layout Guide

Visual guide to the portfolio management system interface.

## Admin Interface

### Admin Login Page
```
┌─────────────────────────────────────────┐
│                                         │
│              Portfolio                  │
│            Admin Login                  │
│                                         │
│  Email: [________________]              │
│  Password: [____________]               │
│                                         │
│  [    Sign in    ]                      │
│                                         │
│  Only authorized accounts can access    │
└─────────────────────────────────────────┘
```

### Admin Dashboard
```
┌──────────────────────────────────────────────────────────────────┐
│ Portfolio Admin                              [User] [Settings] X  │
├─────────────────┬──────────────────────────────────────────────┤
│                 │  Welcome back!                                  │
│ Dashboard       │  Manage your projects and portfolio             │
│ Projects        │                                                 │
│ Categories      │  ┌─────────┬─────────┬─────────┐              │
│ Share Portfolio │  │ Projects │ Catgry  │ Active  │              │
│                 │  │    0     │   0     │  Links0 │              │
│                 │  └─────────┴─────────┴─────────┘              │
│                 │                                                 │
│                 │  ┌──────────┬──────────┬──────────┐            │
│                 │  │ + Add    │ + Manage │ + Share  │            │
│                 │  │ Project  │Category  │Portfolio │            │
│                 │  └──────────┴──────────┴──────────┘            │
│                 │                                                 │
└─────────────────┴──────────────────────────────────────────────┘
```

### Projects Management
```
┌──────────────────────────────────────────────────────────────────┐
│                         Projects                                  │
│              [Search...]                    [+ Add Project]       │
├──────────────────────────────────────────────────────────────────┤
│ Title          │ Category    │ Status      │ Actions              │
├────────────────┼─────────────┼─────────────┼─────────────────────┤
│ My Website     │ Website     │ Visible   │ 👁  ✏️  🗑️            │
│ Mobile App     │ App         │ Hidden    │ 👁‍🗨 ✏️  🗑️            │
│ Brand Design   │ Design      │ Visible   │ 👁  ✏️  🗑️            │
└────────────────┴─────────────┴─────────────┴─────────────────────┘
```

### Project Creation Form
```
┌──────────────────────────────────────────────────────────────────┐
│ Add New Project                                                   │
│ Create a new project for your portfolio                          │
│                                                                   │
│ ┌─ Basic Information ─────────────────────────────────────────┐ │
│ │ Project Title *                                             │ │
│ │ [E.g., E-Commerce Website           ]                      │ │
│ │                                                             │ │
│ │ Description *                                               │ │
│ │ [Describe your project, what you did, and the results...  ] │ │
│ │ [                                                          ] │ │
│ │                                                             │ │
│ │ Category * [Select category ▼]  Label [Private notes    ] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Media Files ───────────────────────────────────────────────┐ │
│ │ Thumbnail      Images        Video         PDF             │ │
│ │ ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐         │ │
│ │ │ Upload │   │ Upload │   │ Upload │   │ Upload │         │ │
│ │ └────────┘   └────────┘   └────────┘   └────────┘         │ │
│ │                                                             │ │
│ │ Project Links                                               │ │
│ │ [https://example.com              ] [Remove]               │ │
│ │ [                                  ] [+ Add Link]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ [Create Project]  [Cancel]                                      │
└──────────────────────────────────────────────────────────────────┘
```

### Categories Management
```
┌──────────────────────────────────────────────────────────────────┐
│ Categories                                                        │
│ Create and manage project categories for filtering              │
│                                                                   │
│ ┌──── Add Category ────┐  ┌─ Website ──────────────────────┐   │
│ │ Name [Website  ]    │  │ Web development projects        │   │
│ │                     │  │ [Edit] [Delete]                 │   │
│ │ Description         │  └─────────────────────────────────┘   │
│ │ [Optional desc    ] │                                         │
│ │                     │  ┌─ Mobile App ──────────────────────┐  │
│ │ [Add Category]      │  │ App development projects         │  │
│ └─────────────────────┘  │ [Edit] [Delete]                  │  │
│                          └────────────────────────────────────┘ │
│                                                                   │
│                          ┌─ Design ──────────────────────────┐  │
│                          │ Design & UX projects              │  │
│                          │ [Edit] [Delete]                   │  │
│                          └────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Portfolio Sharing
```
┌──────────────────────────────────────────────────────────────────┐
│ Share Portfolio                                                   │
│ Generate time-limited shareable links to send to clients         │
│                                                                   │
│ ┌─ Generate New Share Link ────────────────────────────────────┐ │
│ │ Expiration Duration [7 days ▼]          [Generate Link]     │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Active Share Links ─────────────────────────────────────────┐ │
│ │                                                              │ │
│ │ [unique_token_abc123...] [Copy]                   [Delete] │ │
│ │ 📅 Expires in 7 days                    Active               │ │
│ │                                                              │ │
│ │ [unique_token_xyz789...] [Copy]                   [Delete] │ │
│ │ 📅 Expires in 1 day                     Active               │ │
│ │                                                              │ │
│ │ [unique_token_def456...] [Copy]                   [Delete] │ │
│ │ 📅 Expired                              Expired              │ │
│ │                                                              │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Public Interface

### Home Page
```
┌──────────────────────────────────────────────────────────────────┐
│ Portfolio                                  [Admin Login]          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    Showcase Your Work                            │
│                Professional Portfolio                            │
│                                                                   │
│  A modern portfolio management system that lets you organize...  │
│                                                                   │
│  [Get Started →]  [View Demo Portfolio]                         │
│                                                                   │
│                  Powerful Features                               │
│                                                                   │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│ │ ⚡ Easy      │  │ 🔒 Secure    │  │ ✨ Share     │           │
│ │ Project Mgmt │  │ Sharing      │  │ Analytics    │           │
│ └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│        Ready to showcase your portfolio?                         │
│           [Access Admin Dashboard →]                            │
│                                                                   │
│ © 2024 Portfolio Management. All rights reserved.               │
└──────────────────────────────────────────────────────────────────┘
```

### Public Portfolio View
```
┌──────────────────────────────────────────────────────────────────┐
│                         Portfolio                                 │
│            Explore projects and work samples                     │
│                                                                   │
│    [All] [Website] [Mobile App] [Design] [Branding]            │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │              │  │              │  │              │           │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │           │
│  │              │  │              │  │              │           │
│  │ E-Commerce   │  │ Mobile App   │  │ Brand Design │           │
│  │ Website      │  │ Demo         │  │ Project      │           │
│  │              │  │              │  │              │           │
│  │ [View] [+2]  │  │ [View] [+3]  │  │ [View] [+1]  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │              │  │              │  │              │           │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │           │
│  │              │  │              │  │              │           │
│  │ Another Site │  │ Web Portal   │  │ Dashboard UI │           │
│  │              │  │              │  │              │           │
│  │ [View] [+2]  │  │ [View] [+4]  │  │ [View] [+1]  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Project Details Modal
```
┌───────────────────────────────────────────────────────────────────┐
│ E-Commerce Website                                       [Close]   │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ │                  [Main Image Display]                       │ │
│ │                                                              │ │
│ │ [Thumb1] [Thumb2] [Thumb3] [Thumb4]                        │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ Description                                                       │
│ ────────────                                                      │
│ Built a full-stack e-commerce platform with React frontend and  │
│ Node.js backend. Features include product catalog, shopping cart, │
│ payment integration, and admin dashboard...                       │
│                                                                    │
│ Videos                                                            │
│ ──────                                                            │
│ [▶ Demo Video] [Link→]                                          │
│ [▶ Walkthrough] [Link→]                                         │
│                                                                    │
│ Documents                                                         │
│ ─────────                                                         │
│ [📄 Case Study] [Download]                                      │
│                                                                    │
│ Links                                                             │
│ ─────                                                             │
│ [→ https://example.com/project]                                 │
│ [→ https://github.com/example]                                  │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Light Mode
- **Background**: White (#FFFFFF)
- **Foreground**: Near Black (#1A1A1A)
- **Card**: Light Gray (#F5F5F5)
- **Primary**: Blue (#5B6FDD)
- **Accent**: Light Blue (#A8C5FF)
- **Muted**: Light Gray (#D1D5DB)
- **Border**: Extra Light Gray (#E5E7EB)

### Dark Mode
- **Background**: Near Black (#1A1A1A)
- **Foreground**: White (#F5F5F5)
- **Card**: Dark Gray (#2D2D2D)
- **Primary**: Light Blue (#A8C5FF)
- **Accent**: Blue (#5B6FDD)
- **Muted**: Dark Gray (#404040)
- **Border**: Gray (#333333)

## Responsive Breakpoints

```
Mobile:     < 640px    (sm)
Tablet:     640px+     (md)
Desktop:    1024px+    (lg)
Wide:       1280px+    (xl)
```

## Interactive Elements

### Buttons
- **Primary**: Filled with primary color
- **Secondary**: Outlined
- **Ghost**: No background
- **Destructive**: Red for delete actions

### Forms
- **Input**: Rounded corners, border on focus
- **Textarea**: Multi-line with placeholder
- **Select**: Dropdown with arrow icon
- **Checkbox**: Rounded square

### Modals
- **Overlay**: Semi-transparent dark background
- **Content**: Centered card with close button
- **Animations**: Fade in/scale

## Animations

- **Page Load**: Fade in from bottom
- **Hover**: Subtle scale and shadow increase
- **Click**: Brief scale down
- **Modal**: Scale up from center
- **List Items**: Staggered fade in

---

This layout guide provides a visual reference for the UI structure throughout the application.
