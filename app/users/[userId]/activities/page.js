"use client";

import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import CompletedActivityForm from '../../../../components/CompletedActivityForm';
import Link from 'next/link';

export default function ManageUserActivitiesPage({ params }) {
  const { userId } = params;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'users', userId, 'completedActivities'), orderBy('completedDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        return { 
          id: doc.id, 
          ...docData,
          formattedDate: docData.completedDate ? new Date(docData.completedDate.toDate()).toLocaleDateString('th-TH') : 'N/A'
        };
      });
      setActivities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (activityId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      await deleteDoc(doc(db, 'users', userId, 'completedActivities', activityId));
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <div>
                <Link href="/users" className="text-blue-500 hover:underline mb-2 block">&larr; กลับไปหน้าจัดการผู้ใช้</Link>
                <h1 className="text-3xl font-bold">จัดการกิจกรรมที่เข้าร่วม</h1>
            </div>
            <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มกิจกรรม
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อกิจกรรม</th>
                <th className="p-4">วันที่เข้าร่วม</th>
                <th className="p-4">ชั่วโมง</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.activityName}</td>
                  <td className="p-4 text-gray-600">{item.formattedDate}</td>
                  <td className="p-4 text-gray-600">{item.hours}</td>
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
      <CompletedActivityForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        activityToEdit={editingActivity}
        userId={userId}
      />
    </>
  );
}