#!/bin/bash

# Sourdough Bakery Web App Deployment Script
# This script automates the setup and deployment of the Sourdough Bakery Web App
# with MongoDB database integration

# Text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  print_error "Please run this script as root (use sudo)"
  exit 1
fi

# Create app directory structure
create_directory_structure() {
  print_message "Creating directory structure..."
  
  mkdir -p /opt/sourdough-bakery/{public,backend,data}
  mkdir -p /opt/sourdough-bakery/backend/{models,routes,middleware}
  
  print_success "Directory structure created"
}

# Install system dependencies
install_system_dependencies() {
  print_message "Updating system packages..."
  apt-get update
  
  print_message "Installing system dependencies..."
  apt-get install -y curl wget gnupg apt-transport-https ca-certificates software-properties-common

  # Install Node.js
  print_message "Installing Node.js..."
  if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed: $(node -v) "
  else
    print_success "Node.js already installed: $(node -v)"
  fi

  # Install MongoDB
  print_message "Installing MongoDB..."
  if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
    apt-get update
    apt-get install -y mongodb-org
    
    # Create MongoDB data directory
    mkdir -p /opt/sourdough-bakery/data/db
    
    # Start MongoDB service
    systemctl enable mongod
    systemctl start mongod
    print_success "MongoDB installed and started"
  else
    print_success "MongoDB already installed"
  fi

  # Install Docker and Docker Compose
  print_message "Installing Docker..."
  if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    print_success "Docker installed: $(docker --version) "
  else
    print_success "Docker already installed: $(docker --version)"
  fi

  print_message "Installing Docker Compose..."
  if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s) -$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed: $(docker-compose --version)"
  else
    print_success "Docker Compose already installed: $(docker-compose --version)"
  fi

  # Install Nginx
  print_message "Installing Nginx..."
  if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    print_success "Nginx installed: $(nginx -v 2>&1)"
  else
    print_success "Nginx already installed: $(nginx -v 2>&1)"
  fi
}

# Create Docker Compose configuration
create_docker_compose() {
  print_message "Creating Docker Compose configuration..."
  
  cat > /opt/sourdough-bakery/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB database
  mongo:
    image: mongo
    container_name: sourdough-mongo
    volumes:
      - mongo-data:/data/db
    restart: always
    
  # Node.js backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sourdough-backend
    depends_on:
      - mongo
    environment:
      - MONGODB_URI=mongodb://mongo:27017/sourdough-bakery
      - JWT_SECRET=sourdough-bakery-secret-key
    restart: always
    
  # Nginx web server
  web:
    image: nginx:alpine
    container_name: sourdough-web
    ports:
      - "80:80"
    volumes:
      - ./public:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend
    restart: always

volumes:
  mongo-data:
EOF

  # Create Dockerfile for backend
  cat > /opt/sourdough-bakery/backend/Dockerfile << 'EOF'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF

  # Create Nginx configuration for Docker
  cat > /opt/sourdough-bakery/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

  print_success "Docker Compose configuration created"
}

# Copy existing files
copy_existing_files()  {
  print_message "Copying existing files..."
  
  # Check if source directory exists
  if [ -d "/root/sourdough-bakery/public" ]; then
    cp -r /root/sourdough-bakery/public/* /opt/sourdough-bakery/public/
    print_success "Existing files copied from /root/sourdough-bakery/public"
  else
    print_message "No existing files found in /root/sourdough-bakery/public"
  fi
}

# Deploy with Docker
deploy_with_docker() {
  print_message "Deploying with Docker..."
  
  cd /opt/sourdough-bakery
  docker-compose up -d
  
  print_success "Deployed with Docker"
}

# Main function
main() {
  print_message "Starting Sourdough Bakery Web App deployment..."
  
  create_directory_structure
  install_system_dependencies
  create_docker_compose
  copy_existing_files
  deploy_with_docker
  
  print_success "Sourdough Bakery Web App deployment completed!"
  print_message "You can access the app at http://localhost"
  print_message "Next steps:"
  print_message "1. Download the backend files from GitHub: https://github.com/sourdough-bakery/backend"
  print_message "2. Place them in /opt/sourdough-bakery/backend"
  print_message "3. Restart the Docker containers: docker-compose down && docker-compose up -d"
}

# Run main function
main
