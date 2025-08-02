"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, Timestamp, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';

const LEAVE_TYPES = [
  'การลาป่วย', 'การลาคลอดบุตร', 'การลาไปช่วยเหลือภริยาที่คลอดบุตร', 'การลากิจส่วนตัว',
  'การลาพักผ่อน', 'การลาอุปสมบทหรือการไปประกอบพิธีฮัจย์', 'การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล',
  'การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน', 'การลาไปปฏิบัติงานในองค์การระหว่างประเทศ',
  'การลาติดตามคู่สมรส', 'การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ'
];

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toISOString().split('T')[0];
};

export default function TeacherLeaveForm({ isOpen, onClose, recordToEdit }) {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    teacherId: '',
    leaveType: LEAVE_TYPES[0],
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubscribe = onSnapshot(teachersQuery, (snapshot) => {
      const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherList);
      if (teacherList.length > 0 && !recordToEdit) {
        setFormData(prev => ({ ...prev, teacherId: teacherList[0].id }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        teacherId: recordToEdit.teacherId,
        leaveType: recordToEdit.leaveType,
        startDate: formatDateForInput(recordToEdit.startDate),
        endDate: formatDateForInput(recordToEdit.endDate),
      });
    } else {
      setFormData(prev => ({ ...prev, leaveType: LEAVE_TYPES[0], startDate: '', endDate: '' }));
    }
  }, [recordToEdit, isOpen]);

  const leaveDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (start > end) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.startDate || !formData.endDate) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
      const dataToSave = {
        leaveType: formData.leaveType,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        endDate: Timestamp.fromDate(new Date(formData.endDate)),
        leaveDays: leaveDays,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.fullName || selectedTeacher.email,
        createdAt: recordToEdit?.createdAt || serverTimestamp(),
      };
      
      if (recordToEdit) {
        await setDoc(doc(db, 'teacherLeaveRecords', recordToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'teacherLeaveRecords'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{recordToEdit ? 'แก้ไขข้อมูลการลา' : 'บันทึกการลาใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">เลือกครู</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" disabled={!!recordToEdit}>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName || t.email}</option>)}
              </select>
            </div>
            <select name="leaveType" value={formData.leaveType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              {LEAVE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">ตั้งแต่วันที่</label>
                <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ถึงวันที่</label>
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
            </div>
            <div className="text-center text-lg font-semibold p-2 bg-gray-100 rounded-md">
              รวมเป็นจำนวน: <span className="text-blue-600">{leaveDays}</span> วัน
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
