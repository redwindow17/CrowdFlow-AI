import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "crwflow-ai-6971",
  appId: "1:183144852197:web:810377d23b5238eb14c20c",
  storageBucket: "crwflow-ai-6971.firebasestorage.app",
  apiKey: "AIzaSyDq1XymRXbXYn3gNVemYaobnXILh_B34mc",
  authDomain: "crwflow-ai-6971.firebaseapp.com",
  messagingSenderId: "183144852197",
  projectNumber: "183144852197",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
