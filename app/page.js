"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import AnnouncementForm from '../components/AnnouncementForm';

export default function Home() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(announcementsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) {
      await deleteDoc(doc(db, 'announcements', id));
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAnnouncement(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      {/* ▼▼▼ ปรับแก้ Layout ส่วนนี้ทั้งหมด ▼▼▼ */}
      <div className="w-full max-w-5xl"> 
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการประกาศข่าวสาร</h1>
            <button 
              onClick={() => { setEditingAnnouncement(null); setIsModalOpen(true); }} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + เพิ่มประกาศใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">หัวข้อ</th>
                <th className="p-4">เนื้อหาย่อ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4 text-gray-600">{item.shortDescription}</td>
                  <td className="p-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="text-yellow-500 hover:underline mr-4"
                    >
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="text-red-500 hover:underline"
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ▲▲▲ สิ้นสุดการแก้ไข Layout ▲▲▲ */}

      <AnnouncementForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        announcementToEdit={editingAnnouncement}
      />
    </>
  );
}