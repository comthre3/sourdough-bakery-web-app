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

# Create backup of current setup
create_backup() {
  print_message "Creating backup of current setup..."
  
  # Get current date for backup name
  BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="/root/sourdough-bakery-backup-$BACKUP_DATE"
  
  # Create backup directory
  mkdir -p "$BACKUP_DIR"
  
  # Copy all files from current setup to backup directory
  if [ -d "/root/sourdough-bakery" ]; then
    cp -r /root/sourdough-bakery/* "$BACKUP_DIR"
    print_success "Backup created successfully at $BACKUP_DIR"
  else
    print_error "Sourdough bakery directory not found. Creating empty backup directory."
    mkdir -p "$BACKUP_DIR/public"
  fi
  
  # Create a restore script in the backup directory
  cat > "$BACKUP_DIR/restore.sh" << 'EOFR'
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

print_message "Restoring Sourdough Bakery Web App from backup..."

# Stop any running containers
if command -v docker-compose &> /dev/null; then
  if [ -d "/root/sourdough-bakery" ]; then
    cd /root/sourdough-bakery
    docker-compose down
  fi
fi

# Remove current installation
rm -rf /root/sourdough-bakery

# Create directory
mkdir -p /root/sourdough-bakery

# Copy backup files to installation directory
cp -r * /root/sourdough-bakery/

print_success "Backup restored successfully!"
print_message "To restart the application, navigate to /root/sourdough-bakery and run your original startup commands."
EOFR

  # Make restore script executable
  chmod +x "$BACKUP_DIR/restore.sh"
  
  print_success "Restore script created at $BACKUP_DIR/restore.sh"
}

# Main function
main() {
  print_message "Creating backup of Sourdough Bakery Web App..."
  create_backup
  print_success "Backup completed successfully!"
  print_message "Now you can proceed with the server-side storage implementation."
}

# Run main function
main
