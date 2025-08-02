"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function LibraryResourceForm({ isOpen, onClose, resourceToEdit }) {
  const [formData, setFormData] = useState({ title: '', description: '', url: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '', category: '' });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'libraryCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      if (!resourceToEdit && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        title: resourceToEdit.title || '',
        description: resourceToEdit.description || '',
        url: resourceToEdit.url || '',
        imageUrl1: resourceToEdit.imageUrls?.[0] || '',
        imageUrl2: resourceToEdit.imageUrls?.[1] || '',
        imageUrl3: resourceToEdit.imageUrls?.[2] || '',
        imageUrl4: resourceToEdit.imageUrls?.[3] || '',
        imageUrl5: resourceToEdit.imageUrls?.[4] || '',
        category: resourceToEdit.category || (categories.length > 0 ? categories[0] : ''),
      });
    } else {
      setFormData({ title: '', description: '', url: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '', category: categories.length > 0 ? categories[0] : '' });
    }
  }, [resourceToEdit, isOpen, categories]);

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
        description: formData.description,
        url: formData.url,
        imageUrls: imageUrls,
        category: formData.category,
      };
      if (resourceToEdit) {
        await setDoc(doc(db, 'libraryResources', resourceToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'libraryResources'), dataToSave);
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
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{resourceToEdit ? 'แก้ไขสื่อ' : 'เพิ่มสื่อใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="ชื่อหนังสือ / สื่อ" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="คำอธิบาย" className="w-full px-3 py-2 border rounded-lg" rows="2" />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="url" value={formData.url} onChange={handleChange} placeholder="ลิงก์สำหรับอ่าน (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl1" value={formData.imageUrl1} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 1" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl2" value={formData.imageUrl2} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 2" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl3" value={formData.imageUrl3} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 3" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl4" value={formData.imageUrl4} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 4" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl5" value={formData.imageUrl5} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 5" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}