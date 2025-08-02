"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import TeacherLeaveForm from '../../components/TeacherLeaveForm';
import Link from 'next/link'; // ▼▼▼ เพิ่มบรรทัดนี้เข้ามา ▼▼▼

export default function TeacherLeavePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'teacherLeaveRecords'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
      setLoading(false);
    },
    (error) => {
      console.error("Firestore Error:", error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล!");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (recordId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการลานี้?")) {
      await deleteDoc(doc(db, 'teacherLeaveRecords', recordId));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
              <Link href="/teacher-leave-reports" className="bg-gray-500 text-white px-4 py-2 rounded mr-4 hover:bg-gray-600">
                ดูรายงานสรุป
              </Link>
            <h1 className="text-3xl font-bold">บันทึกการลา (ครู)</h1>
            <button onClick={() => { setEditingRecord(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + บันทึกการลาใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อครู</th>
                <th className="p-4">ประเภทการลา</th>
                <th className="p-4">วันที่ลา</th>
                <th className="p-4 text-center">จำนวนวัน</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {records.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.teacherName}</td>
                  <td className="p-4 text-gray-600">{item.leaveType}</td>
                  <td className="p-4 text-gray-600">
                    {item.startDate && new Date(item.startDate.toDate()).toLocaleDateString('th-TH')} - {item.endDate && new Date(item.endDate.toDate()).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4 text-center">{item.leaveDays}</td>
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
      <TeacherLeaveForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        recordToEdit={editingRecord}
      />
    </>
  );
}
