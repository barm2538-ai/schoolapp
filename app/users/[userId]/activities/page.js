"use client";

import { useState, useEffect, use } from 'react'; // ★ 1. เพิ่ม use
import { db } from '../../../../firebaseConfig'; // ★ 2. ถอย 4 ชั้น
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDoc } from 'firebase/firestore';
import CompletedActivityForm from '../../../../components/CompletedActivityForm'; // ★ 3. ถอย 4 ชั้น
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaRunning } from 'react-icons/fa';

export default function ManageUserActivitiesPage({ params }) {
  // ★ 4. แก้การรับค่า params
  const { userId } = use(params);

  const [studentName, setStudentName] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    // ดึงชื่อนักเรียน
    getDoc(doc(db, 'users', userId)).then(snap => {
        if(snap.exists()) {
            const data = snap.data();
            setStudentName(data.fullName || data.email);
        }
    });

    // ดึงกิจกรรม
    const q = query(collection(db, 'users', userId, 'completedActivities'), orderBy('completedDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          ...d,
          formattedDate: d.completedDate ? new Date(d.completedDate.toDate()).toLocaleDateString('th-TH') : '-'
        };
      });
      setActivities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleDelete = async (activityId) => {
    if (window.confirm("ยืนยันลบกิจกรรมนี้?")) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'completedActivities', activityId));
      } catch (e) { alert("ลบไม่สำเร็จ"); }
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

  if (loading) return <div className="p-10 text-center text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
        
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Link href="/users" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2 font-bold transition">
                <FaArrowLeft /> กลับไปหน้าจัดการผู้ใช้
            </Link>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaRunning className="text-pink-600"/> กิจกรรมของ: <span className="text-blue-600">{studentName}</span>
            </h1>
          </div>
          <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 flex items-center gap-2 shadow-sm transition">
             <FaPlus /> เพิ่มกิจกรรม
          </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-pink-50 border-b border-pink-100 text-pink-900">
            <tr>
              <th className="p-4 font-semibold">ชื่อกิจกรรม</th>
              <th className="p-4 font-semibold text-center">วันที่เข้าร่วม</th>
              <th className="p-4 font-semibold text-center">ชั่วโมง</th>
              <th className="p-4 font-semibold text-center w-[120px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {activities.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">ยังไม่มีข้อมูลกิจกรรม</td></tr>
             ) : (
                activities.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-800">{item.activityName}</td>
                        <td className="p-4 text-center text-gray-600">{item.formattedDate}</td>
                        <td className="p-4 text-center">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{item.hours} ชม.</span>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-2">
                            <button onClick={() => handleEdit(item)} className="text-yellow-600 hover:text-yellow-800 p-2 rounded hover:bg-yellow-50 transition" title="แก้ไข">
                                <FaEdit />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition" title="ลบ">
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))
             )}
          </tbody>
        </table>
      </div>

      <CompletedActivityForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        activityToEdit={editingActivity}
        userId={userId} 
      />
    </div>
  );
}