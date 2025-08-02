"use client";

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function ChangePasswordModal({ isOpen, onClose, user }) {
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setIsSubmitting(true);
    try {
      const functions = getFunctions();
      const updateUserPassword = httpsCallable(functions, 'updateUserPassword');
      const result = await updateUserPassword({ uid: user.id, newPassword: newPassword });
      alert(result.data.result);
      onClose();
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setNewPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">เปลี่ยนรหัสผ่าน</h2>
        <p className="mb-6 text-gray-600">สำหรับ: {user.email}</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="กรอกรหัสผ่านใหม่"
            className="w-full px-3 py-2 border rounded-lg mb-6"
            required
          />
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}