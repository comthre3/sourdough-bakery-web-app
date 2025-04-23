#!/bin/bash

# Sourdough Bakery Web App Backup and Deployment Script
# This script creates a backup of the current setup and then implements server-side storage

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

# Create server directory structure
create_directory_structure() {
  print_message "Creating server directory structure..."
  
  # Create main project directory
  mkdir -p /root/sourdough-bakery/server/data
  
  print_success "Directory structure created successfully!"
}

# Implement server-side storage
implement_server_storage() {
  print_message "Implementing server-side storage..."
  
  # Create server.js file
  cat > /root/sourdough-bakery/server/server.js << 'EOF'
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const dataFiles = ['users.json', 'recipes.json', 'tasks.json', 'starters.json', 'timers.json', 'ingredients.json'];

dataFiles.forEach(file => {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
});

// Helper function to read data from file
function readData(file) {
  const filePath = path.join(DATA_DIR, file);
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write data to file
function writeData(file, data) {
  const filePath = path.join(DATA_DIR, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// User routes
app.get('/api/users', (req, res) => {
  const users = readData('users.json');
  // Remove passwords before sending
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  res.json(safeUsers);
});

app.post('/api/users/register', (req, res) => {
  const { email, password, displayName, role = 'trainee' } = req.body;
  const users = readData('users.json');
  
  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // In a real app, this should be hashed
    displayName,
    role,
    emailVerified: false,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeData('users.json', users);
  
  // Remove password before sending response
  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData('users.json');
  
  // Find user
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  // Remove password before sending response
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// Recipe routes
app.get('/api/recipes', (req, res) => {
  const recipes = readData('recipes.json');
  res.json(recipes);
});

app.get('/api/recipes/:id', (req, res) => {
  const recipes = readData('recipes.json');
  const recipe = recipes.find(r => r.id === req.params.id);
  
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  res.json(recipe);
});

app.post('/api/recipes', (req, res) => {
  const recipes = readData('recipes.json');
  const newRecipe = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  recipes.push(newRecipe);
  writeData('recipes.json', recipes);
  res.status(201).json(newRecipe);
});

app.put('/api/recipes/:id', (req, res) => {
  const recipes = readData('recipes.json');
  const index = recipes.findIndex(r => r.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  const updatedRecipe = {
    ...recipes[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  recipes[index] = updatedRecipe;
  writeData('recipes.json', recipes);
  res.json(updatedRecipe);
});

app.delete('/api/recipes/:id', (req, res) => {
  const recipes = readData('recipes.json');
  const index = recipes.findIndex(r => r.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  recipes.splice(index, 1);
  writeData('recipes.json', recipes);
  res.json({ message: 'Recipe deleted successfully' });
});

// Task routes
app.get('/api/tasks', (req, res) => {
  const tasks = readData('tasks.json');
  res.json(tasks);
});

app.get('/api/tasks/:id', (req, res) => {
  const tasks = readData('tasks.json');
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const tasks = readData('tasks.json');
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  writeData('tasks.json', tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readData('tasks.json');
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const updatedTask = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  tasks[index] = updatedTask;
  writeData('tasks.json', tasks);
  res.json(updatedTask);
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readData('tasks.json');
  const index = tasks.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(index, 1);
  writeData('tasks.json', tasks);
  res.json({ message: 'Task deleted successfully' });
});

// Starter routes
app.get('/api/starters', (req, res) => {
  const starters = readData('starters.json');
  res.json(starters);
});

app.get('/api/starters/:id', (req, res) => {
  const starters = readData('starters.json');
  const starter = starters.find(s => s.id === req.params.id);
  
  if (!starter) {
    return res.status(404).json({ error: 'Starter not found' });
  }
  
  res.json(starter);
});

app.post('/api/starters', (req, res) => {
  const starters = readData('starters.json');
  const newStarter = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  starters.push(newStarter);
  writeData('starters.json', starters);
  res.status(201).json(newStarter);
});

app.put('/api/starters/:id', (req, res) => {
  const starters = readData('starters.json');
  const index = starters.findIndex(s => s.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Starter not found' });
  }
  
  const updatedStarter = {
    ...starters[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  starters[index] = updatedStarter;
  writeData('starters.json', starters);
  res.json(updatedStarter);
});

app.delete('/api/starters/:id', (req, res) => {
  const starters = readData('starters.json');
  const index = starters.findIndex(s => s.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Starter not found' });
  }
  
  starters.splice(index, 1);
  writeData('starters.json', starters);
  res.json({ message: 'Starter deleted successfully' });
});

// Timer routes
app.get('/api/timers', (req, res) => {
  const timers = readData('timers.json');
  res.json(timers);
});

app.get('/api/timers/:id', (req, res) => {
  const timers = readData('timers.json');
  const timer = timers.find(t => t.id === req.params.id);
  
  if (!timer) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  res.json(timer);
});

app.post('/api/timers', (req, res) => {
  const timers = readData('timers.json');
  const newTimer = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  timers.push(newTimer);
  writeData('timers.json', timers);
  res.status(201).json(newTimer);
});

app.put('/api/timers/:id', (req, res) => {
  const timers = readData('timers.json');
  const index = timers.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  const updatedTimer = {
    ...timers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  timers[index] = updatedTimer;
  writeData('timers.json', timers);
  res.json(updatedTimer);
});

app.delete('/api/timers/:id', (req, res) => {
  const timers = readData('timers.json');
  const index = timers.findIndex(t => t.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Timer not found' });
  }
  
  timers.splice(index, 1);
  writeData('timers.json', timers);
  res.json({ message: 'Timer deleted successfully' });
});

// Ingredient routes
app.get('/api/ingredients', (req, res) => {
  const ingredients = readData('ingredients.json');
  res.json(ingredients);
});

app.get('/api/ingredients/:id', (req, res) => {
  const ingredients = readData('ingredients.json');
  const ingredient = ingredients.find(i => i.id === req.params.id);
  
  if (!ingredient) {
    return res.status(404).json({ error: 'Ingredient not found' });
  }
  
  res.json(ingredient);
});

app.post('/api/ingredients', (req, res) => {
  const ingredients = readData('ingredients.json');
  const newIngredient = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  ingredients.push(newIngredient);
  writeData('ingredients.json', ingredients);
  res.status(201).json(newIngredient);
});

app.put('/api/ingredients/:id', (req, res) => {
  const ingredients = readData('ingredients.json');
  const index = ingredients.findIndex(i => i.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Ingredient not found' });
  }
  
  const updatedIngredient = {
    ...ingredients[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  ingredients[index] = updatedIngredient;
  writeData('ingredients.json', ingredients);
  res.json(updatedIngredient);
});

app.delete('/api/ingredients/:id', (req, res) => {
  const ingredients = readData('ingredients.json');
  const index = ingredients.findIndex(i => i.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Ingredient not found' });
  }
  
  ingredients.splice(index, 1);
  writeData('ingredients.json', ingredients);
  res.json({ message: 'Ingredient deleted successfully' });
});

// CSV Import route for ingredients
app.post('/api/ingredients/import', (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }
    
    // Parse CSV data
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Check required headers
    const requiredHeaders = ['name', 'category', 'unit'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({ error: `Missing required headers: ${missingHeaders.join(', ')}` });
    }
    
    // Parse ingredients
    const ingredients = readData('ingredients.json');
    const newIngredients = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(value => value.trim());
      
      if (values.length !== headers.length) {
        return res.status(400).json({ error: `Line ${i + 1} has incorrect number of values` });
      }
      
      const ingredient = {};
      headers.forEach((header, index) => {
        ingredient[header] = values[index];
      });
      
      // Add required fields
      ingredient.id = Date.now().toString() + i;
      ingredient.createdAt = new Date().toISOString();
      ingredient.updatedAt = new Date().toISOString();
      
      ingredients.push(ingredient);
      newIngredients.push(ingredient);
    }
    
    writeData('ingredients.json', ingredients);
    
    res.status(201).json({
      message: `Successfully imported ${newIngredients.length} ingredients`,
      ingredients: newIngredients
    });
  } catch (error) {
    console.error('Error importing ingredients:', error);
    res.status(500).json({ error: 'Error importing ingredients' });
  }
});

// Initialize demo users if none exist
function initDemoUsers() {
  const users = readData('users.json');
  
  if (users.length === 0) {
    const demoUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        password: 'Admin123!',
        displayName: 'Admin User',
        role: 'admin',
        emailVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'manager@example.com',
        password: 'Manager123!',
        displayName: 'Manager User',
        role: 'manager',
        emailVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'baker@example.com',
        password: 'Baker123!',
        displayName: 'Baker User',
        role: 'baker',
        emailVerified: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        email: 'trainee@example.com',
        password: 'Trainee123!',
        displayName: 'Trainee User',
        role: 'trainee',
        emailVerified: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    writeData('users.json', demoUsers);
    console.log('Demo users created');
  }
}

// Initialize demo data
initDemoUsers();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
