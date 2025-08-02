"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function LearningUnitForm({ isOpen, onClose, unitToEdit }) {
  const [formData, setFormData] = useState({ unitName: '', description: '', contactPhone: '', mapUrl: '', imageUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (unitToEdit) {
      setFormData(unitToEdit);
    } else {
      setFormData({ unitName: '', description: '', contactPhone: '', mapUrl: '', imageUrl: '' });
    }
  }, [unitToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.unitName) {
      alert('กรุณากรอกชื่อหน่วยงาน');
      return;
    }
    setIsSubmitting(true);
    try {
      if (unitToEdit) {
        await setDoc(doc(db, 'learningUnits', unitToEdit.id), formData, { merge: true });
      } else {
        await addDoc(collection(db, 'learningUnits'), formData);
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
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{unitToEdit ? 'แก้ไขหน่วยงาน' : 'เพิ่มหน่วยงานใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="unitName" value={formData.unitName} onChange={handleChange} placeholder="ชื่อหน่วยจัดการเรียนรู้" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="คำอธิบาย" className="w-full px-3 py-2 border rounded-lg" rows="3" />
            <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="เบอร์โทรติดต่อ" className="w-full px-3 py-2 border rounded-lg" />
            <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="ลิงก์ Google Maps" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full px-3 py-2 border rounded-lg" />
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