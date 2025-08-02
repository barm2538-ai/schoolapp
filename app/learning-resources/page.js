"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import LearningResourceForm from '../../components/LearningResourceForm';

export default function LearningResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'learningResources'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'learningResources', id));
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการแหล่งเรียนรู้</h1>
            <button onClick={() => { setEditingResource(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มแหล่งเรียนรู้ใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อแหล่งเรียนรู้</th>
                <th className="p-4">คำอธิบาย</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{item.description}</td>
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
      <LearningResourceForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        resourceToEdit={editingResource}
      />
    </>
  );
}