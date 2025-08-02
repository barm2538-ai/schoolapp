"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function AboutPage() {
  const [about, setAbout] = useState({
    developerName: '',
    message: '',
    contactPhone: '',
    facebookUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'aboutDeveloper', 'info');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAbout(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAbout(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'aboutDeveloper', 'info');
      await setDoc(docRef, about, { merge: true });
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (error) {
      console.error("Error updating document: ", error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">จัดการข้อมูลหน้าเกี่ยวกับ</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="developerName" value={about.developerName || ''} onChange={handleChange} placeholder="ชื่อผู้พัฒนา" className="w-full px-3 py-2 border rounded-lg" />
            <input name="contactPhone" value={about.contactPhone || ''} onChange={handleChange} placeholder="เบอร์โทรศัพท์" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ข้อความฝากถึงผู้อ่าน</label>
          <textarea name="message" value={about.message || ''} onChange={handleChange} rows="4" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ลิงก์ Facebook</label>
          <input name="facebookUrl" value={about.facebookUrl || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>
    </div>
  );
}