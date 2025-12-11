"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';

export default function AnnouncementForm({ isOpen, onClose, itemToEdit }) {
  // 1. ปรับ State ให้ตรงกับแอปมือถือ
  const [formData, setFormData] = useState({ 
    title: '', 
    shortDescription: '', // เนื้อหาย่อ
    content: '',          // เนื้อหาเต็ม
    imageUrl: '', 
    linkUrl: '',          // ลิงก์
    date: '',             // วันที่ (YYYY-MM-DD)
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      // แปลงวันที่จาก Timestamp เป็น String เพื่อแสดงใน input type="date"
      let dateStr = '';
      if (itemToEdit.date) {
        const d = itemToEdit.date.toDate ? itemToEdit.date.toDate() : new Date(itemToEdit.date);
        dateStr = d.toISOString().split('T')[0];
      }

      setFormData({
        title: itemToEdit.title || '',
        shortDescription: itemToEdit.shortDescription || '',
        content: itemToEdit.content || itemToEdit.description || '', // รองรับข้อมูลเก่า
        imageUrl: itemToEdit.imageUrl || '',
        linkUrl: itemToEdit.linkUrl || itemToEdit.url || '',
        date: dateStr
      });
    } else {
      // ค่าเริ่มต้น (วันนี้)
      const today = new Date().toISOString().split('T')[0];
      setFormData({ 
        title: '', shortDescription: '', content: '', imageUrl: '', linkUrl: '', date: today 
      });
    }
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // แปลงวันที่กลับเป็น Timestamp ก่อนบันทึก
      const dateObj = formData.date ? new Date(formData.date) : new Date();
      
      const dataToSave = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        content: formData.content,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        date: Timestamp.fromDate(dateObj), // บันทึกเป็น Timestamp มาตรฐาน
      };

      if (itemToEdit) {
        await setDoc(doc(db, 'announcements', itemToEdit.id), {
          ...dataToSave,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...dataToSave,
          createdAt: Timestamp.now()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 flex-shrink-0 text-black">
          {itemToEdit ? 'แก้ไขประกาศข่าวสาร' : 'เพิ่มประกาศข่าวสารใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="space-y-4 mb-6 flex-grow overflow-y-auto pr-4">
            
            {/* หัวข้อ */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">หัวข้อข่าว *</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg text-black" 
                required 
              />
            </div>

            {/* วันที่ */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">วันที่ประกาศ</label>
              <input 
                type="date"
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg text-black" 
              />
            </div>

            {/* เนื้อหาย่อ */}
            <div>
              <label className="block text-sm font-bold text-blue-600 mb-1">เนื้อหาย่อ (แสดงหน้าแรก)</label>
              <textarea 
                name="shortDescription" 
                value={formData.shortDescription} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg text-black" 
                rows="2" 
                placeholder="สรุปใจความสำคัญสั้นๆ..."
              />
            </div>

            {/* เนื้อหาเต็ม */}
            <div>
              <label className="block text-sm font-bold text-green-600 mb-1">เนื้อหาฉบับเต็ม (อ่านต่อ)</label>
              <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg text-black" 
                rows="5" 
                placeholder="รายละเอียดทั้งหมด..."
              />
            </div>

            {/* รูปภาพ */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">ลิงก์รูปภาพ (Banner URL)</label>
              <input 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="w-full px-3 py-2 border rounded-lg text-black" 
              />
            </div>

            {/* ลิงก์ภายนอก */}
            <div>
              <label className="block text-sm font-bold text-black mb-1">ลิงก์อ่านเพิ่มเติม / เอกสารแนบ</label>
              <input 
                name="linkUrl" 
                value={formData.linkUrl} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="w-full px-3 py-2 border rounded-lg text-black" 
              />
            </div>

          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-black hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}