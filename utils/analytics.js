// นำเข้า db (ถอย 1 ชั้นเพื่อไปหา firebaseConfig ที่อยู่หน้าบ้าน)
import { db } from '../firebaseConfig'; 
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

export const logPageView = async (pageName) => {
  try {
    if (!pageName) return;
    const currentYear = new Date().getFullYear(); 
    const docId = `${pageName}_${currentYear}`;
    const statRef = doc(db, "page_stats", docId);

    await setDoc(statRef, {
      page: pageName,
      year: currentYear,
      views: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error logging page view:", error);
  }
};