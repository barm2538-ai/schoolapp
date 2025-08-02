"use client";

import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import QuestionForm from '../../../components/QuestionForm';

export default function ManageQuestionsPage({ params }) {
  const { examId } = params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    if (!examId) return;
    const q = query(collection(db, 'exams', examId, 'questions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [examId]);

  const handleDelete = async (questionId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบคำถามนี้?")) {
      await deleteDoc(doc(db, 'exams', examId, 'questions', questionId));
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการคำถาม</h1>
            <div>
              <button className="bg-green-500 text-white px-4 py-2 rounded mr-4">
                + เพิ่มจากไฟล์
              </button>
              <button onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
                + เพิ่มคำถามใหม่
              </button>
            </div>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">คำถาม</th>
                <th className="p-4">คำตอบที่ถูก</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium truncate max-w-md">{item.questionText}</td>
                  <td className="p-4 text-gray-600">{item.options[item.correctAnswerIndex]}</td>
                  <td className="p-4">
                    <button onClick={() => handleEdit(item)} className="text-yellow-500 hover:underline mr-4">แก้ไข</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <QuestionForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        questionToEdit={editingQuestion}
        examId={examId}
      />
    </>
  );
}