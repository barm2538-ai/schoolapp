"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function ExamForm({ isOpen, onClose, examToEdit }) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        title: examToEdit.title || '',
        description: examToEdit.description || '',
      });
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [examToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('กรุณากรอกชื่อชุดข้อสอบ');
      return;
    }
    setIsSubmitting(true);
    try {
      if (examToEdit) {
        await setDoc(doc(db, 'exams', examToEdit.id), formData, { merge: true });
      } else {
        await addDoc(collection(db, 'exams'), formData);
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
        <h2 className="text-2xl font-bold mb-6">{examToEdit ? 'แก้ไขชุดข้อสอบ' : 'เพิ่มชุดข้อสอบใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อชุดข้อสอบ" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="คำอธิบาย" className="w-full px-3 py-2 border rounded-lg" rows="3" />
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