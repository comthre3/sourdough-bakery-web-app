# Sourdough Bakery Web App Test Cases

This document contains specific test cases for each component of the Sourdough Bakery Web App. These test cases can be used for manual testing or converted to automated tests when resources allow.

## Authentication Component Test Cases

### Login Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| AUTH-001 | Login form rendering | 1. Navigate to login page | Form displays with email field, password field, login button, forgot password link, and signup link |
| AUTH-002 | Email validation | 1. Enter invalid email format<br>2. Try to submit | Form shows validation error for email field |
| AUTH-003 | Password validation | 1. Leave password field empty<br>2. Try to submit | Form shows validation error for password field |
| AUTH-004 | Invalid credentials | 1. Enter valid email format but incorrect credentials<br>2. Submit form | Error message displays indicating invalid credentials |
| AUTH-005 | Successful login | 1. Enter valid credentials<br>2. Submit form | User is logged in and redirected to dashboard |
| AUTH-006 | Forgot password link | 1. Click "Forgot Password" link | User is navigated to password reset page |
| AUTH-007 | Signup link | 1. Click "Sign Up" link | User is navigated to signup page |

### Signup Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| AUTH-008 | Signup form rendering | 1. Navigate to signup page | Form displays with name fields, email field, password fields, signup button, and login link |
| AUTH-009 | Email validation | 1. Enter invalid email format<br>2. Try to submit | Form shows validation error for email field |
| AUTH-010 | Password validation | 1. Enter password that doesn't meet requirements<br>2. Try to submit | Form shows validation error with password requirements |
| AUTH-011 | Password confirmation | 1. Enter different passwords in password and confirm fields<br>2. Try to submit | Form shows validation error that passwords don't match |
| AUTH-012 | Existing email | 1. Enter email of existing account<br>2. Submit form | Error message displays indicating email already in use |
| AUTH-013 | Successful signup | 1. Enter valid new user information<br>2. Submit form | User account is created, user is logged in and redirected to dashboard |
| AUTH-014 | Login link | 1. Click "Login" link | User is navigated to login page |

### Password Reset Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| AUTH-015 | Reset form rendering | 1. Navigate to password reset page | Form displays with email field, reset button, and back to login link |
| AUTH-016 | Email validation | 1. Enter invalid email format<br>2. Try to submit | Form shows validation error for email field |
| AUTH-017 | Non-existent email | 1. Enter email that doesn't exist in system<br>2. Submit form | Message displays indicating reset instructions sent (for security, same as success) |
| AUTH-018 | Successful reset request | 1. Enter valid email<br>2. Submit form | Success message displays indicating reset instructions sent |
| AUTH-019 | Back to login link | 1. Click "Back to Login" link | User is navigated to login page |

## Recipe Management Test Cases

### Recipe List Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| RECIPE-001 | Recipe list rendering | 1. Navigate to recipes page | List displays with recipe cards showing name, image, and basic info |
| RECIPE-002 | Empty state | 1. Clear all recipes (or use new account)<br>2. Navigate to recipes page | Empty state message displays with option to create first recipe |
| RECIPE-003 | Category filtering | 1. Create recipes with different categories<br>2. Select a category filter | Only recipes in selected category are displayed |
| RECIPE-004 | Search functionality | 1. Create recipes with different names<br>2. Enter search term in search field | Only recipes matching search term are displayed |
| RECIPE-005 | New recipe button | 1. Click "New Recipe" button | User is navigated to recipe form |
| RECIPE-006 | Recipe card navigation | 1. Click on a recipe card | User is navigated to recipe detail page for that recipe |

### Recipe Form Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| RECIPE-007 | Recipe form rendering | 1. Navigate to new recipe page | Form displays with all fields (name, description, category, image URL, etc.) |
| RECIPE-008 | Required field validation | 1. Leave required fields empty<br>2. Try to submit | Form shows validation errors for required fields |
| RECIPE-009 | Add ingredient | 1. Click "Add Ingredient" button<br>2. Fill ingredient details | New ingredient is added to ingredients list |
| RECIPE-010 | Remove ingredient | 1. Add multiple ingredients<br>2. Click remove button on an ingredient | Ingredient is removed from ingredients list |
| RECIPE-011 | Hydration calculation | 1. Add flour and water ingredients<br>2. Set quantities | Hydration percentage is calculated and displayed correctly |
| RECIPE-012 | Add step | 1. Click "Add Step" button<br>2. Fill step details | New step is added to steps list |
| RECIPE-013 | Remove step | 1. Add multiple steps<br>2. Click remove button on a step | Step is removed from steps list |
| RECIPE-014 | Successful creation | 1. Fill all required fields<br>2. Submit form | Recipe is created and user is navigated to recipe detail or list |
| RECIPE-015 | Edit existing recipe | 1. Navigate to edit page for existing recipe<br>2. Modify fields<br>3. Submit form | Recipe is updated with new information |

