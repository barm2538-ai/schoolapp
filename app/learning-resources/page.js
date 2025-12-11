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

  if (loading) return <p className="p-8">กำลังโหลด...</p>;

  return (
    <>
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">จัดการแหล่งเรียนรู้</h1>
            <button onClick={() => { setEditingResource(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              + เพิ่มแหล่งเรียนรู้
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-black border-b">
                <th className="p-4">ชื่อแหล่งเรียนรู้</th>
                <th className="p-4 text-center">พิกัดแผนที่</th>
                <th className="p-4 text-center">วิดีโอ</th>
                <th className="p-4 text-center">วุฒิบัตร</th>
                <th className="p-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 text-black">
                  <td className="p-4 font-medium">{item.title}</td>
                  
                  {/* สถานะแผนที่ */}
                  <td className="p-4 text-center">
                    {item.latitude && item.longitude ? (
                      <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded">✓ มีพิกัด</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* สถานะวิดีโอ */}
                  <td className="p-4 text-center">
                    {(item.videoUrl || item.url) ? (
                      <span className="text-blue-600 text-sm">Youtube</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  {/* สถานะวุฒิบัตร */}
                  <td className="p-4 text-center">
                    {item.examId ? (
                      <span className="text-purple-600 text-sm font-bold">★ มีสอบ</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(item)} className="text-yellow-600 hover:underline mr-4 font-medium">แก้ไข</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline font-medium">ลบ</button>
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