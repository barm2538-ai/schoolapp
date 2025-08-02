"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function UserForm({ isOpen, onClose, userToEdit }) {
  const [formData, setFormData] = useState({ fullName: '', studentId: '', educationLevel: '', role: 'student', teacherId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState([]); // 1. State ใหม่สำหรับเก็บรายชื่อครู

  // 2. useEffect สำหรับดึงรายชื่อครูทั้งหมด
  useEffect(() => {
    const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const unsubscribe = onSnapshot(teachersQuery, (snapshot) => {
      const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherList);
    });
    return () => unsubscribe(); // Cleanup listener
  }, []);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName || '',
        studentId: userToEdit.studentId || '',
        educationLevel: userToEdit.educationLevel || 'ประถม',
        role: userToEdit.role || 'student',
        teacherId: userToEdit.teacherId || '', // เพิ่ม teacherId
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'users', userToEdit.id);
      await setDoc(docRef, formData, { merge: true });
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
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
        <h2 className="text-2xl font-bold mb-6">แก้ไขข้อมูลผู้ใช้</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
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
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">บทบาท (Role)</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* 3. ▼▼▼ เพิ่มช่องเลือกครูที่ปรึกษา (จะแสดงเมื่อเป็นนักเรียน) ▼▼▼ */}
            {formData.role === 'student' && (
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
            )}
            
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