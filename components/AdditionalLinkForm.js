"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdditionalLinkForm({ isOpen, onClose, linkToEdit }) {
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (linkToEdit) {
      setFormData({
        title: linkToEdit.title || '',
        url: linkToEdit.url || '',
      });
    } else {
      setFormData({ title: '', url: '' });
    }
  }, [linkToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        createdAt: linkToEdit?.createdAt || serverTimestamp(),
      };

      if (linkToEdit) {
        await setDoc(doc(db, 'additionalLinks', linkToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'additionalLinks'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{linkToEdit ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="หัวข้อ" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="url" value={formData.url} onChange={handleChange} placeholder="ลิงก์ (URL)" className="w-full px-3 py-2 border rounded-lg" required />
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