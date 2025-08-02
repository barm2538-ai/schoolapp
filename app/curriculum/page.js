"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function CurriculumPage() {
  const [data, setData] = useState({
    programName: '',
    degree: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // เราจะใช้ Document ID 'computer-engineering' ตามที่เราเคยสร้างไว้
    const docRef = doc(db, 'curriculums', 'computer-engineering');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'curriculums', 'computer-engineering');
      await setDoc(docRef, data, { merge: true });
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
      <h1 className="text-3xl font-bold mb-8">จัดการโครงสร้างหลักสูตร</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">ชื่อหลักสูตร (Program Name)</label>
          <input name="programName" value={data.programName || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ชื่อปริญญา (Degree)</label>
          <input name="degree" value={data.degree || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Image URL (รูปภาพโครงสร้างหลักสูตร)</label>
          <input name="imageUrl" value={data.imageUrl || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">คำอธิบายหลักสูตร</label>
          <textarea name="description" value={data.description || ''} onChange={handleChange} rows="5" className="w-full px-3 py-2 border rounded-lg" />
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