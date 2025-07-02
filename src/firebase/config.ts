// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvNW9olggyLsXCnEdbQwzipSNzodUSt6I",
  authDomain: "ormas-d699d.firebaseapp.com",
  projectId: "ormas-d699d",
  storageBucket: "ormas-d699d.firebasestorage.app",
  messagingSenderId: "437307117600",
  appId: "1:437307117600:web:d2ba5455e9be489c9cec45",
  measurementId: "G-NB1BLLNPJJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

try {
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}