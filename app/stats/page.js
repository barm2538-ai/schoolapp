"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig'; 
import { collection, getDocs, query, orderBy, writeBatch } from 'firebase/firestore';
import { FaPrint, FaCalendarAlt, FaTrash, FaUndo, FaChartPie, FaEye, FaFire } from 'react-icons/fa';

// ชื่อภาษาไทย
const PAGE_NAMES = {
    'App_Additional_Links': '📱 หน้าลิงก์เพิ่มเติม',
    'App_Certificates': '📱 หน้าจัดการวุฒิบัตร',
    'App_About_Developer': '📱 เกี่ยวกับผู้พัฒนา',
    'App_contactInfo': '📱 ช่องทางการติดต่อ',
    'App_schoolInfo': '📱 ข้อมูลสถานศึกษา', 
    'App_store': '📱 ร้านค้า',
    'App_book': '📱 ห้องสมุด',
    'App_Learning_Resources_Map': '📱 แหล่งเรียนรู้',
    'App_learningMedia': '📱 สื่อการเรียนรู้',
    'App_person': '📱 ข้อมูลบุคลากร',
    'App_curr': '📱 โครงสร้างหลักสูตร',
    'App_form': '📱 แบบฟอร์มต่างๆ',
    'App_sur': '📱 ประเมินความพึงพอใจ',
    'App_unit': '📱 หน่วยจัดการเรียนรู้',
    'App_gui': '📱 ห้องแนะแนว',
    'App_voc': '📱 หลักสูตรฝึกอาชีพ',
    'App_part': '📱 ภาคีเครือข่าย',
    'App_post': '📱 ชุมชนแห่งการเรียนรู้',
    'App_maint': '📱 แจ้งซ่อม',
    'App_superv': '📱 นิเทศ',
    'App_home': '📱 หน้าหลัก',
    'App_exam': '📱 การสอบทดวัดและประเมินผลรูปแบบออนไลน์',
    'App_perinfo': '📱 ข้อมูลส่วนตัว',

};

