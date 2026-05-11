
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "ilearn-a3901.firebaseapp.com",
  projectId: "ilearn-a3901",
  storageBucket: "ilearn-a3901.firebasestorage.app",
  messagingSenderId: "522092105268",
  appId: "1:522092105268:web:26eceeee11b2c0756e8461",
  measurementId: "G-8VYSR9C7JZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}