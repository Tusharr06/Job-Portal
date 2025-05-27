import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALy_Q037dAPYxtBxWdLT_0Q5VxeTtHFB4",
  authDomain: "dbms-miniproject-50f72.firebaseapp.com",
  projectId: "dbms-miniproject-50f72",
  storageBucket: "dbms-miniproject-50f72.firebasestorage.app",
  messagingSenderId: "1031200676098",
  appId: "1:1031200676098:web:3b46d66d6488509e9eca1b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);