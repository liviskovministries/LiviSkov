// Firebase configuration that works in both development and production
export const firebaseConfig = {
  projectId: "studio-4321435868-a67c7",
  appId: "1:565211856417:web:dd1fd9f607452161942d60",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDj-4rF1L03O18QLkSowXsleCcrUg3Ib2o",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-4321435868-a67c7.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "565211856417"
};