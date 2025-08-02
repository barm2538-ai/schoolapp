"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import ExternalExamForm from '../../components/ExternalExamForm';

export default function ExternalExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'externalExams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExams(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'externalExams', id));
    }
  };

  const handleEdit = (examItem) => {
    setEditingExam(examItem);
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
            <h1 className="text-3xl font-bold">จัดการแบบทดสอบภายนอก</h1>
            <button onClick={() => { setEditingExam(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มแบบทดสอบใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">หัวข้อแบบทดสอบ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.title}</td>
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
      <ExternalExamForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        examToEdit={editingExam}
      />
    </>
  );
}