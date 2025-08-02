"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function FormPageForm({ isOpen, onClose, formToEdit }) {
  const [formData, setFormData] = useState({ formName: '', formUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formToEdit) {
      setFormData({
        formName: formToEdit.formName || '',
        formUrl: formToEdit.formUrl || '',
      });
    } else {
      setFormData({ formName: '', formUrl: '' });
    }
  }, [formToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.formName || !formData.formUrl) {
      alert('กรุณากรอกชื่อและลิงก์ของแบบฟอร์ม');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        createdAt: formToEdit?.createdAt || serverTimestamp(),
      };

      if (formToEdit) {
        await setDoc(doc(db, 'forms', formToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'forms'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{formToEdit ? 'แก้ไขแบบฟอร์ม' : 'เพิ่มแบบฟอร์มใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="formName" value={formData.formName} onChange={handleChange} placeholder="ชื่อแบบฟอร์ม" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="formUrl" value={formData.formUrl} onChange={handleChange} placeholder="ลิงก์ (URL)" className="w-full px-3 py-2 border rounded-lg" required />
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