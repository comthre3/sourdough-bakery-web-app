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

# Check if Docker is installed
check_docker() {
  print_message "Checking Docker installation..."
  if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    print_message "You can install Docker with: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
  fi
  print_success "Docker is installed: $(docker --version) "
  
  if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    print_message "You can install Docker Compose with: curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s) -$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
    exit 1
  fi
  print_success "Docker Compose is installed: $(docker-compose --version)"
}

# Deploy with Docker
deploy_with_docker() {
  print_message "Deploying with Docker..."
  
  # Stop and remove existing containers
  docker-compose down
  
  # Start containers
  docker-compose up -d
  
  print_success "Deployed with Docker"
}

# Main function
main() {
  print_message "Starting Sourdough Bakery Web App deployment..."
  
  check_docker
  deploy_with_docker
  
  print_success "Sourdough Bakery Web App deployment completed!"
  print_message "You can access the app at http://localhost"
  print_message "API is available at http://localhost/api"
}

# Run main function
main
