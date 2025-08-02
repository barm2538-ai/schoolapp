"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function EquipmentForm({ isOpen, onClose, itemToEdit }) {
  const [formData, setFormData] = useState({ name: '', code: '', location: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData({ name: '', code: '', location: '' });
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return alert('กรุณากรอกชื่อครุภัณฑ์');
    setIsSubmitting(true);
    try {
      if (itemToEdit) {
        await setDoc(doc(db, 'equipment', itemToEdit.id), formData, { merge: true });
      } else {
        await addDoc(collection(db, 'equipment'), formData);
      }
      onClose();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{itemToEdit ? 'แก้ไขครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อครุภัณฑ์" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="code" value={formData.code} onChange={handleChange} placeholder="รหัสครุภัณฑ์" className="w-full px-3 py-2 border rounded-lg" />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="สถานที่/ห้อง" className="w-full px-3 py-2 border rounded-lg" />
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