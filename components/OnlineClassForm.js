"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function OnlineClassForm({ isOpen, onClose, classToEdit }) {
  const [formData, setFormData] = useState({ subjectName: '', teacherName: '', meetingUrl: '', classTime: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (classToEdit) {
      setFormData(classToEdit);
    } else {
      setFormData({ subjectName: '', teacherName: '', meetingUrl: '', classTime: '' });
    }
  }, [classToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName || !formData.meetingUrl) {
      alert('กรุณากรอกชื่อวิชาและลิงก์ห้องเรียน');
      return;
    }
    setIsSubmitting(true);
    try {
      if (classToEdit) {
        await setDoc(doc(db, 'onlineClasses', classToEdit.id), formData, { merge: true });
      } else {
        await addDoc(collection(db, 'onlineClasses'), formData);
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
        <h2 className="text-2xl font-bold mb-6">{classToEdit ? 'แก้ไขห้องเรียน' : 'เพิ่มห้องเรียนใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="subjectName" value={formData.subjectName} onChange={handleChange} placeholder="ชื่อวิชา" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="teacherName" value={formData.teacherName} onChange={handleChange} placeholder="ชื่อผู้สอน" className="w-full px-3 py-2 border rounded-lg" />
            <input name="classTime" value={formData.classTime} onChange={handleChange} placeholder="เวลาเรียน (เช่น 13:00 - 14:30)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="meetingUrl" value={formData.meetingUrl} onChange={handleChange} placeholder="ลิงก์ห้องเรียน (Zoom, Meet)" className="w-full px-3 py-2 border rounded-lg" required />
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