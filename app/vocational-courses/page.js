"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import VocationalCourseForm from '../../components/VocationalCourseForm';
import { FiYoutube } from 'react-icons/fi'; // Import ไอคอน YouTube

export default function VocationalCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'vocationalCourses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?")) {
      await deleteDoc(doc(db, 'vocationalCourses', id));
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการหลักสูตรฝึกอาชีพ</h1>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มหลักสูตรใหม่
            </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อหลักสูตร</th>
                <th className="p-4">หมวดหมู่</th>
                <th className="p-4 text-center">วิดีโอ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.title}</td>
                  <td className="p-4 text-gray-600">{item.category}</td>
                  <td className="p-4 text-center">
                    {item.youtubeUrl && <FiYoutube className="text-red-500 mx-auto" size={20} />}
                  </td>
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
      <VocationalCourseForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        courseToEdit={editingCourse}
      />
    </>
  );
}