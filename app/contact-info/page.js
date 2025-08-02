"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function ContactInfoPage() {
  const [contact, setContact] = useState({
    address: '',
    phone: '',
    email: '',
    facebookUrl: '',
    lineUrl: '',
    youtubeUrl: '',
    mapUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'contactInfo', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setContact(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'contactInfo', 'main');
      await setDoc(docRef, contact, { merge: true });
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
      <h1 className="text-3xl font-bold mb-8">จัดการช่องทางการติดต่อ</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">ที่อยู่</label>
          <textarea name="address" value={contact.address || ''} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="phone" value={contact.phone || ''} onChange={handleChange} placeholder="เบอร์โทรศัพท์" className="w-full px-3 py-2 border rounded-lg" />
            <input name="email" value={contact.email || ''} onChange={handleChange} placeholder="อีเมล" className="w-full px-3 py-2 border rounded-lg" />
            <input name="facebookUrl" value={contact.facebookUrl || ''} onChange={handleChange} placeholder="ลิงก์ Facebook" className="w-full px-3 py-2 border rounded-lg" />
            <input name="lineUrl" value={contact.lineUrl || ''} onChange={handleChange} placeholder="ลิงก์ LINE" className="w-full px-3 py-2 border rounded-lg" />
            <input name="youtubeUrl" value={contact.youtubeUrl || ''} onChange={handleChange} placeholder="ลิงก์ YouTube" className="w-full px-3 py-2 border rounded-lg" />
            <input name="mapUrl" value={contact.mapUrl || ''} onChange={handleChange} placeholder="ลิงก์ Google Maps" className="w-full px-3 py-2 border rounded-lg" />
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