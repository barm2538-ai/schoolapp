"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import AdditionalLinkForm from '../../components/AdditionalLinkForm';

export default function AdditionalLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'additionalLinks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์นี้?")) {
      await deleteDoc(doc(db, 'additionalLinks', id));
    }
  };

  const handleEdit = (linkItem) => {
    setEditingLink(linkItem);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLink(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการลิงก์เพิ่มเติม</h1>
            <button onClick={() => { setEditingLink(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มลิงก์ใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">หัวข้อ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {links.map((item) => (
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
      <AdditionalLinkForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        linkToEdit={editingLink}
      />
    </>
  );
}