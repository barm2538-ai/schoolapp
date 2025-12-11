"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function GuidanceForm({ isOpen, onClose, articleToEdit }) {
  const [formData, setFormData] = useState({ title: '', content: '', category: '', readMoreUrl: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '' });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'guidanceCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      if (!articleToEdit && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (articleToEdit) {
      setFormData({
        title: articleToEdit.title || '',
        content: articleToEdit.content || '',
        category: articleToEdit.category || (categories.length > 0 ? categories[0] : ''),
        readMoreUrl: articleToEdit.readMoreUrl || '',
        imageUrl1: articleToEdit.imageUrls?.[0] || '',
        imageUrl2: articleToEdit.imageUrls?.[1] || '',
        imageUrl3: articleToEdit.imageUrls?.[2] || '',
        imageUrl4: articleToEdit.imageUrls?.[3] || '',
        imageUrl5: articleToEdit.imageUrls?.[4] || '',
      });
    } else {
      setFormData({ title: '', content: '', category: categories.length > 0 ? categories[0] : '', readMoreUrl: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', imageUrl4: '', imageUrl5: '' });
    }
  }, [articleToEdit, isOpen, categories]);

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
        imageUrls: imageUrls,
      };
      if (articleToEdit) {
        await setDoc(doc(db, 'guidanceArticles', articleToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'guidanceArticles'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{articleToEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="title" value={formData.title} onChange={handleChange} placeholder="หัวเรื่อง" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="content" value={formData.content} onChange={handleChange} placeholder="รายละเอียด" className="w-full px-3 py-2 border rounded-lg" rows="4" />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="readMoreUrl" value={formData.readMoreUrl} onChange={handleChange} placeholder="ลิงก์อ่านเพิ่มเติม (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl1" value={formData.imageUrl1} onChange={handleChange} placeholder="ลิงก์รูปภาพ 1" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl2" value={formData.imageUrl2} onChange={handleChange} placeholder="ลิงก์รูปภาพ 2" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl3" value={formData.imageUrl3} onChange={handleChange} placeholder="ลิงก์รูปภาพ 3" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl4" value={formData.imageUrl4} onChange={handleChange} placeholder="ลิงก์รูปภาพ 4" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl5" value={formData.imageUrl5} onChange={handleChange} placeholder="ลิงก์รูปภาพ 5" className="w-full px-3 py-2 border rounded-lg" />
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