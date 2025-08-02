"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function SchoolInfoPage() {
  const [info, setInfo] = useState({
    history: '',
    vision: '',
    mission: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'schoolInfo', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setInfo(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'schoolInfo', 'main');
      await setDoc(docRef, info, { merge: true });
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
      <h1 className="text-3xl font-bold mb-8">จัดการข้อมูลสถานศึกษา</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Image URL (สำหรับแสดงในแอป)</label>
          <input name="imageUrl" value={info.imageUrl || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ประวัติความเป็นมา</label>
          <textarea name="history" value={info.history || ''} onChange={handleChange} rows="5" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">วิสัยทัศน์</label>
          <textarea name="vision" value={info.vision || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">พันธกิจ</label>
          <textarea name="mission" value={info.mission || ''} onChange={handleChange} rows="4" className="w-full px-3 py-2 border rounded-lg" />
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