"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig'; // <-- แก้ไข path ตรงนี้
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import ExamForm from '../../components/ExamForm'; // <-- แก้ไข path ตรงนี้
import Link from 'next/link';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'exams'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบชุดข้อสอบนี้ (คำถามทั้งหมดจะถูกลบด้วย)?")) {
      await deleteDoc(doc(db, 'exams', id));
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการชุดข้อสอบ</h1>
             <Link href="/quiz-history" className="bg-purple-500 text-white px-4 py-2 rounded mr-4">
                ประวัติคะแนนสอบ
              </Link>
            <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มชุดข้อสอบใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อชุดข้อสอบ</th>
                <th className="p-4">คำอธิบาย</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{item.description}</td>
                  <td className="p-4 whitespace-nowrap">
                    <Link href={`/exams/${item.id}`} className="bg-green-500 text-white px-3 py-1 rounded text-sm mr-4 hover:bg-green-600">
                      จัดการคำถาม
                    </Link>
                    <button onClick={() => handleEdit(item)} className="text-yellow-500 hover:underline mr-4">แก้ไข</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ExamForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        examToEdit={editingExam}
      />
    </>
  );
}