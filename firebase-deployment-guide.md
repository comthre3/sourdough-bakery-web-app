# Firebase Deployment Guide for Sourdough Bakery Web App

This guide provides step-by-step instructions for deploying the Sourdough Bakery Web App to Firebase Hosting.

## Prerequisites

Before you begin, make sure you have the following:

1. Node.js and npm installed on your computer
2. A Firebase account (you can sign up at [firebase.google.com](https://firebase.google.com))
3. Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Build the Application

First, build the React application to generate the production-ready files:

```bash
# Navigate to the project directory
cd sourdough-bakery-web-app

# Install dependencies (if not already installed)
npm install

# Build the application
npm run build
```

This will create a `build` directory with the optimized production build.

## Step 2: Initialize Firebase

If you haven't already set up Firebase for this project, follow these steps:

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project directory
firebase init
```

During initialization:
- Select "Hosting" when prompted for features
- Select "Use an existing project" and choose your Firebase project
- Specify "build" as the public directory
- Configure as a single-page app by answering "yes" to rewrite all URLs to /index.html
- Do not overwrite index.html if asked

## Step 3: Deploy to Firebase

Deploy the application to Firebase Hosting:

```bash
firebase deploy
```

After successful deployment, Firebase will provide a URL where your application is hosted (e.g., https://sourdough-bakery-web-app.web.app).

## Step 4: Configure Firebase Authentication

To enable authentication in your deployed app:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Authentication" in the left sidebar
4. Click on the "Sign-in method" tab
5. Enable the authentication methods you want to use (Email/Password, Google, etc.)
6. For Email/Password, make sure to enable "Email/Password" sign-in method

## Step 5: Configure Firestore Database

To set up the database for your deployed app:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to "Firestore Database" in the left sidebar
4. Click "Create database" if you haven't already
5. Start in production mode or test mode (you can change this later)
6. Choose a location for your database that's closest to your users

## Step 6: Set Up Security Rules

Configure Firestore security rules to protect your data:

1. In the Firebase Console, go to "Firestore Database"
2. Click on the "Rules" tab
3. Update the rules to match the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /recipes/{recipeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /timers/{timerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /starters/{starterId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click "Publish" to apply the rules

## Step 7: Update Firebase Configuration

Make sure your deployed app is using the correct Firebase configuration:

1. Go to the Firebase Console and select your project
2. Click on the gear icon (⚙️) next to "Project Overview" and select "Project settings"
3. Scroll down to "Your apps" section and select your web app
4. Copy the Firebase configuration object
5. Update the `src/firebase/config.ts` file with this configuration
6. Rebuild and redeploy the app:

```bash
npm run build
firebase deploy
```

## Troubleshooting

### Authentication Issues
- Make sure the authentication methods are enabled in the Firebase Console
- Check that the domain of your deployed app is added to the authorized domains list in Authentication settings

### Database Access Issues
- Verify that your security rules are correctly configured
- Check that you're using the correct Firebase project ID

### Deployment Issues
- Make sure you're logged in to the correct Firebase account
- Verify that the build directory is correctly specified in firebase.json
- Check that you have sufficient permissions for the Firebase project

## Updating Your Deployed App

To update your app after making changes:

1. Make your changes to the code
2. Rebuild the app: `npm run build`
3. Deploy the updated build: `firebase deploy`

## Monitoring and Analytics

Firebase provides tools to monitor your application:

1. **Firebase Analytics**: Track user engagement and app usage
2. **Firebase Performance Monitoring**: Monitor app performance
3. **Firebase Crashlytics**: Track and fix app crashes

You can access these tools from the Firebase Console.

## Additional Resources

- [Firebase Hosting documentation](https://firebase.google.com/docs/hosting)
- [Firebase Authentication documentation](https://firebase.google.com/docs/auth)
- [Firestore documentation](https://firebase.google.com/docs/firestore)
