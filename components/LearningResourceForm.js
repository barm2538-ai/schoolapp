"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';

export default function LearningResourceForm({ isOpen, onClose, resourceToEdit }) {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    imageUrl: '', 
    videoUrl: '', 
    latitude: '', 
    longitude: '', 
    examId: '' 
  });
  
  const [exams, setExams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      const querySnapshot = await getDocs(collection(db, "exams"));
      const examsData = querySnapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
      setExams(examsData);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        title: resourceToEdit.title || '',
        description: resourceToEdit.description || '',
        imageUrl: resourceToEdit.imageUrl || '',
        videoUrl: resourceToEdit.videoUrl || resourceToEdit.url || '',
        latitude: resourceToEdit.latitude || '',
        longitude: resourceToEdit.longitude || '',
        examId: resourceToEdit.examId || '',
      });
    } else {
      setFormData({ 
        title: '', description: '', imageUrl: '', videoUrl: '', 
        latitude: '', longitude: '', examId: '' 
      });
    }
  }, [resourceToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (resourceToEdit) {
        await setDoc(doc(db, 'learningResources', resourceToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'learningResources'), dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Error:", error);
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
          {resourceToEdit ? 'แก้ไขแหล่งเรียนรู้' : 'เพิ่มแหล่งเรียนรู้ใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="space-y-4 mb-6 flex-grow overflow-y-auto pr-4">
            
            <div>
              <label className="block text-sm font-bold text-black mb-1">ชื่อแหล่งเรียนรู้ *</label>
              <input name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">รายละเอียด</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" rows="3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">ละติจูด (Latitude)</label>
                <input name="latitude" value={formData.latitude} onChange={handleChange} placeholder="เช่น 13.7563" className="w-full px-3 py-2 border rounded-lg" type="number" step="any" />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">ลองจิจูด (Longitude)</label>
                <input name="longitude" value={formData.longitude} onChange={handleChange} placeholder="เช่น 100.5018" className="w-full px-3 py-2 border rounded-lg" type="number" step="any" />
              </div>
            </div>
            
            {/* ▼▼▼ แก้ไขตรงนี้ (เปลี่ยน > เป็น &gt;) ▼▼▼ */}
            <p className="text-xs text-gray-500">
              * คุณสามารถหาพิกัดได้จาก Google Maps (คลิกขวาที่จุด &gt; กดที่ตัวเลขพิกัดเพื่อ Copy)
            </p>

            <div>
              <label className="block text-sm font-bold text-black mb-1">ลิงก์วิดีโอ (YouTube)</label>
              <input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://youtube.com/..." className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">ลิงก์รูปปก</label>
              <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-1">แบบทดสอบรับวุฒิบัตร (เลือก)</label>
              <select 
                name="examId" 
                value={formData.examId} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-lg bg-white text-black"
              >
                <option value="">-- ไม่มีการทดสอบ --</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                * เลือกข้อสอบที่ต้องการให้นักเรียนทำเพื่อรับวุฒิบัตรจากแหล่งเรียนรู้นี้
              </p>
            </div>

          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t flex-shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg text-black">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}