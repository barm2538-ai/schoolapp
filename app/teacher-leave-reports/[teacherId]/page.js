"use client";
import { useState, useEffect, useMemo } from 'react';
import { db } from '../../../firebaseConfig';
import { collection, query, onSnapshot, doc, where } from 'firebase/firestore';
import Link from 'next/link';

const LEAVE_TYPES = [
  'การลาป่วย', 'การลาคลอดบุตร', 'การลาไปช่วยเหลือภริยาที่คลอดบุตร', 'การลากิจส่วนตัว',
  'การลาพักผ่อน', 'การลาอุปสมบทหรือการไปประกอบพิธีฮัจย์', 'การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล',
  'การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน', 'การลาไปปฏิบัติงานในองค์การระหว่างประเทศ',
  'การลาติดตามคู่สมรส', 'การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ'
];

export default function TeacherLeaveDetailPage({ params }) {
  const { teacherId } = params;
  const [teacher, setTeacher] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() + 543);

  useEffect(() => {
    if (!teacherId) return;

    // ดึงข้อมูลของครู
    const unsubTeacher = onSnapshot(doc(db, 'users', teacherId), (docSnap) => {
      if (docSnap.exists()) {
        setTeacher(docSnap.data());
      }
    });

    // ดึงประวัติการลาของครูคนนี้
    const q = query(collection(db, 'teacherLeaveRecords'), where('teacherId', '==', teacherId));
    const unsubRecords = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubTeacher();
      unsubRecords();
    };
  }, [teacherId]);

  const stats = useMemo(() => {
    const year = fiscalYear - 543;
    const fiscalYearStart = new Date(year - 1, 9, 1); // 1 Oct
    const fiscalYearEnd = new Date(year, 8, 30); // 30 Sep

    const filteredRecords = records.filter(record => {
      const recordDate = record.startDate?.toDate();
      return recordDate && recordDate >= fiscalYearStart && recordDate <= fiscalYearEnd;
    });

    const dayCounts = LEAVE_TYPES.reduce((acc, type) => {
      acc[type] = filteredRecords
        .filter(r => r.leaveType === type)
        .reduce((sum, r) => sum + (r.leaveDays || 0), 0);
      return acc;
    }, {});

    const takenLeaveTypes = Object.entries(dayCounts)
      .filter(([type, days]) => days > 0)
      .map(([type, days]) => ({ type, days }));

    const totalDays = takenLeaveTypes.reduce((sum, item) => sum + item.days, 0);

    return { takenLeaveTypes, totalDays };
  }, [records, fiscalYear]);

  const availableYears = useMemo(() => {
    const years = new Set(records.map(r => {
        const date = r.startDate?.toDate();
        if (!date) return null;
        const year = date.getFullYear();
        const month = date.getMonth();
        return month >= 9 ? year + 1 : year;
    }));
    return Array.from(years).filter(Boolean).sort((a, b) => b - a);
  }, [records]);

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/teacher-leave-reports" className="text-blue-500 hover:underline mb-2 block">&larr; กลับไปหน้ารายงานสรุป</Link>
          <h1 className="text-3xl font-bold mt-2">รายละเอียดการลาของ: {teacher?.fullName || '...'}</h1>
        </div>
        <div className="flex items-center gap-4">
            <label>ปีงบประมาณ:</label>
            <select value={fiscalYear} onChange={(e) => setFiscalYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg bg-white">
              {availableYears.map(year => <option key={year} value={year + 543}>{year + 543}</option>)}
            </select>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">ประเภทการลา</th>
              <th className="p-4 text-center">จำนวน (วัน)</th>
            </tr>
          </thead>
          <tbody>
            {stats.takenLeaveTypes.map((item) => (
              <tr key={item.type} className="border-b">
                <td className="p-4 font-medium">{item.type}</td>
                <td className="p-4 text-center font-bold">{item.days}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold">
                <td className="p-4">รวมทั้งสิ้น</td>
                <td className="p-4 text-center">{stats.totalDays}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
