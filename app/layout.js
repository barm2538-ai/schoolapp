"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
// ▼▼▼ แก้ไข import 2 บรรทัดนี้ ▼▼▼
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
// ▲▲▲ สิ้นสุดการแก้ไข ▲▲▲
import LoginPage from './login/page';
import "./globals.css";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <html lang="en">
        <body>
          <p className="flex min-h-screen items-center justify-center">Loading Auth State...</p>
        </body>
      </html>
    );
  }

  if (!user) {
    return (
      <html lang="en">
        <body>
          <LoginPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen"> {/* 1. กำหนดให้ความสูงเต็มจอ */}
          <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
            {/* ส่วนหัว (จะอยู่กับที่) */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Admin Panel</h2>
              <p className="text-sm text-gray-400 mb-8 break-words">{user.email}</p>
            </div>
            
            {/* 2. ส่วนของเมนู (จะเลื่อนได้) */}
            <nav className="flex-grow overflow-y-auto">
              <ul>
                <li className="mb-4"><Link href="/" className="hover:text-blue-300">จัดการประกาศ</Link></li>
                <li className="mb-4"><Link href="/activities" className="hover:text-blue-300">จัดการกิจกรรม</Link></li>
                <li className="mb-4"><Link href="/users" className="hover:text-blue-300">จัดการผู้ใช้</Link></li>
                <li className="mb-4"><Link href="/personnel" className="hover:text-blue-300">จัดการบุคลากร</Link></li>
                <li className="mb-4"><Link href="/school-info" className="hover:text-blue-300">จัดการข้อมูลสถานศึกษา</Link></li>
                <li className="mb-4"><Link href="/curriculum" className="hover:text-blue-300">จัดการหลักสูตร</Link></li>
                <li className="mb-4"><Link href="/learning-units" className="hover:text-blue-300">จัดการหน่วยจัดการเรียนรู้</Link></li>
                <li className="mb-4"><Link href="/learning-resources" className="hover:text-blue-300">จัดการแหล่งเรียนรู้</Link></li>
                <li className="mb-4"><Link href="/learning-media" className="hover:text-blue-300">จัดการสื่อการเรียนรู้</Link></li>
                <li className="mb-4"><Link href="/forms" className="hover:text-blue-300">จัดการแบบฟอร์ม</Link></li>
                <li className="mb-4"><Link href="/surveys" className="hover:text-blue-300">จัดการแบบประเมิน</Link></li>
                <li className="mb-4"><Link href="/contact-info" className="hover:text-blue-300">จัดการข้อมูลติดต่อ</Link></li>
                <li className="mb-4"><Link href="/courses" className="hover:text-blue-300">จัดการรายวิชา</Link></li>
                <li className="mb-4"><Link href="/exams" className="hover:text-blue-300">จัดการข้อสอบ</Link></li>
                <li className="mb-4"><Link href="/quiz-history" className="hover:text-blue-300">ประวัติคะแนนสอบ</Link></li>
                <li className="mb-4"><Link href="/bulk-registration" className="hover:text-blue-300">ลงทะเบียนกลุ่ม</Link></li>
                <li className="mb-4"><Link href="/bulk-add-activities" className="hover:text-blue-300">บันทึกกิจกรรมกลุ่ม</Link></li>
                <li className="mb-4"><Link href="/store" className="hover:text-blue-300">จัดการร้านค้า</Link></li>
                <li className="mb-4"><Link href="/store-categories" className="hover:text-blue-300">จัดการหมวดหมู่ร้านค้า</Link></li>
                <li className="mb-4"><Link href="/library" className="hover:text-blue-300">จัดการห้องสมุด</Link></li>
                <li className="mb-4"><Link href="/library-categories" className="hover:text-blue-300">จัดการหมวดหมู่ห้องสมุด</Link></li>
                <li className="mb-4"><Link href="/equipment" className="hover:text-blue-300">จัดการครุภัณฑ์</Link></li>
                <li className="mb-4"><Link href="/maintenance-requests" className="hover:text-blue-300">รายการแจ้งซ่อม</Link></li>
                <li className="mb-4"><Link href="/supervision-reports" className="hover:text-blue-300">รายการนิเทศ</Link></li>
                <li className="mb-4"><Link href="/teacher-leave" className="hover:text-blue-300">บันทึกการลา (ครู)</Link></li>
                <li className="mb-4"><Link href="/additional-links" className="hover:text-blue-300">จัดการเพิ่มเติม</Link></li>
                
              </ul>
            </nav>
            
            {/* ส่วนท้าย (จะอยู่กับที่) */}
            <div className="mt-auto pt-4 border-t border-gray-700">
              <button 
                onClick={() => auth.signOut()} 
                className="w-full text-left text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-gray-700"
              >
                ออกจากระบบ
              </button>
            </div>
          </aside>
          
          <main className="flex-1 p-12 bg-gray-50 flex justify-center overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}