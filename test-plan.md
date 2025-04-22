# Comprehensive Test Plan for Sourdough Bakery Web App

## 1. Authentication Testing

### 1.1 User Registration
- **Test ID**: AUTH-REG-01
- **Description**: Verify new user registration with valid data
- **Steps**:
  1. Navigate to signup page
  2. Enter valid name, email, password, confirm password
  3. Select a role (trainee)
  4. Submit the form
- **Expected Result**: User account is created, verification email is sent, user is redirected to dashboard

### 1.2 Email Verification
- **Test ID**: AUTH-VER-01
- **Description**: Verify email verification status is displayed correctly
- **Steps**:
  1. Register a new user
  2. Navigate to user profile
- **Expected Result**: Warning alert is shown indicating email is not verified with a resend button

- **Test ID**: AUTH-VER-02
- **Description**: Verify resend verification email functionality
- **Steps**:
  1. Navigate to user profile with unverified account
  2. Click "Resend" button
- **Expected Result**: Success message appears indicating verification email was sent

### 1.3 Login
- **Test ID**: AUTH-LOG-01
- **Description**: Verify login with valid credentials
- **Steps**:
  1. Navigate to login page
  2. Enter valid email and password
  3. Submit the form
- **Expected Result**: User is logged in and redirected to dashboard

- **Test ID**: AUTH-LOG-02
- **Description**: Verify "Remember Me" functionality
- **Steps**:
  1. Navigate to login page
  2. Enter valid credentials
  3. Check "Remember Me" checkbox
  4. Login
  5. Close browser and reopen
  6. Navigate to app URL
- **Expected Result**: User remains logged in after browser restart

### 1.4 Account Lockout
- **Test ID**: AUTH-LOCK-01
- **Description**: Verify account lockout after multiple failed login attempts
- **Steps**:
  1. Navigate to login page
  2. Enter valid email with incorrect password 5 times
- **Expected Result**: Account is locked, error message shows lockout duration

- **Test ID**: AUTH-LOCK-02
- **Description**: Verify account remains locked for specified duration
- **Steps**:
  1. Attempt to login with correct credentials after lockout
- **Expected Result**: Error message indicates account is still locked with remaining time

### 1.5 Logout
- **Test ID**: AUTH-OUT-01
- **Description**: Verify logout functionality
- **Steps**:
  1. Login with valid credentials
  2. Navigate to user profile
  3. Click logout button
- **Expected Result**: User is logged out and redirected to login page

## 2. Authorization Testing

### 2.1 Role-Based Access Control
- **Test ID**: AUTH-ROLE-01
- **Description**: Verify Admin role has access to all features
- **Steps**:
  1. Login as Admin user
  2. Navigate to all sections (recipes, tasks, timers, starters, settings, user management)
- **Expected Result**: Admin can access all sections without restrictions

- **Test ID**: AUTH-ROLE-02
- **Description**: Verify Manager role permissions
- **Steps**:
  1. Login as Manager user
  2. Attempt to access all sections
- **Expected Result**: Manager can access recipes, tasks, timers, starters but not user management

- **Test ID**: AUTH-ROLE-03
- **Description**: Verify Baker role permissions
- **Steps**:
  1. Login as Baker user
  2. Attempt to access all sections
- **Expected Result**: Baker can view recipes, edit assigned tasks, manage timers, record feedings

- **Test ID**: AUTH-ROLE-04
- **Description**: Verify Trainee role permissions
- **Steps**:
  1. Login as Trainee user
  2. Attempt to access all sections
- **Expected Result**: Trainee has read-only access to recipes, can view assigned tasks, use timers

### 2.2 Permission-Based Access Control
- **Test ID**: AUTH-PERM-01
- **Description**: Verify unauthorized access is handled correctly
- **Steps**:
  1. Login as Trainee user
  2. Attempt to access admin-only routes directly (e.g., /users)
- **Expected Result**: User is redirected to unauthorized page

## 3. Core Functionality Testing

### 3.1 Recipe Management
- **Test ID**: FUNC-REC-01
- **Description**: Verify recipe creation (Admin/Manager)
- **Steps**:
  1. Login as Admin or Manager
  2. Navigate to Recipes section
  3. Create new recipe with all required fields
- **Expected Result**: Recipe is created and appears in recipe list

- **Test ID**: FUNC-REC-02
- **Description**: Verify recipe editing (Admin/Manager)
- **Steps**:
  1. Login as Admin or Manager
  2. Navigate to Recipes section
  3. Edit existing recipe
- **Expected Result**: Recipe is updated with new information

- **Test ID**: FUNC-REC-03
- **Description**: Verify recipe viewing (All roles)
- **Steps**:
  1. Login as any user role
  2. Navigate to Recipes section
  3. View recipe details
- **Expected Result**: Recipe details are displayed correctly

### 3.2 Task Management
- **Test ID**: FUNC-TASK-01
- **Description**: Verify task creation (Admin/Manager)
- **Steps**:
  1. Login as Admin or Manager
  2. Navigate to Tasks section
  3. Create new task with all required fields
