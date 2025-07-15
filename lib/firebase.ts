import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBRslIPCcqE4q1BVyMCxc8zOzwnqdrsUfA",
  authDomain: "gdg-project-9d306.firebaseapp.com",
  projectId: "gdg-project-9d306",
  storageBucket: "gdg-project-9d306.firebasestorage.app",
  messagingSenderId: "592252682266",
  appId: "1:592252682266:web:fc2df87d16370be79691a3",
  measurementId: "G-7DB5Y794MG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;