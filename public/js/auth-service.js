// Local Authentication Service
const AuthService = {
  // User storage
  users: JSON.parse(localStorage.getItem('sourdough_users') || '[]'),
  
  // Current user
  currentUser: JSON.parse(localStorage.getItem('sourdough_current_user') || 'null'),
  
  // Save users to local storage
  saveUsers() {
    localStorage.setItem('sourdough_users', JSON.stringify(this.users));
  },
  
  // Save current user to local storage
  saveCurrentUser() {
    localStorage.setItem('sourdough_current_user', JSON.stringify(this.currentUser));
  },
  
  // Create a new user
  createUser(email, password, displayName, role = 'trainee') {
    // Check if user already exists
    if (this.users.find(user => user.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create user object
    const user = {
      id: Date.now().toString(),
      email,
      password,
      displayName,
      role,
      emailVerified: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    this.users.push(user);
    this.saveUsers();
    
    return user;
  },
  
  // Sign in user
  signIn(email, password, rememberMe = false) {
    // Find user
    const user = this.users.find(user => user.email === email);
    
    // Check if user exists and password matches
    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Set current user (without password)
    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    this.saveCurrentUser();
    
    // If remember me is false, set a timeout to clear user after session
    if (!rememberMe) {
      sessionStorage.setItem('sourdough_session', 'active');
    }
    
    return userWithoutPassword;
  },
  
  // Sign out user
  signOut() {
    this.currentUser = null;
    localStorage.removeItem('sourdough_current_user');
    sessionStorage.removeItem('sourdough_session');
  },
  
  // Check if user is signed in
  isSignedIn() {
    return this.currentUser !== null;
  },
  
  // Get current user
  getCurrentUser() {
    return this.currentUser;
  },
  
  // Check if user has permission
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    const rolePermissions = {
      admin: ['manage_users', 'manage_recipes', 'manage_tasks', 'manage_starters', 'manage_timers', 'view_reports'],
      manager: ['manage_recipes', 'manage_tasks', 'manage_starters', 'view_reports'],
      baker: ['view_recipes', 'update_tasks', 'manage_timers', 'record_feedings'],
      trainee: ['view_recipes', 'view_tasks', 'use_timers']
    };
    
    // Admin has all permissions
    if (this.currentUser.role === 'admin') return true;
    
    // Check if user's role has the requested permission
    return rolePermissions[this.currentUser.role]?.includes(permission) || false;
  },
  
  // Initialize with demo users
  initDemoUsers() {
    // Only initialize if no users exist
    if (this.users.length === 0) {
      // Create demo users with different roles
      this.createUser('admin@example.com', 'Admin123!', 'Admin User', 'admin');
      this.createUser('manager@example.com', 'Manager123!', 'Manager User', 'manager');
      this.createUser('baker@example.com', 'Baker123!', 'Baker User', 'baker');
      this.createUser('trainee@example.com', 'Trainee123!', 'Trainee User', 'trainee');
      
      console.log('Demo users created');
    }
  }
};

// Initialize demo users
AuthService.initDemoUsers();
