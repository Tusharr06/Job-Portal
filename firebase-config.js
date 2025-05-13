// Firebase configuration
const firebaseConfig = {
    // Add your Firebase credentials here
    // These should be replaced with your actual Firebase project credentials
     apiKey: "AIzaSyALy_Q037dAPYxtBxWdLT_0Q5VxeTtHFB4",
  authDomain: "dbms-miniproject-50f72.firebaseapp.com",
  projectId: "dbms-miniproject-50f72",
  storageBucket: "dbms-miniproject-50f72.firebasestorage.app",
  messagingSenderId: "1031200676098",
  appId: "1:1031200676098:web:3b46d66d6488509e9eca1b",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Reference to collections
const booksCollection = db.collection('books');
const jobsCollection = db.collection('jobs');
const applicationsCollection = db.collection('applications');