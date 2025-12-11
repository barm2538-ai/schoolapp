"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function LearningMediaForm({ isOpen, onClose, mediaToEdit }) {
  // 1. เพิ่ม state 'category' ใน formData
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    url: '', 
    imageUrl: '', 
    category: '' 
  });
  
  // 2. สร้าง state สำหรับเก็บรายชื่อหมวดหมู่
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. ดึงข้อมูลหมวดหมู่จาก Firebase (learningMediaCategories)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'learningMediaCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      
      // ถ้าเป็นการเพิ่มใหม่ และยังไม่ได้เลือกหมวดหมู่ ให้เลือกอันแรกเป็นค่าเริ่มต้น
      if (!mediaToEdit && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    });
    return () => unsubscribe();
  }, [mediaToEdit]);

  useEffect(() => {
    if (mediaToEdit) {
      setFormData({
        title: mediaToEdit.title || '',
        description: mediaToEdit.description || '',
        url: mediaToEdit.url || mediaToEdit.videoUrl || '', // รองรับชื่อเก่า videoUrl
        imageUrl: mediaToEdit.imageUrl || '',
        // ถ้ามีหมวดหมู่เดิมให้ใช้ ถ้าไม่มีให้ใช้อันแรกของลิสต์
        category: mediaToEdit.category || (categories.length > 0 ? categories[0] : ''),
      });
    } else {
      // รีเซ็ตฟอร์ม
      setFormData({ 
        title: '', 
        description: '', 
        url: '', 
        imageUrl: '', 
        category: categories.length > 0 ? categories[0] : '' 
      });
    }
  }, [mediaToEdit, isOpen, categories]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        imageUrl: formData.imageUrl,
        category: formData.category, // บันทึกหมวดหมู่ลงไป
      };

      if (mediaToEdit) {
        await setDoc(doc(db, 'learningMedia', mediaToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'learningMedia'), dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Error saving media:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">{mediaToEdit ? 'แก้ไขสื่อการเรียนรู้' : 'เพิ่มสื่อการเรียนรู้ใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            
            {/* ชื่อสื่อ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="เช่น สอนภาษาอังกฤษพื้นฐาน" 
                className="w-full px-3 py-2 border rounded-lg" 
                required 
              />
            </div>

            {/* 4. Dropdown เลือกหมวดหมู่ (แทนที่ Type เดิม) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {categories.length > 0 ? (
                  categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))
                ) : (
                  <option value="">กรุณาเพิ่มหมวดหมู่ก่อน</option>
                )}
              </select>
            </div>

            {/* รายละเอียด */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="คำอธิบายเพิ่มเติม" 
                className="w-full px-3 py-2 border rounded-lg" 
                rows="3" 
              />
            </div>

            {/* ลิงก์ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์ (YouTube / เว็บไซต์)</label>
              <input 
                name="url" 
                value={formData.url} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="w-full px-3 py-2 border rounded-lg" 
              />
            </div>

            {/* รูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปปก (ถ้ามี)</label>
              <input 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://... (ถ้าว่างจะใช้รูป Youtube หรือ Default)" 
                className="w-full px-3 py-2 border rounded-lg" 
              />
            </div>

          </div>
          
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}