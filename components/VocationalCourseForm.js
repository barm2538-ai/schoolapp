"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function VocationalCourseForm({ isOpen, onClose, courseToEdit }) {
  const [formData, setFormData] = useState({ title: '', content: '', category: '', readMoreUrl: '', youtubeUrl: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '' });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vocationalCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      if (!courseToEdit && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        title: courseToEdit.title || '',
        content: courseToEdit.content || '',
        category: courseToEdit.category || (categories.length > 0 ? categories[0] : ''),
        readMoreUrl: courseToEdit.readMoreUrl || '',
        youtubeUrl: courseToEdit.youtubeUrl || '',
        imageUrl1: courseToEdit.imageUrls?.[0] || '',
        imageUrl2: courseToEdit.imageUrls?.[1] || '',
        imageUrl3: courseToEdit.imageUrls?.[2] || '',
        imageUrl4: courseToEdit.imageUrls?.[3] || '',
        imageUrl5: courseToEdit.imageUrls?.[4] || '',
      });
    } else {
      setFormData({ title: '', content: '', category: categories.length > 0 ? categories[0] : '', readMoreUrl: '', youtubeUrl: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '' });
    }
  }, [courseToEdit, isOpen, categories]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const imageUrls = [formData.imageUrl1, formData.imageUrl2, formData.imageUrl3, formData.imageUrl4, formData.imageUrl5].filter(url => url);
      const dataToSave = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        readMoreUrl: formData.readMoreUrl,
        youtubeUrl: formData.youtubeUrl,
        imageUrls: imageUrls,
      };
      if (courseToEdit) {
        await setDoc(doc(db, 'vocationalCourses', courseToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'vocationalCourses'), dataToSave);
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
    // 1. ▼▼▼ เพิ่ม padding ที่พื้นหลังสีดำ ▼▼▼
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      {/* 2. ▼▼▼ ทำให้ card เป็น flex-col และกำหนดความสูงสูงสุด ▼▼▼ */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 flex-shrink-0">{courseToEdit ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}</h2>
        {/* 3. ▼▼▼ ทำให้ form ขยายและมี min-h-0 ▼▼▼ */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          {/* 4. ▼▼▼ ทำให้ส่วนของ input field เลื่อนได้ ▼▼▼ */}
          <div className="space-y-4 mb-6 flex-grow overflow-y-auto pr-4">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อหลักสูตร" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="รายละเอียด" className="w-full px-3 py-2 border rounded-lg" rows="4" />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="readMoreUrl" value={formData.readMoreUrl} onChange={handleChange} placeholder="ลิงก์เพิ่มเติม (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="ลิงก์ YouTube (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl1" value={formData.imageUrl1} onChange={handleChange} placeholder="ลิงก์รูปภาพ 1" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl2" value={formData.imageUrl2} onChange={handleChange} placeholder="ลิงก์รูปภาพ 2" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl3" value={formData.imageUrl3} onChange={handleChange} placeholder="ลิงก์รูปภาพ 3" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl4" value={formData.imageUrl4} onChange={handleChange} placeholder="ลิงก์รูปภาพ 4" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl5" value={formData.imageUrl5} onChange={handleChange} placeholder="ลิงก์รูปภาพ 5" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          {/* 5. ▼▼▼ ทำให้ปุ่มอยู่กับที่ ▼▼▼ */}
          <div className="flex justify-end gap-4 pt-4 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}