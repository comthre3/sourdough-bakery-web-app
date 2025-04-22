# Self-Hosting Guide for Sourdough Bakery Web App

This guide provides instructions for self-hosting the Sourdough Bakery Web App on various platforms.

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
4. Rebuild the application and deploy the updated build

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

## Option 4: AWS Amplify Deployment

### Prerequisites
- An AWS account
- Git repository with your project

### Step 1: Set Up AWS Amplify

1. Log in to the AWS Management Console
2. Navigate to AWS Amplify
3. Click "New app" > "Host web app"
4. Connect to your Git repository
5. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

6. Click "Save and deploy"

### Step 2: Configure Environment Variables

1. In the Amplify Console, go to App settings > Environment variables
2. Add your Firebase configuration as environment variables
3. Redeploy the application

## Firebase Configuration

For all self-hosting options, you'll need to configure Firebase:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication with Email/Password method
3. Create a Firestore Database
4. Set up appropriate security rules
5. Add your hosting domain to the authorized domains in Authentication settings
6. Update the Firebase configuration in your app

## Backup and Maintenance

### Regular Backups
- Set up regular backups of your Firestore data using Firebase's export functionality
- Keep backups of your application code and configuration files

### Updates and Maintenance
- Regularly update dependencies to address security vulnerabilities
- Monitor Firebase usage to stay within free tier limits or budget
- Set up monitoring for your hosting platform to detect outages

## Troubleshooting

### Application Not Loading
- Check that all static files are being served correctly
- Verify that rewrite rules are properly configured for SPA routing
- Check browser console for JavaScript errors

### Authentication Issues
- Ensure your Firebase project is correctly configured
- Verify that your hosting domain is added to authorized domains in Firebase Authentication
- Check that your Firebase configuration in the app is correct

### Database Connection Issues
- Verify Firestore security rules allow proper access
- Check that your Firebase project ID is correct
- Ensure your Firebase API key is valid

## Performance Optimization

### Caching
- Configure proper caching headers for static assets
- Consider using a CDN for global distribution

### Compression
- Enable gzip or Brotli compression on your web server
- Optimize images and other assets

### Monitoring
- Set up uptime monitoring for your hosted application
- Monitor Firebase usage and performance

## Security Considerations

- Always use HTTPS for production deployments
- Regularly update dependencies to patch security vulnerabilities
- Configure proper Firestore security rules to protect user data
- Consider implementing rate limiting to prevent abuse
- Set up proper authentication and authorization controls