### Recipe Detail Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| RECIPE-016 | Recipe detail rendering | 1. Navigate to recipe detail page | Page displays with all recipe information (name, description, ingredients, steps, etc.) |
| RECIPE-017 | Edit button | 1. Click "Edit" button | User is navigated to recipe form with pre-filled data |
| RECIPE-018 | Delete button | 1. Click "Delete" button | Confirmation dialog appears |
| RECIPE-019 | Confirm deletion | 1. Click "Delete" button<br>2. Confirm deletion | Recipe is deleted and user is navigated to recipe list |
| RECIPE-020 | Recipe scaling | 1. Change scaling factor<br>2. Click "Scale" button | Ingredient quantities are updated according to scaling factor |
| RECIPE-021 | Create timer from step | 1. Click timer icon next to a step | Timer creation dialog appears with pre-filled duration |
| RECIPE-022 | Confirm timer creation | 1. Click timer icon next to a step<br>2. Confirm timer creation | Timer is created and user is notified |

## Task Management Test Cases

### Task List Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| TASK-001 | Task list rendering | 1. Navigate to tasks page | List displays with task items showing title, status, due date, and priority |
| TASK-002 | Empty state | 1. Clear all tasks (or use new account)<br>2. Navigate to tasks page | Empty state message displays with option to create first task |
| TASK-003 | Status filtering | 1. Create tasks with different statuses<br>2. Select a status filter | Only tasks with selected status are displayed |
| TASK-004 | Priority filtering | 1. Create tasks with different priorities<br>2. Select a priority filter | Only tasks with selected priority are displayed |
| TASK-005 | Due date sorting | 1. Create tasks with different due dates<br>2. Sort by due date | Tasks are displayed in order of due date |
| TASK-006 | Search functionality | 1. Create tasks with different titles<br>2. Enter search term in search field | Only tasks matching search term are displayed |
| TASK-007 | New task button | 1. Click "New Task" button | User is navigated to task form |
| TASK-008 | Task item navigation | 1. Click on a task item | User is navigated to task detail page for that task |

### Task Form Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| TASK-009 | Task form rendering | 1. Navigate to new task page | Form displays with all fields (title, description, status, priority, due date, etc.) |
| TASK-010 | Required field validation | 1. Leave required fields empty<br>2. Try to submit | Form shows validation errors for required fields |
| TASK-011 | Due date picker | 1. Click due date field | Date picker appears and allows date selection |
| TASK-012 | Related recipe selection | 1. Click related recipe field | Dropdown of available recipes appears |
| TASK-013 | Successful creation | 1. Fill all required fields<br>2. Submit form | Task is created and user is navigated to task detail or list |
| TASK-014 | Edit existing task | 1. Navigate to edit page for existing task<br>2. Modify fields<br>3. Submit form | Task is updated with new information |

### Task Detail Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| TASK-015 | Task detail rendering | 1. Navigate to task detail page | Page displays with all task information (title, description, status, priority, due date, etc.) |
| TASK-016 | Edit button | 1. Click "Edit" button | User is navigated to task form with pre-filled data |
| TASK-017 | Delete button | 1. Click "Delete" button | Confirmation dialog appears |
| TASK-018 | Confirm deletion | 1. Click "Delete" button<br>2. Confirm deletion | Task is deleted and user is navigated to task list |
| TASK-019 | Status update | 1. Change status dropdown<br>2. Save changes | Task status is updated and reflected in UI |
| TASK-020 | Related recipe link | 1. Click on related recipe link | User is navigated to detail page for related recipe |

## Timer System Test Cases

