"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function PersonnelForm({ isOpen, onClose, personnelToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    department: '',
    imageUrl: '',
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personnelToEdit) {
      setFormData({
        name: personnelToEdit.name || '',
        position: personnelToEdit.position || '',
        department: personnelToEdit.department || '',
        imageUrl: personnelToEdit.imageUrl || '',
        order: personnelToEdit.order || 0,
      });
    } else {
      setFormData({ name: '', position: '', department: '', imageUrl: '', order: 0 });
    }
  }, [personnelToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      alert('กรุณากรอกชื่อและตำแหน่ง');
      return;
    }
    setIsSubmitting(true);
    try {
      if (personnelToEdit) {
        const docRef = doc(db, 'personnel', personnelToEdit.id);
        await setDoc(docRef, formData, { merge: true });
      } else {
        await addDoc(collection(db, 'personnel'), formData);
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
        <h2 className="text-2xl font-bold mb-6">{personnelToEdit ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มบุคลากรใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="ชื่อ-นามสกุล" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="position" value={formData.position} onChange={handleChange} placeholder="ตำแหน่ง" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="department" value={formData.department} onChange={handleChange} placeholder="แผนก/คณะ" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL" className="w-full px-3 py-2 border rounded-lg" />
            <input name="order" type="number" value={formData.order} onChange={handleChange} placeholder="ลำดับการแสดงผล" className="w-full px-3 py-2 border rounded-lg" />
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