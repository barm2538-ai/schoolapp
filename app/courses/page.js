"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import CourseForm from '../../components/CourseForm';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // --- State ใหม่สำหรับค้นหาและกรอง ---
  const [filter, setFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'courses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Logic สำหรับกรองและค้นหา ---
  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (filter !== 'ทั้งหมด') {
      filtered = filtered.filter(c => c.educationLevel === filter);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        (c.subjectName && c.subjectName.toLowerCase().includes(lowercasedQuery)) ||
        (c.teacherName && c.teacherName.toLowerCase().includes(lowercasedQuery))
      );
    }
    return filtered;
  }, [courses, filter, searchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้?")) {
      await deleteDoc(doc(db, 'courses', id));
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

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">จัดการรายวิชา</h1>
            <button onClick={() => { setEditingCourse(null); setIsModalOpen(true); }} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มรายวิชาใหม่
            </button>
        </div>

        {/* --- UI สำหรับค้นหาและกรอง --- */}
        <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อวิชา หรือ ชื่อผู้สอน..."
            className="px-4 py-2 border rounded-lg flex-grow"
          />
          <div className="flex gap-2">
            {['ทั้งหมด', 'ประถม', 'มัธยมต้น', 'มัธยมปลาย'].map(level => (
              <button key={level} onClick={() => setFilter(level)} className={`px-3 py-1 rounded-full text-sm ${filter === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{level}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อรายวิชา</th>
                <th className="p-4">ผู้สอน</th>
                <th className="p-4">ระดับชั้น</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {/* --- แสดงผลจาก filteredCourses --- */}
              {filteredCourses.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.subjectName}</td>
                  <td className="p-4 text-gray-600">{item.teacherName}</td>
                  <td className="p-4 text-gray-600">{item.educationLevel}</td>
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
      <CourseForm 
        isOpen={isModalOpen}
        onClose={closeModal}
        courseToEdit={editingCourse}
      />
    </>
  );
}