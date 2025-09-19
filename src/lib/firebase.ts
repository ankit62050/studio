
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-4122177155-98b9f",
  "appId": "1:742445042117:web:8c5f7b53bbe4df323aa3ac",
  "apiKey": "AIzaSyA3lsIhONW5Cr6lRF59gFa-rSRRUtezmso",
  "authDomain": "studio-4122177155-98b9f.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "742445042117"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
