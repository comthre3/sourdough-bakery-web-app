# Self-Hosting Guide for Sourdough Bakery Web App (Updated)

This guide provides instructions for self-hosting the Sourdough Bakery Web App with the newly implemented features including user roles, authentication enhancements, and more.

## New Features Implementation

The application now includes the following enhanced features:

1. **User Roles System**:
   - Admin: Full access to all features, user management, system settings
   - Manager: Can manage recipes, tasks, and starters; assign tasks; view reports
   - Baker: Can use recipes, update assigned tasks, manage timers, record feedings
   - Trainee: Read-only access to recipes, view assigned tasks, use timers

2. **Enhanced Authentication**:
   - "Remember me" functionality for persistent login
   - Account lockout after 5 failed login attempts (15-minute lockout period)
   - Email verification for new accounts

## Option 1: Traditional Web Server (Apache/Nginx)

### Prerequisites
- A web server (Apache, Nginx, etc.)
- Node.js and npm for building the application
- Basic knowledge of web server configuration

### Step 1: Build the Application

```bash
# Navigate to the project directory
cd sourdough-bakery-web-app

# Install dependencies
npm install

# Build the application
npm run build
```

This creates a `build` directory with static files ready for deployment.

### Step 2: Configure Apache

If using Apache, create a virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName sourdough-bakery.yourdomain.com
    DocumentRoot /path/to/sourdough-bakery-web-app/build
    
    <Directory "/path/to/sourdough-bakery-web-app/build">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Rewrite rules for SPA routing
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    ErrorLog ${APACHE_LOG_DIR}/sourdough-bakery-error.log
    CustomLog ${APACHE_LOG_DIR}/sourdough-bakery-access.log combined
</VirtualHost>
```

Enable the virtual host and restart Apache:

```bash
sudo a2ensite your-config-file.conf
sudo systemctl restart apache2
```

### Step 3: Configure Nginx

If using Nginx, create a server block configuration:

```nginx
server {
    listen 80;
    server_name sourdough-bakery.yourdomain.com;
    root /path/to/sourdough-bakery-web-app/build;
    index index.html;
    
    # Rewrite rules for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
    
    error_log /var/log/nginx/sourdough-bakery-error.log;
    access_log /var/log/nginx/sourdough-bakery-access.log;
}
```

Enable the configuration and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/your-config-file /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Step 4: Configure Firebase Backend

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication and Firestore Database
3. Update the Firebase configuration in `src/firebase/config.ts` with your project details
4. **Important**: Set up the following Firestore collections:
   - `users`: For user data including roles
   - `loginAttempts`: For tracking failed login attempts
   - `recipes`: For recipe data
   - `tasks`: For task management
   - `starters`: For starter management
   - `timers`: For timer data
5. Rebuild the application and deploy the updated build

## Option 2: Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Basic knowledge of Docker

### Step 1: Create a Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Nginx Configuration

Create an `nginx.conf` file:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

### Step 3: Create Docker Compose File

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  sourdough-bakery-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: always
```

### Step 4: Build and Run with Docker Compose

```bash
docker-compose up -d
```

Your app will be available at http://localhost or your server's IP address.

### Step 5: Configure Firebase Backend

Follow the same Firebase configuration steps as in Option 1, Step 4.

## Option 3: Netlify Deployment

### Prerequisites
- A Netlify account
- Git repository with your project

### Step 1: Prepare for Netlify

Create a `netlify.toml` file in the project root:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy to Netlify

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Log in to Netlify and click "New site from Git"
3. Select your repository and configure build settings
4. Deploy the site

### Step 3: Configure Environment Variables

1. In the Netlify dashboard, go to Site settings > Build & deploy > Environment
2. Add your Firebase configuration as environment variables
3. Trigger a new deployment

## Firebase Configuration for New Features

### Authentication Setup

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Email/Password authentication
3. Enable Email verification (required for the email verification feature)
4. Add your hosting domain to the authorized domains

### Firestore Database Setup

1. Create a Firestore Database in Firebase Console
2. Set up the following collections with appropriate security rules:

#### Users Collection
```
users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - role: string (admin, manager, baker, trainee)
  - createdAt: timestamp
  - lastLogin: timestamp
  - emailVerified: boolean
```

#### Login Attempts Collection
```
loginAttempts/{email}
  - count: number
  - lastAttempt: timestamp
  - lockedUntil: timestamp (optional)
```

### Security Rules

Set up the following security rules for Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Login attempts - only backend access
    match /loginAttempts/{email} {
      allow read, write: if request.auth != null;
    }
    
    // Recipes
    match /recipes/{recipeId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager');
    }
    
    // Tasks
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'baker');
      allow delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager');
    }
    
    // Starters
    match /starters/{starterId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'baker');
      allow delete: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager');
    }
    
    // Timers - all authenticated users can access
    match /timers/{timerId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Testing the New Features

After deployment, test the following features:

1. **User Registration and Roles**:
   - Create users with different roles
   - Verify that each role has appropriate access restrictions

2. **Authentication Enhancements**:
   - Test "Remember Me" functionality by checking if login persists after browser restart
   - Test account lockout by entering incorrect passwords multiple times
   - Test email verification by creating a new account and verifying the email

3. **Core Functionality**:
   - Test recipe management with different user roles
   - Test task management with different user roles
   - Test timer functionality
   - Test starter management with different user roles

Refer to the comprehensive test plan in the project repository for detailed testing procedures.

## Troubleshooting

### Authentication Issues

- **Account Lockout**: If a user is locked out, they need to wait for the lockout period (15 minutes) to expire. There is no admin override in the current implementation.
- **Email Verification**: If verification emails are not being received, check spam folders and verify that Firebase email verification is properly configured.
- **Remember Me Not Working**: Ensure that cookies are enabled in the browser and that the Firebase persistence is properly configured.

### Role-Based Access Issues

- If users can access pages they shouldn't be able to, verify that the ProtectedRoute component is properly implemented in all routes.
- Check that the hasPermission function is being used correctly to restrict access to features.

### Database Issues

- Verify that Firestore security rules are properly configured to enforce role-based access control.
- Check that all required collections are created in Firestore.

## Security Considerations

- Always use HTTPS for production deployments
- Regularly update dependencies to patch security vulnerabilities
- Configure proper Firestore security rules to protect user data
- Consider implementing rate limiting to prevent abuse
- Set up proper authentication and authorization controls
- Regularly backup your Firestore data

## Maintenance and Updates

- Regularly check for updates to dependencies
- Monitor Firebase usage to stay within free tier limits or budget
- Set up monitoring for your hosting platform to detect outages
- Implement a backup strategy for your Firestore data
