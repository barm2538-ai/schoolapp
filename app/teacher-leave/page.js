"use client";

import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collectionGroup, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function TeacherLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all' = รายการทั้งหมด, 'individual' = รายบุคคล
  const [selectedTeacherReport, setSelectedTeacherReport] = useState(null); // เก็บข้อมูลครูที่จะพิมพ์รายงาน

  useEffect(() => {
    const q = query(collectionGroup(db, 'teacherLeaveRecords'), orderBy('startDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fullPath: doc.ref.path
      }));
      setLeaves(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaves:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- ฟังก์ชันจัดการ ---
  const updateStatus = async (item, newStatus) => {
    try { await updateDoc(doc(db, item.fullPath), { status: newStatus }); } 
    catch (error) { alert("เกิดข้อผิดพลาด"); }
  };

  const handleDelete = async (item) => {
    if (!confirm(`ลบรายการของ ${item.teacherName}?`)) return;
    try { await deleteDoc(doc(db, item.fullPath)); } 
    catch (error) { alert("ลบไม่ได้"); }
  };

  // --- ฟังก์ชันจัดกลุ่มข้อมูลรายบุคคล ---
  const getIndividualStats = () => {
    const stats = {};
    leaves.forEach(leave => {
      const name = leave.teacherName || "ไม่ระบุชื่อ";
      const id = leave.userId || "unknown";
      
      if (!stats[id]) {
        stats[id] = { id, name, totalDays: 0, records: [], types: {} };
      }
      
      // นับเฉพาะที่อนุมัติแล้ว (หรือจะนับหมดก็ได้ตามนโยบาย)
      // ในที่นี้ขอนับหมด แต่แยกสถานะให้เห็นในรายงาน
      stats[id].totalDays += (leave.daysCount || 0);
      stats[id].records.push(leave);
      
      // แยกประเภท
      const type = leave.leaveType || "อื่นๆ";
      if (!stats[id].types[type]) stats[id].types[type] = 0;
      stats[id].types[type] += (leave.daysCount || 0);
    });
    return Object.values(stats);
  };

  // --- ฟังก์ชันสั่งพิมพ์ ---
  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-black">กำลังโหลดข้อมูล...</div>;

  // ================== หน้าพิมพ์รายงาน (Print View) ==================
  // ส่วนนี้จะแสดงทับหน้าจอทั้งหมดเมื่อเลือกดูรายงาน และใช้ CSS ซ่อนส่วนอื่นตอนสั่ง Print
  if (selectedTeacherReport) {
    const { name, totalDays, records, types } = selectedTeacherReport;
    const approvedRecords = records.filter(r => r.status === 'approved');
    
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
        {/* ปุ่มย้อนกลับ (ไม่พิมพ์) */}
        <div className="no-print p-4 bg-white shadow flex justify-between items-center mb-4">
          <button onClick={() => setSelectedTeacherReport(null)} className="text-gray-600 hover:text-black flex items-center font-bold">
            ← ย้อนกลับ
          </button>
          <div className="flex gap-4">
             <h2 className="text-xl font-bold text-black">ตัวอย่างก่อนพิมพ์</h2>
             <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 font-bold">
               🖨️ ปริ้นท์รายงาน
             </button>
          </div>
        </div>

        {/* กระดาษรายงาน A4 */}
        <div className="print-area bg-white max-w-[210mm] mx-auto p-[20mm] shadow-lg min-h-[297mm] text-black">
          
          {/* หัวรายงาน */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">สรุปสถิติการลาของบุคลากร</h1>
            <p className="text-lg">ประจำปีการศึกษา 2568</p>
          </div>

          {/* ข้อมูลส่วนตัว */}
          <div className="mb-6 border-b-2 border-black pb-4">
            <div className="flex justify-between text-lg mb-2">
              <span><strong>ชื่อ-สกุล:</strong> {name}</span>
              <span><strong>รวมวันลาทั้งสิ้น:</strong> {totalDays} วัน</span>
            </div>
          </div>

          {/* ตารางสรุปประเภท */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 border-l-4 border-black pl-2">สรุปตามประเภทการลา</h3>
            <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-gray-50">
              {Object.entries(types).map(([type, days]) => (
                <div key={type} className="flex justify-between border-b pb-1">
                  <span>{type}</span>
                  <span className="font-bold">{days} วัน</span>
                </div>
              ))}
            </div>
          </div>

          {/* ตารางประวัติละเอียด */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2 border-l-4 border-black pl-2">รายการลาทั้งหมด</h3>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-center">วันที่ลา</th>
                  <th className="border border-black p-2 text-center">ประเภท</th>
                  <th className="border border-black p-2 text-center">จำนวนวัน</th>
                  <th className="border border-black p-2">เหตุผล</th>
                  <th className="border border-black p-2 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i}>
                    <td className="border border-black p-2 text-center whitespace-nowrap">
                      {rec.startDate} {rec.endDate !== rec.startDate ? ` - ${rec.endDate}` : ''}
                    </td>
                    <td className="border border-black p-2 text-center">{rec.leaveType}</td>
                    <td className="border border-black p-2 text-center">{rec.daysCount}</td>
                    <td className="border border-black p-2">{rec.reason || "-"}</td>
                    <td className="border border-black p-2 text-center">
                      {rec.status === 'approved' ? 'อนุมัติ' : rec.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ส่วนลายเซ็น (Footer) */}
          <div className="mt-16 flex justify-between items-end break-inside-avoid">
            <div className="text-center">
              <p>ลงชื่อ .......................................................</p>
              <p className="mt-2">({name})</p>
              <p>ผู้ขอรับรอง</p>
            </div>
            <div className="text-center">
              <p>ลงชื่อ .......................................................</p>
              <p className="mt-2">( ....................................................... )</p>
              <p>ผู้บริหารสถานศึกษา</p>
            </div>
          </div>

        </div>

        {/* CSS สำหรับการพิมพ์ (ซ่อนทุกอย่างยกเว้น print-area) */}
        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; }
            .no-print { display: none !important; }
            @page { margin: 10mm; size: A4; }
          }
        `}</style>
      </div>
    );
  }

  // ================== หน้าจอหลัก (Dashboard) ==================
  const counts = {
    pending: leaves.filter(l => l.status === 'pending').length,
    total: leaves.length
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      
      {/* Header & Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">ระบบจัดการการลา</h1>
          <p className="text-gray-600">มีรายการรออนุมัติ <span className="text-red-500 font-bold">{counts.pending}</span> รายการ</p>
        </div>
        
        {/* ปุ่มสลับโหมด */}
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-md font-bold transition ${viewMode === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            📋 รายการทั้งหมด
          </button>
          <button 
            onClick={() => setViewMode('individual')}
            className={`px-4 py-2 rounded-md font-bold transition ${viewMode === 'individual' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            👤 สรุปรายบุคคล (พิมพ์)
          </button>
        </div>
      </div>

      {/* --- โหมด 1: รายการทั้งหมด (ตารางเดิม) --- */}
      {viewMode === 'all' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-bold text-black">ชื่อ-สกุล</th>
                <th className="p-4 font-bold text-black">ประเภท</th>
                <th className="p-4 font-bold text-black">วันที่ลา</th>
                <th className="p-4 font-bold text-black">วัน</th>
                <th className="p-4 text-center font-bold text-black">สถานะ</th>
                <th className="p-4 text-center font-bold text-black">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaves.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{item.teacherName}</td>
                  <td className="p-4 text-black">{item.leaveType}</td>
                  <td className="p-4 text-gray-600">
                    {item.startDate} {item.endDate && item.endDate !== item.startDate ? ` - ${item.endDate}` : ''}
                  </td>
                  <td className="p-4 text-black">{item.daysCount}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'approved' ? 'อนุมัติ' : item.status === 'rejected' ? 'ไม่อนุมัติ' : 'รอพิจารณา'}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(item, 'approved')} className="text-green-600 hover:underline text-sm">✔</button>
                        <button onClick={() => updateStatus(item, 'rejected')} className="text-red-600 hover:underline text-sm">✘</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(item)} className="text-gray-400 hover:text-red-500 ml-2">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- โหมด 2: สรุปรายบุคคล (ตารางใหม่) --- */}
      {viewMode === 'individual' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getIndividualStats().map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500 hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-black mb-2">{person.name}</h3>
              <div className="flex justify-between items-end mb-4">
                <div className="text-gray-600 text-sm">
                  <p>ลาป่วย: <b>{person.types['ลาป่วย'] || 0}</b> วัน</p>
                  <p>ลากิจ: <b>{person.types['ลากิจ'] || 0}</b> วัน</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">รวมทั้งหมด</p>
                  <p className="text-3xl font-bold text-blue-600">{person.totalDays} <span className="text-sm font-normal">วัน</span></p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacherReport(person)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-blue-700 font-bold py-2 rounded mt-2 flex justify-center items-center gap-2"
              >
                📄 ดูรายงาน & พิมพ์
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}