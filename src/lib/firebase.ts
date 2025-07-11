// Firebase configuration and initialization
// This file sets up Firebase services for Authentication, Firestore, and Storage

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration object - values come from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (only once)
// getApps() returns array of existing apps, prevents duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
// These are the main services we'll use throughout the application
export const auth = getAuth(app);           // Authentication service for user login/signup
export const db = getFirestore(app);        // Firestore database for storing user data, projects, submissions
export const storage = getStorage(app);     // Storage service for uploaded documents

// Export the app instance in case we need it elsewhere
export default app;