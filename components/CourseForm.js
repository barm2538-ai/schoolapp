"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, doc, setDoc, Timestamp, onSnapshot, query } from 'firebase/firestore';

const formatDateForInput = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CourseForm({ isOpen, onClose, courseToEdit }) {
  const [formData, setFormData] = useState({ 
    subjectName: '', 
    teacherName: '', 
    educationLevel: 'ประถม',
    onlineClassUrl: '',
    examDate: '',
    examTime: '',
    examRoom: '',
    examId: '',
  });
  const [allExams, setAllExams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const examsQuery = query(collection(db, 'exams'));
    const unsubscribe = onSnapshot(examsQuery, (snapshot) => {
      const examsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllExams(examsList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        subjectName: courseToEdit.subjectName || '',
        teacherName: courseToEdit.teacherName || '',
        educationLevel: courseToEdit.educationLevel || 'ประถม',
        onlineClassUrl: courseToEdit.onlineClassUrl || '',
        examDate: formatDateForInput(courseToEdit.examDate),
        examTime: courseToEdit.examTime || '',
        examRoom: courseToEdit.examRoom || '',
        examId: courseToEdit.examId || '',
      });
    } else {
      setFormData({ subjectName: '', teacherName: '', educationLevel: 'ประถม', onlineClassUrl: '', examDate: '', examTime: '', examRoom: '', examId: '' });
    }
  }, [courseToEdit, isOpen]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ▼▼▼ แก้ไขฟังก์ชันนี้ทั้งหมด ▼▼▼
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectName) {
      alert('กรุณากรอกชื่อรายวิชา');
      return;
    }
    setIsSubmitting(true);
    try {
      // สร้าง object ข้อมูลที่จะบันทึกให้ครบถ้วนเสมอ
      const dataToSave = {
        subjectName: formData.subjectName,
        teacherName: formData.teacherName,
        educationLevel: formData.educationLevel,
        onlineClassUrl: formData.onlineClassUrl,
        examDate: formData.examDate ? Timestamp.fromDate(new Date(formData.examDate)) : null,
        examTime: formData.examTime,
        examRoom: formData.examRoom,
        examId: formData.examId, // บรรทัดนี้สำคัญมาก
      };

      if (courseToEdit) {
        await setDoc(doc(db, 'courses', courseToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collection(db, 'courses'), dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{courseToEdit ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input name="subjectName" value={formData.subjectName} onChange={handleChange} placeholder="ชื่อรายวิชา" className="w-full px-3 py-2 border rounded-lg" required />
            <input name="teacherName" value={formData.teacherName} onChange={handleChange} placeholder="ชื่อผู้สอน" className="w-full px-3 py-2 border rounded-lg" />
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">ระดับชั้น</label>
              <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="ประถม">ประถม</option>
                <option value="มัธยมต้น">มัธยมต้น</option>
                <option value="มัธยมปลาย">มัธยมปลาย</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">แบบทดสอบที่เกี่ยวข้อง</label>
              <select name="examId" value={formData.examId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- ไม่มีแบบทดสอบ --</option>
                {allExams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <input name="onlineClassUrl" value={formData.onlineClassUrl} onChange={handleChange} placeholder="ลิงก์ห้องเรียนออนไลน์" className="w-full px-3 py-2 border rounded-lg col-span-2" />
            <input name="examDate" type="date" value={formData.examDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
            <input name="examTime" value={formData.examTime} onChange={handleChange} placeholder="เวลาสอบ" className="w-full px-3 py-2 border rounded-lg" />
            <input name="examRoom" value={formData.examRoom} onChange={handleChange} placeholder="ห้องสอบ" className="w-full px-3 py-2 border rounded-lg col-span-2" />
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