### Timer List Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| TIMER-001 | Timer list rendering | 1. Navigate to timers page | List displays with timer items showing name, duration, status, and controls |
| TIMER-002 | Empty state | 1. Clear all timers (or use new account)<br>2. Navigate to timers page | Empty state message displays with option to create first timer |
| TIMER-003 | New timer button | 1. Click "New Timer" button | User is navigated to timer form |
| TIMER-004 | Start timer | 1. Click "Start" button on an idle timer | Timer starts counting down and status changes to "Running" |
| TIMER-005 | Pause timer | 1. Start a timer<br>2. Click "Pause" button | Timer stops counting down and status changes to "Paused" |
| TIMER-006 | Resume timer | 1. Pause a timer<br>2. Click "Resume" button | Timer continues counting down and status changes to "Running" |
| TIMER-007 | Reset timer | 1. Start or pause a timer<br>2. Click "Reset" button | Timer returns to initial state with status "Idle" |
| TIMER-008 | Timer completion | 1. Start a timer with short duration<br>2. Wait for timer to complete | Timer status changes to "Completed" and notification appears |
| TIMER-009 | Use timer preset | 1. Create a timer preset<br>2. Click on preset in preset list | New timer is created with preset values |

### Timer Form Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| TIMER-010 | Timer form rendering | 1. Navigate to new timer page | Form displays with all fields (name, hours, minutes, seconds, related recipe) |
| TIMER-011 | Required field validation | 1. Leave required fields empty<br>2. Try to submit | Form shows validation errors for required fields |
| TIMER-012 | Time input validation | 1. Enter invalid time (e.g., 90 minutes)<br>2. Try to submit | Form shows validation error for time fields |
| TIMER-013 | Save as preset option | 1. Check "Save as preset" checkbox | Additional preset name field appears |
| TIMER-014 | Successful timer creation | 1. Fill all required fields<br>2. Submit form | Timer is created and user is navigated to timer list |
| TIMER-015 | Successful preset creation | 1. Fill all required fields<br>2. Check "Save as preset"<br>3. Enter preset name<br>4. Submit form | Timer and preset are created and user is navigated to timer list |

## Starter Management Test Cases

### Starter List Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| STARTER-001 | Starter list rendering | 1. Navigate to starters page | List displays with starter cards showing name, status, and feeding indicator |
| STARTER-002 | Empty state | 1. Clear all starters (or use new account)<br>2. Navigate to starters page | Empty state message displays with option to create first starter |
| STARTER-003 | Status filtering | 1. Create starters with different statuses<br>2. Select a status filter | Only starters with selected status are displayed |
| STARTER-004 | Search functionality | 1. Create starters with different names<br>2. Enter search term in search field | Only starters matching search term are displayed |
| STARTER-005 | New starter button | 1. Click "New Starter" button | User is navigated to starter form |
| STARTER-006 | Starter card navigation | 1. Click on a starter card | User is navigated to starter detail page for that starter |
| STARTER-007 | Quick feed button | 1. Click "Feed" button on a starter card | Quick feeding dialog appears |
| STARTER-008 | Confirm quick feeding | 1. Click "Feed" button on a starter card<br>2. Confirm feeding | Feeding is recorded and feeding indicator updates |

### Starter Form Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| STARTER-009 | Starter form rendering | 1. Navigate to new starter page | Form displays with all fields (name, description, flour type, hydration, etc.) |
| STARTER-010 | Required field validation | 1. Leave required fields empty<br>2. Try to submit | Form shows validation errors for required fields |
| STARTER-011 | Feeding schedule selection | 1. Select different feeding frequency options | Appropriate schedule options appear based on selection |
| STARTER-012 | Hydration input | 1. Enter hydration percentage | Value is validated and accepted |
| STARTER-013 | Successful creation | 1. Fill all required fields<br>2. Submit form | Starter is created and user is navigated to starter detail or list |
| STARTER-014 | Edit existing starter | 1. Navigate to edit page for existing starter<br>2. Modify fields<br>3. Submit form | Starter is updated with new information |

