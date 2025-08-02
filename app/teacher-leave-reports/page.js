"use client";
import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, collectionGroup } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherLeaveReportsPage() {
  const [teachers, setTeachers] = useState([]);
  const [allLeaveRecords, setAllLeaveRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงรายชื่อครูทั้งหมด
    const unsubTeachers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'teacher')), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // ดึงข้อมูลการลาทั้งหมดของครูทุกคน
    const unsubLeaves = onSnapshot(query(collectionGroup(db, 'teacherLeaveRecords')), (snapshot) => {
      setAllLeaveRecords(snapshot.docs.map(doc => doc.data()));
      setLoading(false);
    });

    return () => {
      unsubTeachers();
      unsubLeaves();
    };
  }, []);

  // ประมวลผลข้อมูลเพื่อคำนวณยอดรวมวันลาของครูแต่ละคน
  const teacherStats = useMemo(() => {
    return teachers.map(teacher => {
      const totalDays = allLeaveRecords
        .filter(record => record.teacherId === teacher.id)
        .reduce((sum, record) => sum + (record.leaveDays || 0), 0);
      return {
        ...teacher,
        totalLeaveDays: totalDays,
      };
    });
  }, [teachers, allLeaveRecords]);

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center mb-8">
        <Link href="/teacher-leave" className="text-blue-500 hover:underline mr-4">&larr; กลับ</Link>
        <h1 className="text-3xl font-bold">รายงานสรุปการลา (ครู)</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">ชื่อครู</th>
              <th className="p-4 text-center">จำนวนวันลาทั้งหมด (วัน)</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {teacherStats.map((teacher) => (
              <tr key={teacher.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{teacher.fullName || teacher.email}</td>
                <td className="p-4 text-center font-bold text-lg">{teacher.totalLeaveDays}</td>
                <td className="p-4 text-right">
                  <Link href={`/teacher-leave-reports/${teacher.id}`} className="text-blue-500 hover:underline">
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
