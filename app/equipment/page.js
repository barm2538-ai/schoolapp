"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import EquipmentForm from '../../components/EquipmentForm';

export default function EquipmentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'equipment'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'equipment', id));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">จัดการครุภัณฑ์</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            + เพิ่มครุภัณฑ์ใหม่
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อครุภัณฑ์</th>
                <th className="p-4">รหัส</th>
                <th className="p-4">สถานที่</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{item.code}</td>
                  <td className="p-4">{item.location}</td>
                  <td className="p-4">
                    <button onClick={() => handleEdit(item)} className="text-yellow-500 mr-4">แก้ไข</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <EquipmentForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        itemToEdit={editingItem}
      />
    </>
  );
}