export default function StatsPage() {
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [yearList, setYearList] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "page_stats"), orderBy("views", "desc"));
      const querySnapshot = await getDocs(q);
      const items = [];
      const years = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, ...data });
        if (data.year) years.add(data.year.toString());
      });

      setStatsData(items);
      setYearList(Array.from(years).sort().reverse());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => setSelectedYear('All');

  const handleClearAllStats = async () => {
      if (!window.confirm("⚠️ ยืนยันล้างสถิติทั้งหมดเป็น 0?")) return;
      setLoading(true);
      try {
          const q = query(collection(db, "page_stats"));
          const snapshot = await getDocs(q);
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          setStatsData([]);
      } catch (error) { alert("Error"); } 
      finally { setLoading(false); }
  };

  const processedData = useMemo(() => {
    let filtered = statsData;
    if (selectedYear !== 'All') {
      filtered = statsData.filter(item => item.year.toString() === selectedYear);
    } else {
        const merged = {};
        statsData.forEach(item => {
            const name = item.page;
            merged[name] = (merged[name] || 0) + item.views;
        });
        filtered = Object.keys(merged).map(key => ({ page: key, views: merged[key] })).sort((a, b) => b.views - a.views);
    }
    const totalViews = filtered.reduce((sum, item) => sum + item.views, 0);
    return { list: filtered, total: totalViews };
  }, [selectedYear, statsData]);

  const getDisplayName = (code) => PAGE_NAMES[code] || code;

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 min-h-screen print:bg-white print:p-0">
      
      {/* CSS สำหรับการพิมพ์ */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-header { display: block !important; margin-bottom: 20px; text-align: center; }
          /* ซ่อนเงาและขอบตอนปริ้นท์ให้ดูสะอาด */
          .print-clean { border: 1px solid #ddd !important; box-shadow: none !important; border-radius: 0 !important; }
          /* ให้ตารางเต็มความกว้าง */
          .print-full { width: 100% !important; max-width: none !important; }
        }
        .print-header { display: none; }
      `}</style>

      {/* === HEADER (ส่วนบนสุด) === */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 no-print">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaChartPie className="text-blue-600" /> สถิติการเข้าชม
        </h1>

        <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* ปุ่มล้างค่า */}
            <button onClick={handleClearAllStats} className="px-3 py-2 bg-white text-red-500 rounded-lg border border-red-200 text-sm hover:bg-red-50 flex items-center gap-1 shadow-sm">
                <FaTrash /> ล้างค่า
            </button>

            {/* ตัวกรองปี */}
            <div className="flex items-center gap-2 border px-3 py-2 rounded-lg bg-white shadow-sm">
                <FaCalendarAlt className="text-gray-500" />
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-transparent outline-none text-gray-700 font-medium cursor-pointer">
                    <option value="All">รวมทุกปี</option>
                    {yearList.map(y => <option key={y} value={y}>ปี {y}</option>)}
                </select>
                <button onClick={resetFilter} disabled={selectedYear === 'All'} className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 ml-2">
                    <FaUndo />
                </button>
            </div>

            {/* ★ ปุ่มพิมพ์รายงาน ★ */}
            <button onClick={() => window.print()} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md transition transform hover:scale-105">
                <FaPrint /> พิมพ์รายงาน
            </button>
        </div>
      </div>

      {/* === CARDS (กล่องสวยๆ ที่คุณต้องการ) === */}
      {/* ใส่ class no-print เพื่อไม่ให้ติดไปตอนสั่งพิมพ์กระดาษ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
        
        {/* Card 1: Total Views */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10"><FaEye size={80} /></div>
            <div className="relative z-10">
                <div className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">ยอดเข้าชมรวม (Total Views)</div>
                <div className="text-5xl font-extrabold my-2">{loading ? '...' : processedData.total.toLocaleString()}</div>
                <div className="text-sm text-blue-200 bg-white/20 inline-block px-2 py-1 rounded">
                    {selectedYear === 'All' ? 'ตั้งแต่เริ่มระบบ' : `เฉพาะปี ${selectedYear}`}
                </div>
            </div>
        </div>
        
        {/* Card 2: Most Popular Page */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-4 top-4 text-orange-100"><FaFire size={100} /></div>
            <div className="relative z-10">
                <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FaFire className="text-orange-500" /> หน้าที่ได้รับความนิยมสูงสุด
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-3xl font-bold text-gray-800 truncate max-w-lg">
                        {processedData.list.length > 0 ? getDisplayName(processedData.list[0].page) : '-'}
                    </div>
                    {processedData.list.length > 0 && (
                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-lg font-bold shadow-sm border border-green-200">
                            {processedData.list[0].views.toLocaleString()} views
                        </span>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* === ส่วนหัวกระดาษ (แสดงเฉพาะตอนปริ้นท์) === */}
      <div className="print-header">
          <h1 className="text-2xl font-bold text-center mb-2">รายงานสรุปยอดการเข้าชมเว็บไซต์/แอปพลิเคชัน</h1>
          <p className="text-center text-gray-500">ข้อมูลประจำปี: {selectedYear === 'All' ? 'ทั้งหมด (All Time)' : selectedYear} | พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')}</p>
          <hr className="my-4 border-black"/>
      </div>

      {/* === TABLE (ตารางข้อมูล) === */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print-clean print-full">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="p-4 font-bold text-gray-700 border-r border-gray-200 w-[70%] pl-6">หน้า / ส่วนงาน (Page Name)</th>
                    <th className="p-4 font-bold text-gray-700 text-right pr-6">จำนวนเข้าชม (Views)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan="2" className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td></tr>
                ) : processedData.list.length === 0 ? (
                    <tr><td colSpan="2" className="p-8 text-center text-gray-500">ไม่มีข้อมูลสถิติ</td></tr>
                ) : (
                    processedData.list.map((item, index) => (
                        <tr key={index} className="hover:bg-blue-50 transition">
                            <td className="p-4 border-r border-gray-100 text-gray-800 font-medium pl-6 text-lg">
                                {/* จุดสีหน้าหัวข้อ */}
                                <span className={`inline-block w-2 h-2 rounded-full mr-3 mb-0.5 ${index < 3 ? 'bg-orange-500' : 'bg-gray-300'}`}></span>
                                {getDisplayName(item.page)}
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600 pr-6 text-lg">
                                {item.views.toLocaleString()}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
             {/* ยอดรวมท้ายตาราง */}
            {processedData.list.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                        <td className="p-4 font-bold text-gray-800 border-r border-gray-200 text-right pr-4">รวมยอดเข้าชมทั้งหมด</td>
                        <td className="p-4 text-right font-extrabold text-black text-xl pr-6">
                            {processedData.total.toLocaleString()}
                        </td>
                    </tr>
                </tfoot>
            )}
        </table>
      </div>
      
    </div>
  );
}