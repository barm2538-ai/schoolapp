"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import OnlineClassForm from '../../components/OnlineClassForm';

export default function OnlineClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'onlineClasses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบห้องเรียนนี้?")) {
      await deleteDoc(doc(db, 'onlineClasses', id));
    }
  };

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการห้องเรียนออนไลน์</h1>
            <button onClick={() => { setEditingClass(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มห้องเรียนใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อวิชา</th>
                <th className="p-4">ผู้สอน</th>
                <th className="p-4">เวลา</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.subjectName}</td>
                  <td className="p-4 text-gray-600">{item.teacherName}</td>
                  <td className="p-4 text-gray-600">{item.classTime}</td>
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
      <OnlineClassForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        classToEdit={editingClass}
      />
    </>
  );
}