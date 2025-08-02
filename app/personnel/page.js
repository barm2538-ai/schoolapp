"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import PersonnelForm from '../../components/PersonnelForm';

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'personnel'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersonnel(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'personnel', id));
    }
  };

  const handleEdit = (person) => {
    setEditingPersonnel(person);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPersonnel(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการข้อมูลบุคลากร</h1>
            <button onClick={() => { setEditingPersonnel(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มบุคลากรใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ลำดับ</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">ตำแหน่ง</th>
                <th className="p-4">แผนก/คณะ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 text-gray-600">{item.order}</td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-gray-600">{item.position}</td>
                  <td className="p-4 text-gray-600">{item.department}</td>
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
      <PersonnelForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        personnelToEdit={editingPersonnel}
      />
    </>
  );
}