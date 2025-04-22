// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmT4YFKW8RwHYJkJtUxkPnTHI_XPwQbFY",
  authDomain: "sourdough-bakery-app.firebaseapp.com",
  projectId: "sourdough-bakery-app",
  storageBucket: "sourdough-bakery-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to auth and firestore
const auth = firebase.auth();
const db = firebase.firestore();
