"use client";

import { useState, useEffect, use } from 'react'; // ★ 1. เพิ่ม use
import { db } from '../../../../firebaseConfig'; // ★ 2. ถอย 4 ชั้น
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDocs, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaBookOpen } from 'react-icons/fa';
import CourseRegistrationModal from '../../../../components/CourseRegistrationModal'; // ★ 3. ถอย 4 ชั้น

export default function ManageUserCoursesPage({ params }) {
  // ★ 4. แก้การรับค่า params (ต้องแกะด้วย use)
  const { userId } = use(params);

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // ดึงชื่อนักเรียน
    const studentDocRef = doc(db, 'users', userId);
    const unsubscribeStudent = onSnapshot(studentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudent({ id: docSnap.id, ...docSnap.data() });
      }
    });

    // ดึงรายวิชา
    const q = collection(db, 'users', userId, 'enrolledCourses');
    const unsubscribeCourses = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEnrolledCourses(data);
      setLoading(false);
    });
    
    return () => {
      unsubscribeStudent();
      unsubscribeCourses();
    };
  }, [userId]);

  const handleDelete = async (courseId) => {
    if (window.confirm("ยืนยันการถอนรายวิชานี้?")) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'enrolledCourses', courseId));
      } catch (error) {
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    }
  };

  const handleConfirmRegistration = async (selectedCourseIds) => {
    try {
        const allCoursesSnapshot = await getDocs(collection(db, 'courses'));
        const allCourses = allCoursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const courseId of selectedCourseIds) {
            const courseData = allCourses.find(c => c.id === courseId);
            if (courseData) {
                const registrationRef = doc(db, 'users', userId, 'enrolledCourses', courseId);
                await setDoc(registrationRef, {
                    subjectName: courseData.subjectName || courseData.title || '',
                    teacherName: courseData.teacherName || '',
                    registeredAt: new Date()
                });
            }
        }
        setIsModalOpen(false);
        alert("ลงทะเบียนเรียบร้อย!");
    } catch (error) {
        alert("บันทึกไม่สำเร็จ: " + error.message);
    }
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
                <FaBookOpen className="text-indigo-600"/> จัดการรายวิชา: <span className="text-blue-600">{student?.fullName || "..."}</span>
            </h1>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm transition">
            <FaPlus /> ลงทะเบียนเพิ่ม
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-indigo-50 border-b border-indigo-100 text-indigo-900">
            <tr>
              <th className="p-4 font-semibold">ชื่อวิชา</th>
              <th className="p-4 font-semibold">ผู้สอน</th>
              <th className="p-4 font-semibold text-center w-[100px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrolledCourses.length === 0 ? (
                <tr><td colSpan="3" className="p-8 text-center text-gray-400">ยังไม่มีรายวิชาที่ลงทะเบียน</td></tr>
            ) : (
                enrolledCourses.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-800">{item.subjectName}</td>
                        <td className="p-4 text-gray-600">{item.teacherName || "-"}</td>
                        <td className="p-4 text-center">
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition" title="ถอนรายวิชา">
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <CourseRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        student={student}
        enrolledCourseIds={enrolledCourses.map(c => c.id)}
      />
    </div>
  );
}