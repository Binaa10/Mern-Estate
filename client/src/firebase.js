// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-e46b2.firebaseapp.com",
  projectId: "mern-estate-e46b2",
  storageBucket: "mern-estate-e46b2.firebasestorage.app",
  messagingSenderId: "533405330645",
  appId: "1:533405330645:web:d2e0e4a3d5a669dceec65c",
  measurementId: "G-EL2C8XGWG5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
