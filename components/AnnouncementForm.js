"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AnnouncementForm({ isOpen, onClose, announcementToEdit }) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [readMoreUrl, setReadMoreUrl] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title);
      setShortDescription(announcementToEdit.shortDescription);
      setFullContent(announcementToEdit.fullContent);
      setImageUrl(announcementToEdit.imageUrl || '');
      setReadMoreUrl(announcementToEdit.readMoreUrl || '');
    } else {
      setTitle('');
      setShortDescription('');
      setFullContent('');
      setImageUrl('');
    }
  }, [announcementToEdit, isOpen]); // เพิ่ม isOpen เพื่อให้ฟอร์มรีเฟรชทุกครั้งที่เปิด

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !shortDescription || !fullContent) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = {
        title,
        shortDescription,
        fullContent,
        imageUrl,
        readMoreUrl, // 2. เพิ่ม field นี้
        createdAt: announcementToEdit?.createdAt || serverTimestamp(),
      };

      if (announcementToEdit) {
        // โหมดแก้ไข: อัปเดตเอกสารเดิม
        const docRef = doc(db, 'announcements', announcementToEdit.id);
        await setDoc(docRef, data, { merge: true }); // ใช้ merge: true เพื่อไม่ให้ createdAt หาย
      } else {
        // โหมดสร้างใหม่: เพิ่ม createdAt
        const dataToCreate = { ...data, createdAt: serverTimestamp() };
        await addDoc(collection(db, 'announcements'), dataToCreate);
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
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-6">
          {announcementToEdit ? 'แก้ไขประกาศ' : 'เพิ่มประกาศใหม่'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">หัวข้อ</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">เนื้อหาย่อ (แสดงในแอปหน้าแรก)</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="2"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">เนื้อหาฉบับเต็ม</label>
            <textarea
              value={fullContent}
              onChange={(e) => setFullContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="5"
              required
            ></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Image URL (ไม่บังคับ)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
            <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">ลิงก์อ่านเพิ่มเติม (ถ้ามี)</label>
            <input type="text" value={readMoreUrl} onChange={(e) => setReadMoreUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}