"use client";
import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function StoreItemForm({ isOpen, onClose, itemToEdit }) {
  const [formData, setFormData] = useState({ productName: '', description: '', contactPhone: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', category: '', mapUrl: '' });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูลหมวดหมู่
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'storeCategories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => doc.data().name);
      setCategories(cats);
      // ตั้งค่าหมวดหมู่เริ่มต้นถ้ายังไม่มี
      if (!formData.category && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0] }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        productName: itemToEdit.productName || '',
        description: itemToEdit.description || '',
        contactPhone: itemToEdit.contactPhone || '',
        imageUrl1: itemToEdit.imageUrls?.[0] || '',
        imageUrl2: itemToEdit.imageUrls?.[1] || '',
        imageUrl3: itemToEdit.imageUrls?.[2] || '',
        category: itemToEdit.category || (categories.length > 0 ? categories[0] : ''),
        mapUrl: itemToEdit.mapUrl || '',
      });
    } else {
      setFormData({ productName: '', description: '', contactPhone: '', imageUrl1: '', imageUrl2: '', imageUrl3: '', category: categories.length > 0 ? categories[0] : '', mapUrl: '' });
    }
  }, [itemToEdit, isOpen, categories]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const imageUrls = [formData.imageUrl1, formData.imageUrl2, formData.imageUrl3].filter(url => url);
      const dataToSave = {
        productName: formData.productName,
        description: formData.description,
        contactPhone: formData.contactPhone,
        imageUrls: imageUrls,
        category: formData.category,
        mapUrl: formData.mapUrl,
      };
      if (itemToEdit) {
        await setDoc(doc(db, 'storeItems', itemToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'storeItems'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{itemToEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <input name="productName" value={formData.productName} onChange={handleChange} placeholder="ชื่อสินค้า" className="w-full px-3 py-2 border rounded-lg" required />
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="รายละเอียดสินค้า" className="w-full px-3 py-2 border rounded-lg" rows="3" />
            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="เบอร์โทรติดต่อ" className="w-full px-3 py-2 border rounded-lg" />
            <input name="mapUrl" value={formData.mapUrl} onChange={handleChange} placeholder="ลิงก์ Google Maps (ถ้ามี)" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl1" value={formData.imageUrl1} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 1" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl2" value={formData.imageUrl2} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 2" className="w-full px-3 py-2 border rounded-lg" />
            <input name="imageUrl3" value={formData.imageUrl3} onChange={handleChange} placeholder="ลิงก์รูปภาพที่ 3" className="w-full px-3 py-2 border rounded-lg" />
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