"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // <-- แก้ไข path ตรงนี้
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

export default function QuestionForm({ isOpen, onClose, questionToEdit, examId }) {
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionToEdit) {
      setFormData({
        questionText: questionToEdit.questionText || '',
        options: questionToEdit.options || ['', '', '', ''],
        correctAnswerIndex: questionToEdit.correctAnswerIndex ?? 0,
      });
    } else {
      setFormData({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 });
    }
  }, [questionToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        correctAnswerIndex: Number(formData.correctAnswerIndex)
      };
      const collectionRef = collection(db, 'exams', examId, 'questions');
      
      if (questionToEdit) {
        await setDoc(doc(collectionRef, questionToEdit.id), dataToSave, { merge: true });
      } else {
        await addDoc(collectionRef, dataToSave);
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
        <h2 className="text-2xl font-bold mb-6">{questionToEdit ? 'แก้ไขคำถาม' : 'เพิ่มคำถามใหม่'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <textarea name="questionText" value={formData.questionText} onChange={handleChange} placeholder="เนื้อหาคำถาม" className="w-full px-3 py-2 border rounded-lg" rows="3" required />
            {formData.options.map((option, index) => (
              <input key={index} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`ตัวเลือกที่ ${index + 1}`} className="w-full px-3 py-2 border rounded-lg" required />
            ))}
            <div>
              <label className="block text-gray-700 font-medium mb-2">คำตอบที่ถูกต้อง</label>
              <select name="correctAnswerIndex" value={formData.correctAnswerIndex} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                <option value={0}>ตัวเลือกที่ 1</option>
                <option value={1}>ตัวเลือกที่ 2</option>
                <option value={2}>ตัวเลือกที่ 3</option>
                <option value={3}>ตัวเลือกที่ 4</option>
              </select>
            </div>
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