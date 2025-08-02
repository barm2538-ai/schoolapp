"use client";
import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
// 1. เพิ่ม doc และ deleteDoc เข้ามา
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { FiPrinter } from 'react-icons/fi';

export default function SupervisionReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'supervisionReports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. สร้างฟังก์ชันสำหรับลบข้อมูล
  const handleDelete = async (reportId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกการนิเทศนี้?")) {
      try {
        await deleteDoc(doc(db, 'supervisionReports', reportId));
        alert("ลบข้อมูลสำเร็จ");
      } catch (error) {
        console.error("Error deleting report: ", error);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  const filteredReports = useMemo(() => {
    if (yearFilter === 'all') return reports;
    return reports.filter(r => new Date(r.createdAt?.toDate()).getFullYear() == yearFilter);
  }, [reports, yearFilter]);

  const availableYears = useMemo(() => {
    const years = new Set(reports.map(r => new Date(r.createdAt?.toDate()).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [reports]);

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div className="w-full max-w-6xl" id="report-page">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-3xl font-bold">รายการนิเทศทั้งหมด</h1>
        <div className="flex items-center gap-4">
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="px-3 py-2 border rounded-lg bg-white">
            <option value="all">ปี พ.ศ. ทั้งหมด</option>
            {availableYears.map(year => <option key={year} value={year}>{year + 543}</option>)}
          </select>
          <button onClick={() => window.print()} className="p-2 bg-gray-600 text-white rounded-lg"><FiPrinter size={20} /></button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">เรื่องที่นิเทศ</th>
              <th className="p-4">ผู้บันทึก</th>
              <th className="p-4">วันที่</th>
              <th className="p-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-4 font-medium">{item.supervisionTopic}</td>
                <td className="p-4">{item.supervisorName}</td>
                <td className="p-4">{new Date(item.createdAt?.toDate()).toLocaleDateString('th-TH')}</td>
                {/* 3. เพิ่มปุ่มลบเข้ามา */}
                <td className="p-4 whitespace-nowrap">
                  <Link href={`/supervision-reports/${item.id}`} className="text-blue-500 hover:underline mr-4">
                    ดูรายละเอียด
                  </Link>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}