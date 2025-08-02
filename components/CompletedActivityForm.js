"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // <-- แก้ไข path ตรงนี้
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CompletedActivityForm({ isOpen, onClose, activityToEdit, userId }) {
  const [formData, setFormData] = useState({ activityName: '', hours: 0, completedDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        activityName: activityToEdit.activityName || '',
        hours: activityToEdit.hours || 0,
        completedDate: formatDateForInput(activityToEdit.completedDate),
      });
    } else {
      setFormData({ activityName: '', hours: 0, completedDate: '' });
    }
  }, [activityToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'hours' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activityName || !formData.completedDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        activityName: formData.activityName,
        hours: formData.hours,
        completedDate: Timestamp.fromDate(new Date(formData.completedDate)),
      };
      const collectionRef = collection(db, 'users', userId, 'completedActivities');

      if (activityToEdit) {
        await setDoc(doc(collectionRef, activityToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collectionRef, dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{activityToEdit ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="activityName" value={formData.activityName} onChange={handleChange} placeholder="ชื่อกิจกรรม" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="hours" type="number" value={formData.hours} onChange={handleChange} placeholder="จำนวนชั่วโมง" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="completedDate" type="date" value={formData.completedDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
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