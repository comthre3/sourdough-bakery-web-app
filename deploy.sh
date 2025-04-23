#!/bin/bash

# Print colored messages
print_message() {
  echo -e "\e[1;34m$1\e[0m"
}

print_success() {
  echo -e "\e[1;32m$1\e[0m"
}

print_error() {
  echo -e "\e[1;31m$1\e[0m"
}

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  print_error "Please run this script as root"
  exit 1
fi

# Install Docker if not already installed
install_docker() {
  print_message "Checking if Docker is installed..."
  if ! command -v docker &> /dev/null; then
    print_message "Docker not found. Installing Docker..."
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs)  stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl enable docker
    systemctl start docker
    print_success "Docker installed successfully!"
  else
    print_success "Docker is already installed."
  fi

  # Install Docker Compose if not already installed
  if ! command -v docker-compose &> /dev/null; then
    print_message "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s) -$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully!"
  else
    print_success "Docker Compose is already installed."
  fi
}

# Start Docker containers
start_containers() {
  print_message "Starting Docker containers..."
  
  cd /root/sourdough-bakery
  
  # Stop and remove existing containers if they exist
  docker-compose down
  
  # Build and start containers
  docker-compose up -d
  
  print_success "Docker containers started successfully!"
}

# Main function
main() {
  print_message "Starting Sourdough Bakery Web App deployment..."
  
  install_docker
  start_containers
  
  print_success "Sourdough Bakery Web App deployed successfully with server-side storage!"
  print_message "You can access the app at http://localhost or http://server-ip-address"
}

# Run main function
main
