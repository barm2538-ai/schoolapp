"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import FormPageForm from '../../components/FormPageForm';

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setForms(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'forms', id));
    }
  };

  const handleEdit = (formItem) => {
    setEditingForm(formItem);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingForm(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการแบบฟอร์มต่างๆ</h1>
            <button onClick={() => { setEditingForm(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มแบบฟอร์มใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อแบบฟอร์ม</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.formName}</td>
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
      <FormPageForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        formToEdit={editingForm}
      />
    </>
  );
}