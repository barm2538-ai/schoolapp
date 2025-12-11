"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, query } from 'firebase/firestore';
import { FaChalkboardTeacher, FaChartPie, FaUserShield } from 'react-icons/fa';
import Link from 'next/link';

export default function UserStatsPage() {
  const [loading, setLoading] = useState(true);
  const [teacherStats, setTeacherStats] = useState([]);
  const [adminList, setAdminList] = useState([]); 
  const [totals, setTotals] = useState({ primary: 0, junior: 0, senior: 0, all: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      
      const teachersMap = {}; // เก็บข้อมูลครู (key=id)
      const admins = [];
      let studentData = [];

      // 1. แยกแยะประเภทผู้ใช้
      snapshot.forEach(doc => {
        const u = { id: doc.id, ...doc.data() };
        
        // ถ้าเป็นครู ให้สร้างช่องเก็บข้อมูลรอไว้
        if (u.role === 'teacher') {
            teachersMap[u.id] = { 
                name: u.fullName || u.email, 
                primary: 0, junior: 0, senior: 0, total: 0 
            };
        } else if (u.role === 'admin' || u.role === 'director') {
            admins.push(u);
        } else if (u.role === 'student') {
            studentData.push(u);
        }
      });

      // 2. วนลูปนับยอดนักเรียน ใส่ให้ครูแต่ละคน
      studentData.forEach(s => {
          // เช็คว่านักเรียนมีครูไหม และครูคนนั้นมีอยู่ในระบบไหม
          if (s.teacherId && teachersMap[s.teacherId]) {
              const t = teachersMap[s.teacherId];
              t.total++;

              // ★★★ แก้ไขเงื่อนไขการนับตรงนี้ (ให้ตรงกับ DB เป๊ะๆ) ★★★
              // ต้องใช้ชื่อเต็ม "ระดับ..." ตามที่เห็นในหน้า Users
              if (s.educationLevel === 'ประถม') {
                  t.primary++;
              } else if (s.educationLevel === 'มัธยมต้น') {
                  t.junior++;
              } else if (s.educationLevel === 'มัธยมปลาย') {
                  t.senior++;
              }
              // (กศน. หรืออื่นๆ จะถูกนับรวมใน total แต่ไม่ลงช่องย่อย)
          }
      });

      // 3. คำนวณยอดรวมทั้งหมด (Footer)
      const totalStat = { primary: 0, junior: 0, senior: 0, all: 0 };
      const statsArray = Object.values(teachersMap);
      
      statsArray.forEach(t => {
          totalStat.primary += t.primary;
          totalStat.junior += t.junior;
          totalStat.senior += t.senior;
          totalStat.all += t.total;
      });

      setTeacherStats(statsArray);
      setTotals(totalStat);
      setAdminList(admins);

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartPie className="text-blue-600" /> สถิติผู้ใช้งาน (แยกตามครู)
        </h1>
        <Link href="/admin/users" className="text-blue-600 hover:underline font-medium">
            ⬅ กลับไปหน้าจัดการผู้ใช้
        </Link>
      </div>

      {/* --- ตารางที่ 1: ข้อมูลครูและนักเรียนในสังกัด --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">ข้อมูลครูและนักเรียนในสังกัด</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-white border-b text-gray-500 text-sm">
                <tr>
                    <th className="p-4 w-1/3">ชื่อครู</th>
                    <th className="p-4 text-center">ประถม</th>
                    <th className="p-4 text-center">ม.ต้น</th>
                    <th className="p-4 text-center">ม.ปลาย</th>
                    <th className="p-4 text-center font-bold text-black">รวม</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
                {loading ? (
                    <tr><td colSpan="5" className="p-6 text-center">กำลังประมวลผล...</td></tr>
                ) : teacherStats.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-400">ไม่มีข้อมูลครู</td></tr>
                ) : (
                    teacherStats.map((t, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-medium text-gray-800">{t.name}</td>
                            
                            {/* แสดงตัวเลข (ถ้าเป็น 0 ให้เป็นสีเทาจางๆ) */}
                            <td className={`p-4 text-center ${t.primary > 0 ? 'text-black' : 'text-gray-300'}`}>{t.primary}</td>
                            <td className={`p-4 text-center ${t.junior > 0 ? 'text-black' : 'text-gray-300'}`}>{t.junior}</td>
                            <td className={`p-4 text-center ${t.senior > 0 ? 'text-black' : 'text-gray-300'}`}>{t.senior}</td>
                            
                            <td className="p-4 text-center font-bold text-blue-600">{t.total}</td>
                        </tr>
                    ))
                )}
            </tbody>
            {/* Footer: ยอดรวมทั้งสิ้น */}
            <tfoot className="bg-gray-100 font-bold text-gray-800">
                <tr>
                    <td className="p-4">รวมทั้งสิ้น</td>
                    <td className="p-4 text-center">{totals.primary}</td>
                    <td className="p-4 text-center">{totals.junior}</td>
                    <td className="p-4 text-center">{totals.senior}</td>
                    <td className="p-4 text-center text-blue-700 text-lg">{totals.all}</td>
                </tr>
            </tfoot>
        </table>
      </div>

      {/* --- ตารางที่ 2: รายชื่อผู้ดูแลระบบ (Admin) --- */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">รายชื่อผู้ดูแลระบบ (Admin / Director)</h3>
        </div>
        <div className="p-0">
            {adminList.length === 0 ? (
                <div className="p-6 text-center text-gray-400">ไม่พบข้อมูล Admin</div>
            ) : (
                <ul className="divide-y divide-gray-100">
                    {adminList.map((admin, i) => (
                        <li key={i} className="p-4 flex items-center gap-3 hover:bg-gray-50">
                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <FaUserShield />
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">{admin.fullName || "Admin"}</div>
                                <div className="text-sm text-gray-500">{admin.email} ({admin.role})</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>

    </div>
  );
}