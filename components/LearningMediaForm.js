"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LearningMediaForm({ isOpen, onClose, mediaToEdit }) {
  const [formData, setFormData] = useState({ title: '', url: '', type: 'วิดีโอ' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mediaToEdit) {
      setFormData({
        title: mediaToEdit.title || '',
        url: mediaToEdit.url || '',
        type: mediaToEdit.type || 'วิดีโอ',
      });
    } else {
      setFormData({ title: '', url: '', type: 'วิดีโอ' });
    }
  }, [mediaToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) {
      alert('กรุณากรอกชื่อและลิงก์ของสื่อการเรียนรู้');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        createdAt: mediaToEdit?.createdAt || serverTimestamp(),
      };

      if (mediaToEdit) {
        await setDoc(doc(db, 'learningMedia', mediaToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'learningMedia'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{mediaToEdit ? 'แก้ไขสื่อการเรียนรู้' : 'เพิ่มสื่อการเรียนรู้ใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อสื่อการเรียนรู้" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="url" value={formData.url} onChange={handleChange} placeholder="ลิงก์ (URL)" className="w-full px-3 py-2 border rounded-lg" required />
            <div>
              <label className="block text-gray-700 font-medium mb-2">ประเภท</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="วิดีโอ">วิดีโอ</option>
                <option value="เอกสาร">เอกสาร</option>
                <option value="สไลด์">สไลด์</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
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