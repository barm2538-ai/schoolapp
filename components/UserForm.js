"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
// ถ้ามีการใช้ Authentication ในการสร้าง user ต้อง import functions หรือ auth เพิ่มเติม (ในที่นี้เน้นแก้ข้อมูล Firestore)

export default function UserForm({ isOpen, onClose, userToEdit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student', // ค่าเริ่มต้น
    studentId: '',
    position: '', // สำหรับครู/ผอ.
    isApproved: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        fullName: userToEdit.fullName || '',
        email: userToEdit.email || '',
        role: userToEdit.role || 'student',
        studentId: userToEdit.studentId || '',
        position: userToEdit.position || '',
        isApproved: userToEdit.isApproved !== undefined ? userToEdit.isApproved : true,
      });
    } else {
      // กรณีเพิ่มใหม่ (ถ้ามีปุ่มเพิ่ม)
      setFormData({
        fullName: '', email: '', role: 'student', studentId: '', position: '', isApproved: true
      });
    }
  }, [userToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        // ถ้าเป็น public หรือ admin หรือ director ไม่ต้องมี studentId
        studentId: (formData.role === 'student') ? formData.studentId : null,
        updatedAt: serverTimestamp()
      };

      if (userToEdit) {
        await setDoc(doc(db, 'users', userToEdit.id), dataToSave, { merge: true });
      } else {
        // กรณีสร้างใหม่ (ปกติแอดมินมักจะสร้างผ่าน Auth แต่ถ้าสร้าง Database หลอกๆ ก็ใช้ได้)
        await addDoc(collection(db, 'users'), {
            ...dataToSave,
            createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black">
          {userToEdit ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-black mb-1">ชื่อ-สกุล</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-black" required />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">อีเมล</label>
            <input name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-black bg-gray-100" disabled={!!userToEdit} />
          </div>

          {/* ▼▼▼ จุดที่อัปเดต: เพิ่มตัวเลือกให้ครบ 5 สิทธิ์ ▼▼▼ */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">สิทธิ์การใช้งาน (Role)</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border rounded-lg text-black bg-white"
            >
              <option value="admin">🔴 ผู้ดูแลระบบ (Admin)</option>
              <option value="director">🟣 ผู้อำนวยการ (Director)</option>
              <option value="teacher">🟠 ครู (Teacher)</option>
              <option value="student">🔵 นักเรียน (Student)</option>
              <option value="public">🟢 ประชาชน (Public)</option>
            </select>
          </div>

          {/* แสดงช่องกรอกตามสิทธิ์ */}
          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-bold text-black mb-1">รหัสนักศึกษา</label>
              <input name="studentId" value={formData.studentId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-black" />
            </div>
          )}

          {(formData.role === 'teacher' || formData.role === 'director') && (
            <div>
              <label className="block text-sm font-bold text-black mb-1">ตำแหน่ง</label>
              <input name="position" value={formData.position} onChange={handleChange} placeholder="เช่น ผู้อำนวยการ, ครูชำนาญการ" className="w-full px-3 py-2 border rounded-lg text-black" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-black mb-1">สถานะ</label>
            <select 
              name="isApproved" 
              value={formData.isApproved} 
              onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.value === 'true' }))} 
              className="w-full px-3 py-2 border rounded-lg text-black bg-white"
            >
              <option value="true">✅ อนุมัติ (ใช้งานได้)</option>
              <option value="false">⏳ รออนุมัติ (ระงับ)</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-black hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {isSubmitting ? 'บันทึก' : 'บันทึก'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}