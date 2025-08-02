"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ActivityForm({ isOpen, onClose, activityToEdit }) {
  const [formData, setFormData] = useState({ title: '', location: '', date: '', mapUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        title: activityToEdit.title || '',
        location: activityToEdit.location || '',
        date: formatDateForInput(activityToEdit.date),
        mapUrl: activityToEdit.mapUrl || '',
      });
    } else {
      setFormData({ title: '', location: '', date: '', mapUrl: '' });
    }
  }, [activityToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      alert('กรุณากรอกชื่อกิจกรรมและวันที่');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        title: formData.title,
        location: formData.location,
        date: Timestamp.fromDate(new Date(formData.date)),
        mapUrl: formData.mapUrl,
      };

      if (activityToEdit) {
        await setDoc(doc(db, 'upcomingActivities', activityToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'upcomingActivities'), dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Error saving document: ", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{activityToEdit ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อกิจกรรม" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="สถานที่" className="w-full px-3 py-2 border rounded-lg" />
            <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
            
            {/* ▼▼▼ ช่องสำหรับใส่ Google Map อยู่ตรงนี้ครับ ▼▼▼ */}
            <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="ลิงก์ Google Maps (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
          
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}