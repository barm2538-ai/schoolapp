"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, collectionGroup, query, where, getDocs, orderBy, getDoc, doc, deleteDoc } from 'firebase/firestore';
import CertificateModal from '../../components/CertificateModal';

export default function CertificateHistoryPage() {
  const [activeTab, setActiveTab] = useState('internal');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('ทั้งหมด');
  const [schoolList, setSchoolList] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const findVal = (obj, keys) => {
    if (!obj) return null;
    for (let k of keys) { if (obj[k]) return obj[k]; }
    return null;
  };

  const enrichData = async (docSnap, collectionName) => {
      const data = docSnap.data();
      let finalConfig = data.certConfig || {};
      
      const examId = data.examId || data.quizId;

      if (examId) {
          try {
              const examSnap = await getDoc(doc(db, 'exams', examId));
              if (examSnap.exists()) {
                  const ed = examSnap.data();
                  finalConfig.certSchoolName = findVal(ed, ['certSchoolName', 'schoolName']) || finalConfig.certSchoolName;
                  finalConfig.certSignerName = findVal(ed, ['certSignerName', 'directorName']) || finalConfig.certSignerName;
                  finalConfig.certSignerPosition = findVal(ed, ['certSignerPosition', 'directorPosition']) || finalConfig.certSignerPosition;
                  finalConfig.certLogoUrl = findVal(ed, ['certLogoUrl', 'logoUrl']) || finalConfig.certLogoUrl;
                  finalConfig.certSignUrl = findVal(ed, ['certSignUrl', 'signatureUrl']) || finalConfig.certSignUrl;
                  finalConfig.certTitle = findVal(ed, ['certTitle', 'title']) || finalConfig.certTitle;
                  
                  // ★★★ เพิ่มบรรทัดนี้: ดึงข้อความขยายมาด้วย ★★★
                  finalConfig.certExtraText = findVal(ed, ['certExtraText', 'extraText', 'description']) || finalConfig.certExtraText;
              }
          } catch (e) { console.error("Err fetch exam:", e); }
      }

      const schoolName = finalConfig.certSchoolName || data.schoolName || "ไม่ระบุสถานศึกษา";
      
      let studentName = data.studentName || "ไม่ระบุชื่อ";
      if (collectionName === 'quizHistory' && !data.studentName) {
           const userRef = docSnap.ref.parent.parent;
           if (userRef) {
               try {
                   const uSnap = await getDoc(userRef);
                   if (uSnap.exists()) studentName = uSnap.data().fullName || uSnap.data().email;
               } catch(e) {}
           }
      }

      return {
          id: docSnap.id,
          fullPath: `${collectionName}/${docSnap.id}`,
          studentName,
          schoolName,
          examTitle: data.examTitle || data.courseTitle || "แบบทดสอบ",
          completedAt: data.completedAt || data.issuedDate,
          certConfig: finalConfig, 
          ...data
      };
  };

  const fetchData = async () => {
    setLoading(true);
    setHistoryData([]);
    setSchoolList([]);
    
    try {
      const schoolsSet = new Set();
      let queryRef;

      if (activeTab === 'internal') {
        queryRef = query(
          collectionGroup(db, 'quizHistory'),
          where('hasCertificate', '==', true),
          orderBy('completedAt', 'desc')
        );
      } else {
        queryRef = query(
          collection(db, 'history_certificates'),
          orderBy('issuedDate', 'desc')
        );
      }

      const snapshot = await getDocs(queryRef);
      const results = await Promise.all(snapshot.docs.map(d => 
          enrichData(d, activeTab === 'internal' ? 'quizHistory' : 'history_certificates')
      ));

      results.forEach(r => schoolsSet.add(r.schoolName));
      setHistoryData(results);
      setSchoolList(Array.from(schoolsSet));
      setSelectedSchool('ทั้งหมด');

    } catch (error) {
      console.error("Error:", error);
      if(error.message.includes('index')) alert("โปรดสร้าง Index ใน Firebase Console");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`ลบวุฒิบัตรของ "${item.studentName}"?`)) return;
    try {
        await deleteDoc(doc(db, item.fullPath));
        setHistoryData(prev => prev.filter(d => d.id !== item.id));
    } catch (e) { alert("ลบไม่สำเร็จ: " + e.message); }
  };

  const filteredData = useMemo(() => {
    if (selectedSchool === 'ทั้งหมด') return historyData;
    return historyData.filter(item => item.schoolName === selectedSchool);
  }, [selectedSchool, historyData]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-black">ประวัติผู้ได้รับวุฒิบัตร</h1>
        <div className="flex items-center gap-2">
          <label className="font-bold text-black whitespace-nowrap">เลือกสถานศึกษา:</label>
          <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className="px-4 py-2 border rounded-lg text-black shadow-sm">
            <option value="ทั้งหมด">-- แสดงทั้งหมด --</option>
            {schoolList.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex space-x-4 mb-4 border-b">
        <button onClick={() => setActiveTab('internal')} className={`pb-2 px-4 font-semibold ${activeTab === 'internal' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>👨‍🎓 นักเรียนในระบบ</button>
        <button onClick={() => setActiveTab('external')} className={`pb-2 px-4 font-semibold ${activeTab === 'external' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}>🌐 บุคคลภายนอก (Web)</button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-bold text-black">วันที่</th>
              <th className="p-4 font-bold text-black">ชื่อผู้เรียน</th>
              <th className="p-4 font-bold text-black">สถานศึกษา</th>
              <th className="p-4 font-bold text-black">หลักสูตร</th>
              <th className="p-4 font-bold text-black">ประเภท</th>
              <th className="p-4 text-center font-bold text-black">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (<tr><td colSpan="6" className="p-8 text-center">กำลังโหลด...</td></tr>) 
            : filteredData.length === 0 ? (<tr><td colSpan="6" className="p-8 text-center">ไม่พบข้อมูล</td></tr>) 
            : (filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {item.completedAt?.seconds ? new Date(item.completedAt.seconds * 1000).toLocaleDateString('th-TH') : (item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : '-')}
                  </td>
                  <td className="p-4 font-medium text-blue-600">{item.studentName}</td>
                  <td className="p-4 text-gray-600 text-sm">{item.schoolName}</td>
                  <td className="p-4 text-gray-800">{item.examTitle}</td>
                  <td className="p-4">{activeTab==='internal' ? <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded">In-App</span> : <span className="badge bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Guest</span>}</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => setSelectedCert(item)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">ดู</button>
                    <button onClick={() => handleDelete(item)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">ลบ</button>
                  </td>
                </tr>
            )))}
          </tbody>
        </table>
      </div>
      <CertificateModal isOpen={!!selectedCert} onClose={() => setSelectedCert(null)} data={selectedCert} />
    </div>
  );
}