"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SurveyForm({ isOpen, onClose, surveyToEdit }) {
  const [formData, setFormData] = useState({ title: '', externalUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (surveyToEdit) {
      setFormData({
        title: surveyToEdit.title || '',
        externalUrl: surveyToEdit.externalUrl || '',
      });
    } else {
      setFormData({ title: '', externalUrl: '' });
    }
  }, [surveyToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.externalUrl) {
      alert('กรุณากรอกชื่อและลิงก์ของแบบประเมิน');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        createdAt: surveyToEdit?.createdAt || serverTimestamp(),
      };

      if (surveyToEdit) {
        await setDoc(doc(db, 'surveys', surveyToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'surveys'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{surveyToEdit ? 'แก้ไขแบบประเมิน' : 'เพิ่มแบบประเมินใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อแบบประเมิน" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="externalUrl" value={formData.externalUrl} onChange={handleChange} placeholder="ลิงก์ (URL)" className="w-full px-3 py-2 border rounded-lg" required />
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