"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function AddUserForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ uid: '', fullName: '', studentId: '', educationLevel: 'ประถม', email: '', teacherId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]); // 1. State ใหม่สำหรับเก็บรายชื่อครู

  // 2. useEffect สำหรับดึงรายชื่อครูทั้งหมด
  useEffect(() => {
    if (isOpen) {
      const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const unsubscribe = onSnapshot(teachersQuery, (snapshot) => {
        const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachers(teacherList);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ uid: '', fullName: '', studentId: '', educationLevel: 'ประถม', email: '', teacherId: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.uid || !formData.email) {
      alert('กรุณากรอก User UID และ อีเมล');
      return;
    }
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', formData.uid);
      await setDoc(userDocRef, {
        fullName: formData.fullName,
        studentId: formData.studentId,
        educationLevel: formData.educationLevel,
        email: formData.email,
        teacherId: formData.teacherId, // เพิ่ม field นี้
        role: 'student', // ผู้ใช้ที่สร้างใหม่จะเป็น student เสมอ
        isAdmin: false,
        isApproved: true,
      });
      alert('เพิ่มข้อมูลผู้ใช้สำเร็จแล้ว');
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
        <h2 className="text-2xl font-bold mb-6">เพิ่มข้อมูลโปรไฟล์ผู้ใช้ใหม่</h2>
        <p className="text-sm text-gray-500 mb-4">
          *หมายเหตุ: คุณต้องสร้างบัญชีล็อกอินใน Firebase Authentication ก่อน แล้วนำ User UID และอีเมลมากรอกที่นี่
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="uid" value={formData.uid} onChange={handleChange} placeholder="User UID (จาก Firebase Auth)" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="อีเมล (ต้องตรงกับใน Auth)" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="ชื่อ-นามสกุล" className="w-full px-3 py-2 border rounded-lg" />
            <input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="รหัสนักศึกษา" className="w-full px-3 py-2 border rounded-lg" />
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">ระดับชั้น</label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="ประถม">ประถม</option>
                <option value="มัธยมต้น">มัธยมต้น</option>
                <option value="มัธยมปลาย">มัธยมปลาย</option>
              </select>
            </div>

            {/* 3. ▼▼▼ เพิ่มช่องเลือกครูที่ปรึกษา ▼▼▼ */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">ครูที่ปรึกษา</label>
              <select name="teacherId" value={formData.teacherId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- ไม่กำหนด --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
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