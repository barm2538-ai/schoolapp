"use client";

import { useState, useEffect } from 'react';
import { db } from '../../../../firebaseConfig';
// 1. เพิ่ม getDocs และ getDoc เข้ามา
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import CourseRegistrationModal from '../../../../components/CourseRegistrationModal';

export default function ManageUserCoursesPage({ params }) {
  const { userId } = params;
  const [student, setStudent] = useState(null); // 2. State สำหรับเก็บข้อมูลนักศึกษา
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // 3. ดึงข้อมูลของนักศึกษาคนนี้
    const studentDocRef = doc(db, 'users', userId);
    const unsubscribeStudent = onSnapshot(studentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudent({ id: docSnap.id, ...docSnap.data() });
      }
    });

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
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการลงทะเบียนนี้?")) {
      await deleteDoc(doc(db, 'users', userId, 'enrolledCourses', courseId));
    }
  };

  // 4. แก้ไขฟังก์ชันนี้ให้ทำงานถูกต้อง
  const handleConfirmRegistration = async (selectedCourseIds) => {
    const allCoursesSnapshot = await getDocs(collection(db, 'courses'));
    const allCourses = allCoursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const courseId of selectedCourseIds) {
      const courseData = allCourses.find(c => c.id === courseId);
      if (courseData) {
        const registrationRef = doc(db, 'users', userId, 'enrolledCourses', courseId);
        await setDoc(registrationRef, {
          subjectName: courseData.subjectName || '',
          teacherName: courseData.teacherName || '',
        });
      }
    }
    setIsModalOpen(false);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
              <Link href="/users" className="text-blue-500 hover:underline mb-2 block">&larr; กลับไปหน้าจัดการผู้ใช้</Link>
              <h1 className="text-3xl font-bold">จัดการรายวิชาของ: <span className="text-blue-600">{student?.fullName}</span></h1>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            + ลงทะเบียนวิชาเพิ่ม
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">ชื่อรายวิชา</th>
                <th className="p-4">ผู้สอน</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourses.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 font-medium">{item.subjectName}</td>
                  <td className="p-4 text-gray-600">{item.teacherName}</td>
                  <td className="p-4">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CourseRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        student={student}
        enrolledCourseIds={enrolledCourses.map(c => c.id)}
      />
    </>
  );
}