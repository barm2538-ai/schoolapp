"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import LearningUnitForm from '../../components/LearningUnitForm';

export default function LearningUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'learningUnits'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnits(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'learningUnits', id));
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการหน่วยจัดการเรียนรู้</h1>
            <button onClick={() => { setEditingUnit(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มหน่วยงานใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อหน่วยงาน</th>
                <th className="p-4">เบอร์โทร</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {units.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.unitName}</td>
                  <td className="p-4 text-gray-600">{item.contactPhone}</td>
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
      <LearningUnitForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        unitToEdit={editingUnit}
      />
    </>
  );
}