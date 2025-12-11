"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // หรือ '@/firebaseConfig'
import { collection, addDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { FaTimes, FaSave, FaRunning } from 'react-icons/fa';

export default function CompletedActivityForm({ isOpen, onClose, activityToEdit, userId }) {
  const [activityName, setActivityName] = useState('');
  const [hours, setHours] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (activityToEdit) {
            setActivityName(activityToEdit.activityName || '');
            setHours(activityToEdit.hours || '');
            // แปลง Timestamp เป็น YYYY-MM-DD สำหรับ input type="date"
            if (activityToEdit.completedDate) {
                const d = activityToEdit.completedDate.toDate();
                setDateStr(d.toISOString().split('T')[0]);
            } else {
                setDateStr('');
            }
        } else {
            // Reset Form
            setActivityName('');
            setHours('');
            setDateStr(new Date().toISOString().split('T')[0]); // วันนี้
        }
    }
  }, [isOpen, activityToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activityName || !hours || !dateStr) return alert("กรุณากรอกข้อมูลให้ครบ");

    setIsSubmitting(true);
    try {
      const activityDate = new Date(dateStr);
      const data = {
          activityName,
          hours: Number(hours),
          completedDate: Timestamp.fromDate(activityDate),
      };

      if (activityToEdit) {
          await updateDoc(doc(db, 'users', userId, 'completedActivities', activityToEdit.id), {
              ...data, updatedAt: serverTimestamp()
          });
      } else {
          await addDoc(collection(db, 'users', userId, 'completedActivities'), {
              ...data, createdAt: serverTimestamp()
          });
      }
      onClose();
    } catch (error) {
      alert("บันทึกไม่สำเร็จ: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex justify-between items-center">
            <h3 className="font-bold text-pink-800 text-lg flex items-center gap-2">
                <FaRunning /> {activityToEdit ? 'แก้ไขกิจกรรม' : 'บันทึกกิจกรรมใหม่'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อกิจกรรม</label>
                <input type="text" required value={activityName} onChange={(e) => setActivityName(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="เช่น จิตอาสาพัฒนาโรงเรียน" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">วันที่ทำกิจกรรม</label>
                    <input type="date" required value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">จำนวนชั่วโมง</label>
                    <input type="number" required min="1" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 outline-none" placeholder="เช่น 3" />
                </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-bold hover:bg-pink-700 transition mt-4 disabled:bg-gray-400 flex items-center justify-center gap-2">
                <FaSave /> {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
        </form>
      </div>
    </div>
  );
}