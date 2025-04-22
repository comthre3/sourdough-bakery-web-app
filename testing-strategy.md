# Sourdough Bakery Web App Testing Strategy

This document outlines the testing strategy for the Sourdough Bakery Web App, including test cases for each major component and manual testing procedures.

## Table of Contents
1. [Authentication Testing](#authentication-testing)
2. [Recipe Management Testing](#recipe-management-testing)
3. [Task Management Testing](#task-management-testing)
4. [Timer System Testing](#timer-system-testing)
5. [Starter Management Testing](#starter-management-testing)
6. [Settings Testing](#settings-testing)
7. [Integration Testing](#integration-testing)
8. [Cross-Browser Testing](#cross-browser-testing)
9. [Responsive Design Testing](#responsive-design-testing)

## Authentication Testing

### Unit Tests for Authentication Components

#### Login Component
- Test that the login form renders correctly with email and password fields
- Test form validation (empty fields, invalid email format)
- Test error handling for incorrect credentials
- Test successful login redirects to dashboard
- Test "Forgot Password" link navigates to password reset page
- Test "Sign Up" link navigates to signup page

#### Signup Component
- Test that the signup form renders correctly with all required fields
- Test form validation (empty fields, invalid email, password requirements)
- Test error handling for existing email
- Test successful signup creates a new user and redirects to dashboard
- Test "Login" link navigates to login page

#### Password Reset Component
- Test that the password reset form renders correctly
- Test form validation for email field
- Test error handling for non-existent email
- Test successful password reset request shows confirmation message
- Test "Back to Login" link navigates to login page

#### Protected Route Component
- Test that unauthenticated users are redirected to login page
- Test that authenticated users can access protected routes
- Test that loading state is displayed while authentication state is being determined

### Integration Tests for Authentication

- Test the complete login flow from login page to dashboard
- Test the complete signup flow from signup page to dashboard
- Test the complete password reset flow
- Test that authentication state persists across page refreshes
- Test that logout functionality works correctly

### Manual Testing Procedures for Authentication

1. **Login Testing**
   - Open the app and navigate to the login page
   - Try logging in with invalid credentials and verify error messages
   - Try logging in with valid credentials and verify successful login
   - Verify that protected routes are accessible after login
   - Test "Remember Me" functionality if implemented

2. **Signup Testing**
   - Navigate to the signup page
   - Try creating an account with invalid information and verify error messages
   - Create a new account with valid information and verify successful account creation
   - Verify that the new account can be used to log in

3. **Password Reset Testing**
   - Navigate to the password reset page
   - Request a password reset for an existing email
   - Verify that a confirmation message is displayed
   - (If possible) Check that a reset email is sent
   - (If possible) Test the complete password reset flow using the reset link

4. **Authentication State Testing**
   - Log in to the app
   - Refresh the page and verify that the authentication state persists
   - Navigate to different protected routes and verify access
   - Log out and verify that protected routes are no longer accessible

## Recipe Management Testing

### Unit Tests for Recipe Components

#### RecipeList Component
- Test that the recipe list renders correctly with recipe cards
- Test that filtering and sorting functionality works correctly
- Test that search functionality works correctly
- Test that "New Recipe" button navigates to recipe form
- Test that clicking on a recipe card navigates to recipe detail page

#### RecipeForm Component
- Test that the recipe form renders correctly with all fields
- Test form validation for required fields
- Test ingredient management (adding, editing, removing ingredients)
- Test step management (adding, editing, removing steps)
- Test hydration calculation functionality
- Test error handling for form submission
- Test successful form submission creates/updates a recipe

#### RecipeDetail Component
- Test that the recipe detail page renders correctly with all recipe information
- Test that editing a recipe navigates to recipe form with pre-filled data
- Test that deleting a recipe shows confirmation dialog
- Test that recipe scaling functionality works correctly
- Test that timer creation from recipe steps works correctly

### Integration Tests for Recipe Management

- Test the complete flow of creating, viewing, editing, and deleting a recipe
- Test that recipe data persists across page refreshes
- Test that recipe hydration calculations are consistent across components
- Test that recipe scaling affects all ingredient quantities correctly

### Manual Testing Procedures for Recipe Management

1. **Recipe Creation Testing**
   - Navigate to the recipes page
   - Click "New Recipe" button
   - Fill out all recipe fields including ingredients and steps
   - Verify that hydration percentage is calculated correctly
   - Save the recipe and verify it appears in the recipe list

2. **Recipe Viewing Testing**
   - Select a recipe from the recipe list
   - Verify that all recipe details are displayed correctly
   - Test recipe scaling functionality and verify ingredient quantities update
   - Test creating a timer from a recipe step

3. **Recipe Editing Testing**
   - Select a recipe and click the edit button
   - Modify various fields including ingredients and steps
   - Save changes and verify they are reflected in the recipe detail view

4. **Recipe Deletion Testing**
   - Select a recipe and click the delete button
   - Confirm deletion in the dialog
   - Verify that the recipe is removed from the recipe list

5. **Recipe Filtering and Searching Testing**
   - Add multiple recipes with different categories and tags
   - Test filtering by category and verify results
   - Test searching by recipe name and verify results

## Task Management Testing

### Unit Tests for Task Components

#### TaskList Component
- Test that the task list renders correctly with task items
- Test that filtering by status works correctly
- Test that sorting by due date works correctly
- Test that search functionality works correctly
- Test that "New Task" button navigates to task form

#### TaskForm Component
- Test that the task form renders correctly with all fields
- Test form validation for required fields
- Test date picker functionality for due date
- Test error handling for form submission
- Test successful form submission creates/updates a task

#### TaskDetail Component
- Test that the task detail page renders correctly with all task information
- Test that editing a task navigates to task form with pre-filled data
- Test that marking a task as complete updates its status
- Test that deleting a task shows confirmation dialog

### Integration Tests for Task Management

- Test the complete flow of creating, viewing, editing, and completing a task
- Test that task data persists across page refreshes
- Test that task status updates are reflected in the task list
- Test that task filtering works correctly with different status values

### Manual Testing Procedures for Task Management

1. **Task Creation Testing**
   - Navigate to the tasks page
   - Click "New Task" button
   - Fill out all task fields including title, description, due date, and priority
   - Save the task and verify it appears in the task list

2. **Task Viewing Testing**
   - Select a task from the task list
   - Verify that all task details are displayed correctly

3. **Task Status Update Testing**
   - Select a task and change its status (e.g., from "To Do" to "In Progress")
   - Verify that the status change is reflected in both the detail view and task list
   - Test marking a task as complete and verify status update

4. **Task Editing Testing**
   - Select a task and click the edit button
   - Modify various fields including title, description, due date, and priority
   - Save changes and verify they are reflected in the task detail view

5. **Task Filtering Testing**
   - Create multiple tasks with different statuses
   - Test filtering by status and verify results
   - Test filtering by priority and verify results
   - Test filtering by due date and verify results

## Timer System Testing

### Unit Tests for Timer Components

#### TimerList Component
- Test that the timer list renders correctly with timer items
- Test that active timers show countdown functionality
- Test that timer controls (start, pause, resume, reset) work correctly
- Test that "New Timer" button navigates to timer form
- Test that timer presets can be selected and started

#### TimerForm Component
- Test that the timer form renders correctly with all fields
- Test form validation for required fields
- Test time input validation
- Test error handling for form submission
- Test successful form submission creates/updates a timer or preset

### Integration Tests for Timer System

- Test the complete flow of creating, starting, pausing, resuming, and completing a timer
- Test that timer data persists across page refreshes
- Test that active timers continue counting down after page refresh
- Test that timer notifications work correctly when a timer completes

### Manual Testing Procedures for Timer System

1. **Timer Creation Testing**
   - Navigate to the timers page
   - Click "New Timer" button
   - Fill out all timer fields including name, duration, and related recipe
   - Save the timer and verify it appears in the timer list

2. **Timer Control Testing**
   - Select a timer from the timer list
   - Test starting the timer and verify countdown begins
   - Test pausing the timer and verify countdown stops
   - Test resuming the timer and verify countdown continues
   - Test resetting the timer and verify it returns to initial state

3. **Timer Preset Testing**
   - Create a timer preset with specific duration and settings
   - Start a new timer from the preset
   - Verify that all preset settings are applied to the new timer

4. **Timer Notification Testing**
   - Start a timer with a short duration
   - Allow the timer to complete
   - Verify that a notification is displayed when the timer completes

## Starter Management Testing

### Unit Tests for Starter Components

#### StarterList Component
- Test that the starter list renders correctly with starter cards
- Test that filtering by status works correctly
- Test that search functionality works correctly
- Test that "New Starter" button navigates to starter form
- Test that feeding status indicators show correct status

#### StarterForm Component
- Test that the starter form renders correctly with all fields
- Test form validation for required fields
- Test feeding schedule configuration
- Test error handling for form submission
- Test successful form submission creates/updates a starter

#### StarterDetail Component
- Test that the starter detail page renders correctly with all starter information
- Test that editing a starter navigates to starter form with pre-filled data
- Test that feeding history is displayed correctly
- Test that recording a new feeding updates the feeding history
- Test that changing starter status works correctly

### Integration Tests for Starter Management

- Test the complete flow of creating, viewing, editing, and managing a starter
- Test that starter data persists across page refreshes
- Test that feeding records are correctly associated with starters
- Test that feeding status calculations are accurate based on feeding schedule

### Manual Testing Procedures for Starter Management

1. **Starter Creation Testing**
   - Navigate to the starters page
   - Click "New Starter" button
   - Fill out all starter fields including name, description, hydration, and feeding schedule
   - Save the starter and verify it appears in the starter list

2. **Starter Viewing Testing**
   - Select a starter from the starter list
   - Verify that all starter details are displayed correctly
   - Verify that feeding status is calculated correctly based on last feeding date

3. **Feeding Record Testing**
   - Select a starter and click "Record Feeding"
   - Fill out feeding details including flour type, amounts, and activity rating
   - Save the feeding record and verify it appears in the feeding history
   - Verify that the last feeding date is updated
   - Verify that the feeding status is recalculated

4. **Starter Status Testing**
   - Select a starter and change its status (e.g., from "Active" to "Dormant")
   - Verify that the status change is reflected in both the detail view and starter list

## Settings Testing

### Unit Tests for Settings Components

#### SettingsPage Component
- Test that the settings page renders correctly with all sections
- Test that theme selection controls work correctly
- Test that notification settings can be toggled
- Test that default hydration slider works correctly
- Test that unit system selection works correctly
- Test that bakery information fields work correctly
- Test that saving settings shows success message

### Integration Tests for Settings

- Test that settings changes persist across page refreshes
- Test that theme changes are applied to the entire application
- Test that notification settings affect notification behavior
- Test that default hydration setting is applied to new recipes

### Manual Testing Procedures for Settings

1. **Theme Settings Testing**
   - Navigate to the settings page
   - Change the theme setting (Light, Dark, System)
   - Verify that the theme change is applied to the application
   - Refresh the page and verify that the theme setting persists

2. **Notification Settings Testing**
   - Toggle various notification settings
   - Save changes and verify they persist
   - Test that notification behavior matches the settings

3. **Recipe Defaults Testing**
   - Change the default hydration percentage
   - Save changes and navigate to create a new recipe
   - Verify that the new recipe uses the default hydration percentage

4. **Unit System Testing**
   - Change the unit system setting
   - Save changes and navigate to create a new recipe
   - Verify that the new recipe uses the selected unit system

5. **Bakery Information Testing**
   - Enter bakery name and logo URL
   - Save changes and verify that the information is displayed in the application

## Integration Testing

### Cross-Feature Integration Tests

- Test recipe to timer integration (creating a timer from a recipe step)
- Test recipe to task integration (creating a task related to a recipe)
- Test starter to timer integration (setting feeding reminders)
- Test that authentication state affects access to all features
- Test that settings affect behavior across all features

### Manual Integration Testing Procedures

1. **Recipe-Timer Integration Testing**
   - Create a recipe with multiple steps
   - Create a timer from a recipe step
   - Verify that the timer is created with the correct duration and recipe reference
   - Start the timer and verify countdown functionality

2. **Recipe-Task Integration Testing**
   - Create a recipe
   - Create a task related to the recipe
   - Verify that the task shows the recipe reference
   - Navigate from the task to the related recipe

3. **Starter-Timer Integration Testing**
   - Create a starter with a feeding schedule
   - Set up feeding reminders
   - Verify that reminders are triggered according to the feeding schedule

4. **Authentication-Feature Integration Testing**
   - Log out of the application
   - Attempt to access protected features and verify redirection to login
   - Log in and verify access to all features
   - Verify that user-specific data is displayed correctly

## Cross-Browser Testing

### Browser Compatibility Test Cases

- Test the application in Chrome
- Test the application in Firefox
- Test the application in Safari
- Test the application in Edge
- Test the application in mobile browsers (Chrome for Android, Safari for iOS)

### Manual Cross-Browser Testing Procedures

1. **Visual Consistency Testing**
   - Open the application in different browsers
   - Verify that layouts, fonts, colors, and spacing are consistent
   - Check that all UI elements are properly aligned and sized

2. **Functionality Testing**
   - Test core features in each browser
   - Verify that all interactive elements work correctly
   - Test form submissions and data persistence

3. **Performance Testing**
   - Assess loading times in different browsers
   - Check for any browser-specific performance issues
   - Test animations and transitions for smoothness

## Responsive Design Testing

### Responsive Design Test Cases

- Test the application on desktop (1920x1080, 1366x768)
- Test the application on tablet (iPad: 768x1024)
- Test the application on mobile (iPhone: 375x667, Android: 360x640)
- Test the application with different window sizes and orientations

### Manual Responsive Design Testing Procedures

1. **Layout Testing**
   - Resize the browser window to different dimensions
   - Verify that layouts adapt appropriately to different screen sizes
   - Check that content is readable and accessible at all sizes

2. **Navigation Testing**
   - Test the navigation menu on different screen sizes
   - Verify that mobile navigation (hamburger menu) works correctly
   - Check that all pages are accessible on all devices

3. **Input Testing**
   - Test form inputs on touch devices
   - Verify that touch interactions work correctly
   - Check that virtual keyboards don't obscure important content

## Conclusion

This testing strategy provides a comprehensive approach to testing the Sourdough Bakery Web App. By following these test cases and manual testing procedures, we can ensure that the application functions correctly across all features and environments.

When implementing automated tests, these test cases can be converted into automated test scripts using testing libraries like Jest and React Testing Library.
