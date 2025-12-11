"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function ExamForm({ isOpen, onClose, examToEdit }) {
  // เพิ่ม State สำหรับตั้งค่าวุฒิบัตร
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // --- ตั้งค่าวุฒิบัตร (แยกตามข้อสอบ) ---
    certSchoolName: '',    // ชื่อสถานศึกษา
    certTitle: '',         // หัวข้อวุฒิบัตร
    certLogoUrl: '',       // ลิงก์โลโก้
    certSignUrl: '',       // ลิงก์ลายเซ็น
    certSignerName: '',    // ชื่อผู้ลงนาม
    certSignerPosition: '',// ตำแหน่งผู้ลงนาม
    certExtraText: ''      // ข้อความขยาย
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        title: examToEdit.title || '',
        description: examToEdit.description || '',
        // โหลดข้อมูลวุฒิบัตร (ถ้ามี)
        certSchoolName: examToEdit.certSchoolName || '',
        certTitle: examToEdit.certTitle || 'วุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า',
        certLogoUrl: examToEdit.certLogoUrl || '',
        certSignUrl: examToEdit.certSignUrl || '',
        certSignerName: examToEdit.certSignerName || '( ผู้บริหารสถานศึกษา )',
        certSignerPosition: examToEdit.certSignerPosition || '',
        certExtraText: examToEdit.certExtraText || ''
      });
    } else {
      // ค่าเริ่มต้นสำหรับข้อสอบใหม่
      setFormData({
        title: '',
        description: '',
        certSchoolName: '',
        certTitle: 'วุฒิบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า',
        certLogoUrl: '',
        certSignUrl: '',
        certSignerName: '( ผู้บริหารสถานศึกษา )',
        certSignerPosition: '',
        certExtraText: ''
      });
    }
  }, [examToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('กรุณากรอกชื่อชุดข้อสอบ');
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        updatedAt: new Date()
      };

      if (examToEdit) {
        await setDoc(doc(db, 'exams', examToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'exams'), {
          ...dataToSave,
          createdAt: new Date()
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-black flex-shrink-0">
          {examToEdit ? 'แก้ไขชุดข้อสอบ' : 'เพิ่มชุดข้อสอบใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
          <div className="space-y-6 flex-grow overflow-y-auto pr-4">
            
            {/* --- ส่วนข้อมูลทั่วไป --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">ข้อมูลทั่วไป</h3>
              <div>
                <label className="block text-sm font-bold text-black mb-1">ชื่อชุดข้อสอบ *</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg text-black" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">รายละเอียด</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border rounded-lg text-black" 
                  rows="2" 
                />
              </div>
            </div>

            {/* --- ส่วนตั้งค่าวุฒิบัตร --- */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">ตั้งค่าวุฒิบัตร (สำหรับข้อสอบนี้)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ชื่อสถานศึกษา (ใต้โลโก้)</label>
                  <input name="certSchoolName" value={formData.certSchoolName} onChange={handleChange} placeholder="เช่น ศูนย์ส่งเสริมการเรียนรู้อำเภอ..." className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ข้อความโปรย</label>
                  <input name="certTitle" value={formData.certTitle} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ลิงก์โลโก้ (Logo URL)</label>
                  <input name="certLogoUrl" value={formData.certLogoUrl} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ลิงก์ลายเซ็น (Signature URL)</label>
                  <input name="certSignUrl" value={formData.certSignUrl} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ชื่อผู้ลงนาม (ผอ.)</label>
                  <input name="certSignerName" value={formData.certSignerName} onChange={handleChange} placeholder="( นายสมชาย ใจดี )" className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ตำแหน่งผู้ลงนาม</label>
                  <input name="certSignerPosition" value={formData.certSignerPosition} onChange={handleChange} placeholder="ผู้อำนวยการ..." className="w-full px-3 py-2 border rounded-lg text-black" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">ข้อความขยาย (ใต้ชื่อหลักสูตร)</label>
                <input name="certExtraText" value={formData.certExtraText} onChange={handleChange} placeholder="เช่น หลักสูตรระยะสั้น จำนวน 3 ชั่วโมง" className="w-full px-3 py-2 border rounded-lg text-black" />
              </div>
            </div>

          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t flex-shrink-0 mt-4">
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