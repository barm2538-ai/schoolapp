"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Link from 'next/link';

export default function UserStatsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // คำนวณสถิติ
  const stats = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin');
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');

    const teacherStats = teachers.map(teacher => {
      const myStudents = students.filter(s => s.teacherId === teacher.id);
      const primary = myStudents.filter(s => s.educationLevel === 'ประถม').length;
      const juniorHigh = myStudents.filter(s => s.educationLevel === 'มัธยมต้น').length;
      const seniorHigh = myStudents.filter(s => s.educationLevel === 'มัธยมปลาย').length;
      return {
        ...teacher,
        primaryCount: primary,
        juniorHighCount: juniorHigh,
        seniorHighCount: seniorHigh,
        totalStudents: myStudents.length,
      };
    });

    // ▼▼▼ 1. คำนวณยอดรวมทั้งหมด ▼▼▼
    const totals = teacherStats.reduce((acc, teacher) => {
        acc.primary += teacher.primaryCount;
        acc.juniorHigh += teacher.juniorHighCount;
        acc.seniorHigh += teacher.seniorHighCount;
        acc.allStudents += teacher.totalStudents;
        return acc;
    }, { primary: 0, juniorHigh: 0, seniorHigh: 0, allStudents: 0 });

    return { admins, teacherStats, totals };
  }, [users]);

  if (loading) return <p className="text-center p-8">กำลังคำนวณสถิติ...</p>;

  return (
    <div className="w-full max-w-6xl">
      <div className="flex items-center mb-8">
        <Link href="/users" className="text-blue-500 hover:underline mr-4">&larr; กลับ</Link>
        <h1 className="text-3xl font-bold">สถิติผู้ใช้งาน</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลครูและนักเรียนในสังกัด</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">ชื่อครู</th>
              <th className="p-4 text-center">ประถม</th>
              <th className="p-4 text-center">ม.ต้น</th>
              <th className="p-4 text-center">ม.ปลาย</th>
              <th className="p-4 text-center">รวม</th>
            </tr>
          </thead>
          <tbody>
            {stats.teacherStats.map(teacher => (
              <tr key={teacher.id} className="border-b">
                <td className="p-4 font-medium">{teacher.fullName || teacher.email}</td>
                <td className="p-4 text-center">{teacher.primaryCount}</td>
                <td className="p-4 text-center">{teacher.juniorHighCount}</td>
                <td className="p-4 text-center">{teacher.seniorHighCount}</td>
                <td className="p-4 text-center font-bold">{teacher.totalStudents}</td>
              </tr>
            ))}
          </tbody>
          {/* ▼▼▼ 2. เพิ่มส่วนท้ายตารางสำหรับแสดงผลรวม ▼▼▼ */}
          <tfoot>
            <tr className="bg-gray-200 font-bold">
                <td className="p-4">รวมทั้งสิ้น</td>
                <td className="p-4 text-center">{stats.totals.primary}</td>
                <td className="p-4 text-center">{stats.totals.juniorHigh}</td>
                <td className="p-4 text-center">{stats.totals.seniorHigh}</td>
                <td className="p-4 text-center">{stats.totals.allStudents}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">รายชื่อผู้ดูแลระบบ (Admin)</h2>
        <ul>
          {stats.admins.map(admin => (
            <li key={admin.id} className="p-2 border-b">{admin.fullName || admin.email}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}