import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCrBznc7GwQhXwQpS3qpLk3tCUhIQKnTLg",
  authDomain: "cis371-a2b0d.firebaseapp.com",
  projectId: "cis371-a2b0d",
  storageBucket: "cis371-a2b0d.firebasestorage.app",
  messagingSenderId: "273703238164",
  appId: "1:273703238164:web:6a053b1d21b7de5309c501"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { auth };
export default db;
