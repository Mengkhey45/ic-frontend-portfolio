# API Integration Guide

This document outlines the expected API endpoints and request/response formats for the backend to work with this frontend.

## Base URL

```
http://localhost:3001/api
```

Configure in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Authentication

### Login

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "mengkheykhorn@gmail.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "mengkheykhorn@gmail.com",
    "name": "Admin User"
  }
}
```

**Error** (401 Unauthorized):
```json
{
  "message": "Invalid credentials"
}
```

---

## Projects

### Get All Projects

**Endpoint**: `GET /projects`

**Headers**: 
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "projects": [
    {
      "_id": "project_id",
      "title": "E-Commerce Website",
      "description": "Built a full-stack e-commerce platform",
      "thumbnail": "https://...",
      "category": "category_id",
      "label": "High priority client",
      "media": [
        {
          "type": "image",
          "url": "https://...",
          "title": "Homepage"
        },
        {
          "type": "video",
          "url": "https://...",
          "title": "Demo Video"
        }
      ],
      "links": ["https://example.com"],
      "isHidden": false,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    }
  ]
}
```

### Create Project

**Endpoint**: `POST /projects`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
title: "My New Project"
description: "Project description..."
category: "category_id"
label: "Private notes"
isHidden: false
links: ["https://example.com", "https://demo.com"]
thumbnail: [File]
images: [File]
video: [File]
pdf: [File]
```

**Response** (201 Created):
```json
{
  "_id": "new_project_id",
  "title": "My New Project",
  "description": "Project description...",
  "category": "category_id",
  "label": "Private notes",
  "media": [...],
  "links": [...],
  "isHidden": false,
  "createdAt": "2024-01-21T10:00:00Z"
}
```

### Update Project

**Endpoint**: `PUT /projects/:id`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body**: Same as Create Project (partial update)

**Response** (200 OK): Updated project object

### Delete Project

**Endpoint**: `DELETE /projects/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Project deleted successfully"
}
```

### Toggle Project Visibility

**Endpoint**: `PATCH /projects/:id/visibility`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "isHidden": true
}
```

**Response** (200 OK):
```json
{
  "_id": "project_id",
  "isHidden": true
}
```

---

## Categories

### Get All Categories

**Endpoint**: `GET /categories`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "categories": [
    {
      "_id": "category_id",
      "name": "Website",
      "description": "Web development projects",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

### Create Category

**Endpoint**: `POST /categories`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Mobile App",
  "description": "Mobile application projects"
}
```

**Response** (201 Created):
```json
{
  "_id": "new_category_id",
  "name": "Mobile App",
  "description": "Mobile application projects",
  "createdAt": "2024-01-21T10:00:00Z"
}
```

### Update Category

**Endpoint**: `PUT /categories/:id`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response** (200 OK): Updated category object

### Delete Category

**Endpoint**: `DELETE /categories/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Category deleted successfully"
}
```

---

## Portfolio Sharing

### Generate Share Link

**Endpoint**: `POST /share-links`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "isPortfolioLink": true,
  "expiresAt": "2024-02-01T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "_id": "link_id",
  "token": "unique_token_string",
  "expiresAt": "2024-02-01T00:00:00Z",
  "isPortfolioLink": true,
  "createdAt": "2024-01-21T10:00:00Z"
}
```

### Get Share Links

**Endpoint**: `GET /share-links`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "shareLinks": [
    {
      "_id": "link_id",
      "token": "unique_token",
      "expiresAt": "2024-02-01T00:00:00Z",
      "isPortfolioLink": true,
      "createdAt": "2024-01-21T10:00:00Z"
    }
  ]
}
```

### Delete Share Link

**Endpoint**: `DELETE /share-links/:id`

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Share link deleted successfully"
}
```

---

## Public Portfolio Access

### Get Portfolio by Token

**Endpoint**: `GET /portfolio?token={token}`

**Response** (200 OK):
```json
{
  "projects": [
    {
      "_id": "project_id",
      "title": "Project Title",
      "description": "Description...",
      "thumbnail": "https://...",
      "category": "category_id",
      "media": [...],
      "links": [...],
      "isHidden": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "categories": [
    {
      "_id": "category_id",
      "name": "Website",
      "description": "Web projects"
    }
  ]
}
```

**Error** (404 Not Found - Token expired or invalid):
```json
{
  "message": "Invalid or expired share link"
}
```

---

## File Upload Handling

### Upload Configuration

- **Thumbnail**: Single image file (JPG, PNG) - recommended 16:9 ratio
- **Images**: Multiple image files (JPG, PNG)
- **Video**: Video file (MP4, WebM, etc.)
- **PDF**: PDF document

### Storage (Cloudflare R2)

- Files should be stored in Cloudflare R2
- Return public URLs in API responses
- Recommended: Use signed URLs for private files with expiration

### File Size Limits (Suggested)

- Thumbnail: 5MB
- Images: 10MB each
- Videos: 100MB
- PDFs: 20MB

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": {
    "title": "Title is required"
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "message": "Only mengkheykhorn@gmail.com can access admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## CORS Configuration

Frontend expects:
```
Origin: http://localhost:3000 (or your deployment URL)
Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Headers: Content-Type, Authorization
Credentials: true (if using cookies)
```

---

## Implementation Notes

1. **Token Expiry**: Frontend assumes tokens last for a session. Implement refresh tokens for production.
2. **Email Validation**: Only `mengkheykhorn@gmail.com` can login to admin.
3. **Share Link Tokens**: Should be unique, URL-safe strings (e.g., base64url encoded).
4. **Hidden Projects**: Only visible in admin, not in public portfolio.
5. **Media Storage**: Store in Cloudflare R2, return public URLs in API responses.
6. **Timestamps**: Use ISO 8601 format (e.g., `2024-01-21T10:00:00Z`).
