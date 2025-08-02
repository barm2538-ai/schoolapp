"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { FiPrinter } from 'react-icons/fi'; // 1. import ไอคอน

// Component ย่อยสำหรับแสดงแต่ละหัวข้อ
const DetailRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{value}</dd>
    </div>
  );
};

export default function SupervisionReportDetailPage({ params }) {
  const { reportId } = params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'supervisionReports', reportId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setReport(docSnap.data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [reportId]);

  if (loading) return <p>กำลังโหลด...</p>;
  if (!report) return <p>ไม่พบข้อมูล</p>;

  return (
    <div className="w-full max-w-4xl" id="report-page">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Link href="/supervision-reports" className="text-blue-500 hover:underline">&larr; กลับไปหน้ารายการ</Link>
        {/* 2. เพิ่มปุ่มปริ้นเข้ามา */}
        <button onClick={() => window.print()} className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          <FiPrinter size={20} />
        </button>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{report.supervisionTopic}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">บันทึกโดย: {report.supervisorName}</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <DetailRow label="สภาพที่พบ: ปัจจัยป้อน" value={report.findings_input} />
            <DetailRow label="สภาพที่พบ: กระบวนการ" value={report.findings_process} />
            <DetailRow label="สภาพที่พบ: ผลผลิต/ผลลัพธ์" value={report.findings_output} />
            <DetailRow label="ปัจจัยที่ส่งผลต่อความสำเร็จ" value={report.successFactors} />
            <DetailRow label="ปัญหาอุปสรรค" value={report.obstacles} />
            <DetailRow label="ข้อนิเทศต่อผู้รับการนิเทศ" value={report.suggestions_recipient} />
            <DetailRow label="ข้อเสนอแนะต่อสถานศึกษา" value={report.suggestions_school} />
            <DetailRow label="ข้อเสนอแนะต่อสำนักงาน สกร.ฯ" value={report.suggestions_province} />
            <DetailRow label="ข้อเสนอแนะต่อกรมส่งเสริมการเรียนรู้" value={report.suggestions_department} />
            <DetailRow label="Best Practice" value={report.bestPractice} />
          </dl>
        </div>
      </div>
    </div>
  );
}