- **Expected Result**: Task is created and appears in task list

- **Test ID**: FUNC-TASK-02
- **Description**: Verify task editing (Admin/Manager/Baker)
- **Steps**:
  1. Login as Admin, Manager, or Baker
  2. Navigate to Tasks section
  3. Edit existing task
- **Expected Result**: Task is updated with new information

- **Test ID**: FUNC-TASK-03
- **Description**: Verify task status update (Admin/Manager/Baker)
- **Steps**:
  1. Login as Admin, Manager, or Baker
  2. Navigate to Tasks section
  3. Update task status
- **Expected Result**: Task status is updated correctly

### 3.3 Timer System
- **Test ID**: FUNC-TIME-01
- **Description**: Verify timer creation (All roles)
- **Steps**:
  1. Login as any user role
  2. Navigate to Timers section
  3. Create new timer with all required fields
- **Expected Result**: Timer is created and appears in timer list

- **Test ID**: FUNC-TIME-02
- **Description**: Verify timer controls (All roles)
- **Steps**:
  1. Login as any user role
  2. Navigate to Timers section
  3. Start, pause, resume, and reset timer
- **Expected Result**: Timer responds correctly to all controls

### 3.4 Starter Management
- **Test ID**: FUNC-START-01
- **Description**: Verify starter creation (Admin/Manager/Baker)
- **Steps**:
  1. Login as Admin, Manager, or Baker
  2. Navigate to Starters section
  3. Create new starter with all required fields
- **Expected Result**: Starter is created and appears in starter list

- **Test ID**: FUNC-START-02
- **Description**: Verify feeding record (Admin/Manager/Baker)
- **Steps**:
  1. Login as Admin, Manager, or Baker
  2. Navigate to Starters section
  3. Record feeding for existing starter
- **Expected Result**: Feeding is recorded and appears in feeding history

## 4. User Management Testing

### 4.1 User Administration
- **Test ID**: USER-ADMIN-01
- **Description**: Verify user listing (Admin only)
- **Steps**:
  1. Login as Admin
  2. Navigate to User Management section
- **Expected Result**: List of all users is displayed with correct information

- **Test ID**: USER-ADMIN-02
- **Description**: Verify role modification (Admin only)
- **Steps**:
  1. Login as Admin
  2. Navigate to User Management section
  3. Edit role of existing user
- **Expected Result**: User role is updated correctly

## 5. UI Testing

### 5.1 Responsive Design
- **Test ID**: UI-RESP-01
- **Description**: Verify responsive design on different screen sizes
- **Steps**:
  1. Access application on desktop, tablet, and mobile viewports
  2. Navigate through different sections
- **Expected Result**: UI adapts correctly to different screen sizes

### 5.2 Theme Consistency
- **Test ID**: UI-THEME-01
- **Description**: Verify UI matches design requirements
- **Steps**:
  1. Check color scheme across all pages
  2. Verify typography and spacing
- **Expected Result**: UI consistently follows the dark green (#4C7A4C) color scheme and design requirements

## 6. Error Handling

### 6.1 Form Validation
- **Test ID**: ERR-FORM-01
- **Description**: Verify form validation for all input forms
- **Steps**:
  1. Submit forms with invalid data
- **Expected Result**: Appropriate error messages are displayed

### 6.2 Error Messages
- **Test ID**: ERR-MSG-01
- **Description**: Verify error messages are clear and helpful
- **Steps**:
  1. Trigger various error conditions
- **Expected Result**: Error messages clearly explain the issue and suggest solutions

## Test Execution Checklist

| Test ID | Status | Notes |
|---------|--------|-------|
| AUTH-REG-01 | Pending | |
| AUTH-VER-01 | Pending | |
| AUTH-VER-02 | Pending | |
| AUTH-LOG-01 | Pending | |
| AUTH-LOG-02 | Pending | |
| AUTH-LOCK-01 | Pending | |
| AUTH-LOCK-02 | Pending | |
| AUTH-OUT-01 | Pending | |
| AUTH-ROLE-01 | Pending | |
| AUTH-ROLE-02 | Pending | |
| AUTH-ROLE-03 | Pending | |
| AUTH-ROLE-04 | Pending | |
| AUTH-PERM-01 | Pending | |
| FUNC-REC-01 | Pending | |
| FUNC-REC-02 | Pending | |
| FUNC-REC-03 | Pending | |
| FUNC-TASK-01 | Pending | |
| FUNC-TASK-02 | Pending | |
| FUNC-TASK-03 | Pending | |
| FUNC-TIME-01 | Pending | |
| FUNC-TIME-02 | Pending | |
| FUNC-START-01 | Pending | |
| FUNC-START-02 | Pending | |
| USER-ADMIN-01 | Pending | |
| USER-ADMIN-02 | Pending | |
| UI-RESP-01 | Pending | |
| UI-THEME-01 | Pending | |
| ERR-FORM-01 | Pending | |
| ERR-MSG-01 | Pending | |
