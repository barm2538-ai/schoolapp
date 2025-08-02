import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ▼▼▼ ตรวจสอบให้แน่ใจว่าคุณใส่ข้อมูล Config ของคุณครบถ้วนแล้ว ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyAK45jEQGckHHRMSEushgFFrG-9nTgElJA",
  authDomain: "school-app-project-f5479.firebaseapp.com",
  projectId: "school-app-project-f5479",
  storageBucket: "school-app-project-f5479.firebasestorage.app",
  messagingSenderId: "135462508417",
  appId: "1:135462508417:web:085fd507452f8e87d63a80",
  measurementId: "G-55FZ984ZD1"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ▼▼▼ บรรทัดนี้สำคัญที่สุด ต้องมีเพื่อส่งออกตัวแปร ▼▼▼
export { db, auth, storage };