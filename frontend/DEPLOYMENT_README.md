# Frontend Deployment Guide

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Deployment Checklist

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

- Ensure `.env` file is configured
- Set `REACT_APP_ENABLE_CHAT=true` if needed
- Configure any other environment-specific variables

### 3. Build the Application

```bash
npm run build
```

### 4. Routing Configuration

For single-page applications (SPA) with client-side routing:

- Configure your server to redirect all routes to `index.html`

#### Nginx Example

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache `.htaccess`

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 5. Verify Deployment

- Check browser console for errors
- Test all routes:
  - `/`
  - `/room/:roomId`
  - `/jitsi-meet`

### Troubleshooting

- Ensure all dependencies are installed
- Check that build process completes without errors
- Verify server routing configuration
- Check browser developer tools for any import or routing issues

### Common Issues

- Missing environment variables
- Incorrect server routing configuration
- Dependency version conflicts

## Recommended Hosting Platforms

- Netlify
- Vercel
- AWS Amplify
- GitHub Pages

## Contact Support

If you encounter persistent issues, please provide:

- Browser console logs
- Deployment platform details
- Build and deployment command outputs
