"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import StoreItemForm from '../../components/StoreItemForm';

export default function StorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'storeItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      await deleteDoc(doc(db, 'storeItems', id));
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

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการร้านค้า</h1>
            <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มสินค้าใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อสินค้า</th>
                <th className="p-4">หมวดหมู่</th> {/* ▼▼▼ เพิ่มคอลัมน์นี้ ▼▼▼ */}
                <th className="p-4">เบอร์โทรติดต่อ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.productName}</td>
                  <td className="p-4 text-gray-600">{item.category}</td> {/* ▼▼▼ เพิ่มข้อมูลนี้ ▼▼▼ */}
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
      <StoreItemForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        itemToEdit={editingItem}
      />
    </>
  );
}