### Starter Detail Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| STARTER-015 | Starter detail rendering | 1. Navigate to starter detail page | Page displays with all starter information and feeding history |
| STARTER-016 | Edit button | 1. Click "Edit" button | User is navigated to starter form with pre-filled data |
| STARTER-017 | Delete button | 1. Click "Delete" button | Confirmation dialog appears |
| STARTER-018 | Confirm deletion | 1. Click "Delete" button<br>2. Confirm deletion | Starter is deleted and user is navigated to starter list |
| STARTER-019 | Record feeding button | 1. Click "Record Feeding" button | Feeding form dialog appears |
| STARTER-020 | Submit feeding record | 1. Click "Record Feeding" button<br>2. Fill feeding details<br>3. Submit form | Feeding is recorded and appears in feeding history |
| STARTER-021 | Change starter status | 1. Change status dropdown<br>2. Save changes | Starter status is updated and reflected in UI |
| STARTER-022 | Feeding history display | 1. Record multiple feedings<br>2. View starter detail | Feeding history displays all feedings in chronological order |

## Settings Test Cases

### Settings Page Component

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| SETTINGS-001 | Settings page rendering | 1. Navigate to settings page | Page displays with all settings sections (theme, notifications, recipe defaults, etc.) |
| SETTINGS-002 | Theme selection | 1. Click on different theme options | Selected theme is highlighted |
| SETTINGS-003 | Notification toggles | 1. Toggle notification switches | Switches change state |
| SETTINGS-004 | Reminder lead time slider | 1. Move reminder lead time slider | Value updates as slider moves |
| SETTINGS-005 | Default hydration slider | 1. Move default hydration slider | Value updates as slider moves |
| SETTINGS-006 | Unit system selection | 1. Click on different unit system options | Selected unit system is highlighted |
| SETTINGS-007 | Bakery information fields | 1. Enter text in bakery name and logo URL fields | Text is accepted in fields |
| SETTINGS-008 | Save settings | 1. Make changes to various settings<br>2. Click "Save Settings" button | Success message appears and changes are saved |
| SETTINGS-009 | Settings persistence | 1. Save settings changes<br>2. Navigate away from settings<br>3. Return to settings page | Previously saved settings are still displayed |
| SETTINGS-010 | Theme application | 1. Change theme setting<br>2. Save settings | Theme is applied to entire application |

## Integration Test Cases

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| INT-001 | Recipe to timer integration | 1. Create a recipe with steps<br>2. Navigate to recipe detail<br>3. Click timer icon on a step<br>4. Confirm timer creation | Timer is created with correct duration and recipe reference |
| INT-002 | Recipe to task integration | 1. Create a recipe<br>2. Create a task and select the recipe as related<br>3. Navigate to task detail | Task shows correct recipe reference with link |
| INT-003 | Starter to timer integration | 1. Create a starter with feeding schedule<br>2. Enable feeding reminders in settings<br>3. Wait for feeding time | Reminder notification appears at appropriate time |
| INT-004 | Authentication state persistence | 1. Log in to application<br>2. Refresh page | User remains logged in and can access protected routes |
| INT-005 | Settings affect recipe defaults | 1. Change default hydration in settings<br>2. Save settings<br>3. Create new recipe | New recipe form shows default hydration from settings |
| INT-006 | Settings affect unit display | 1. Change unit system in settings<br>2. Save settings<br>3. View recipe with ingredients | Ingredient quantities are displayed in selected unit system |

## Responsive Design Test Cases

| Test ID | Test Case | Test Steps | Expected Result |
|---------|-----------|------------|-----------------|
| RESP-001 | Desktop layout | 1. Open application on desktop (1920x1080)<br>2. Navigate through main pages | All elements are properly sized and positioned |
| RESP-002 | Tablet layout | 1. Open application on tablet or resize to tablet dimensions (768x1024)<br>2. Navigate through main pages | Layout adapts to tablet size with appropriate adjustments |
| RESP-003 | Mobile layout | 1. Open application on mobile or resize to mobile dimensions (375x667)<br>2. Navigate through main pages | Layout adapts to mobile size with stacked elements and mobile navigation |
| RESP-004 | Navigation menu | 1. Resize browser from desktop to mobile size | Navigation transitions from horizontal menu to hamburger menu |
| RESP-005 | Form inputs on mobile | 1. Open a form on mobile device or small viewport<br>2. Interact with form inputs | Inputs are properly sized and usable on touch devices |
| RESP-006 | Tables and lists on mobile | 1. View recipe list or task list on mobile device<br>2. Scroll through items | Lists adapt to smaller screen with appropriate formatting |

These test cases provide a comprehensive framework for testing the Sourdough Bakery Web App. They can be used for manual testing or converted to automated tests when resources allow.
