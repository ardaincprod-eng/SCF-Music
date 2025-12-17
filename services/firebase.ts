import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Bu bilgileri Firebase Console'dan aldığın bilgilerle doldurmalısın.
// Not: Güvenlik için gerçek projede bunlar environment variable olarak tutulur.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "scf-music.firebaseapp.com",
  projectId: "scf-music",
  storageBucket: "scf-music.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
