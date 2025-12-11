"use client";

import { useState } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaTimes, FaFileUpload, FaDownload, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function UserImportModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // รายชื่อระดับชั้นที่ถูกต้อง (System Standard)
  const validLevels = [
      'ระดับประถมศึกษา',
      'ระดับมัธยมศึกษาตอนต้น',
      'ระดับมัธยมศึกษาตอนปลาย',
      'กศน.'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLogs([]);
    }
  };

  // ★★★ ฟังก์ชันโหลด Template (แก้ภาษาต่างดาวใน Excel) ★★★
  const downloadTemplate = () => {
      // \uFEFF คือ BOM (Byte Order Mark) บอก Excel ว่าไฟล์นี้เป็น UTF-8
      const csvContent = "\uFEFF" + "email,password,fullName,role,studentId,educationLevel,phoneNumber\n"
          + "student01@demo.com,123456,ด.ช.มานะ ใจดี,student,66001,ระดับประถมศึกษา,0812345678\n"
          + "student02@demo.com,123456,น.ส.มานี มีตา,student,66002,ระดับมัธยมศึกษาตอนต้น,0899999999\n"
          + "teacher01@demo.com,123456,ครูสมศรี,teacher,,,0811112222";
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "user_import_template.csv");
      document.body.appendChild(link);
      link.click();
  };

  const handleUpload = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ CSV ก่อนครับ");

    setLoading(true);
    setLogs([]);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split(/\r\n|\n/);
      
      let successCount = 0;
      let failCount = 0;
      let newLogs = [];

      // เริ่มที่ i=1 เพื่อข้าม Header
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        // แยกคอลัมน์ (รองรับการตัด Comma พื้นฐาน)
        const cols = row.split(',').map(c => c.trim());
        if (cols.length < 3) continue; // ข้อมูลไม่ครบข้ามไป

        // ลำดับคอลัมน์ต้องตรงกับ Template
        const [email, password, fullName, role, studentId, eduLevelRaw, phoneNumber] = cols;
        
        const userEmail = email;
        const userPass = password || "123456";
        const userRole = role ? role.toLowerCase() : "student";

        try {
          // 1. สร้าง User ใน Auth
          const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPass);
          const uid = userCredential.user.uid;

          // 2. เตรียมข้อมูล
          const userData = {
            email: userEmail,
            fullName: fullName || "ไม่ระบุชื่อ",
            role: userRole,
            phoneNumber: phoneNumber || "",
            isApproved: true, 
            createdAt: serverTimestamp()
          };

          // 3. จัดการข้อมูลเฉพาะนักเรียน
          if (userRole === 'student') {
             userData.studentId = studentId || "";
             
             // ★ Logic ตรวจสอบระดับชั้น ★
             // ถ้าในไฟล์พิมพ์มาผิด หรือไม่ตรง ให้ปัดเป็น "ระดับประถมศึกษา" ไว้ก่อน
             let finalLevel = eduLevelRaw;
             if (!validLevels.includes(eduLevelRaw)) {
                 finalLevel = 'ระดับประถมศึกษา'; 
                 // หรือจะเลือกเก็บค่าเดิมก็ได้ แต่ dropdown ในหน้าแก้ไขอาจจะไม่โชว์
             }
             userData.educationLevel = finalLevel;
             
             // ครูต้องมาเลือกทีหลังในระบบ
             userData.teacherId = null;
             userData.teacherName = null;
          } else {
             userData.studentId = null;
             userData.educationLevel = null;
          }

          // 4. บันทึกลง Firestore
          await setDoc(doc(db, "users", uid), userData);

          newLogs.push({ status: 'success', msg: `✅ ${userEmail}: เพิ่มสำเร็จ` });
          successCount++;

        } catch (error) {
          let errMsg = error.message;
          if (error.code === 'auth/email-already-in-use') errMsg = "อีเมลซ้ำ";
          newLogs.push({ status: 'error', msg: `❌ ${userEmail}: ${errMsg}` });
          failCount++;
        }
      }

      setLogs(newLogs);
      setLoading(false);
      alert(`ประมวลผลเสร็จสิ้น: สำเร็จ ${successCount} / ล้มเหลว ${failCount}`);
      
      if (failCount === 0 && successCount > 0) {
          setTimeout(() => {
             onClose();
             window.location.reload();
          }, 1500);
      }
    };

    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
            <h3 className="font-bold text-green-800 text-lg flex items-center gap-2">
                <FaFileUpload /> ลงทะเบียนกลุ่ม (Import CSV)
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={20}/></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
            
            {/* ส่วนดาวน์โหลด Template */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-gray-700">📌 รูปแบบไฟล์ CSV:</p>
                    <button onClick={downloadTemplate} className="text-blue-600 hover:underline flex items-center gap-1 font-bold bg-white px-3 py-1 rounded border border-blue-200 text-xs">
                        <FaDownload /> โหลดไฟล์ตัวอย่าง
                    </button>
                </div>
                <code className="block bg-black text-white p-2 rounded mb-3 text-xs overflow-x-auto">
                    email, password, fullName, role, studentId, educationLevel, phoneNumber
                </code>
                
                {/* คำแนะนำระดับชั้น */}
                <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                    <p className="font-bold flex items-center gap-1 mb-1"><FaInfoCircle/> ระดับชั้นที่รองรับ (ต้องพิมพ์ให้ตรง):</p>
                    <ul className="list-disc list-inside pl-2 grid grid-cols-2 gap-1">
                        {validLevels.map(level => <li key={level}>{level}</li>)}
                    </ul>
                </div>
            </div>

            {/* ส่วนอัปโหลด */}
            <div className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-green-50 hover:bg-green-100 transition cursor-pointer relative">
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="pointer-events-none">
                    <FaFileUpload className="mx-auto text-4xl text-green-400 mb-2" />
                    {file ? (
                        <p className="text-green-700 font-bold">{file.name}</p>
                    ) : (
                        <p className="text-gray-500">คลิกเพื่อเลือกไฟล์ CSV หรือลากไฟล์มาวาง</p>
                    )}
                </div>
            </div>

            {/* ปุ่มยืนยัน */}
            <button 
                onClick={handleUpload} 
                disabled={loading || !file}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {loading ? 'กำลังประมวลผล...' : '🚀 เริ่มนำเข้าข้อมูล'}
            </button>

            {/* Log แสดงผล */}
            {logs.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto border rounded p-2 bg-gray-50 text-xs">
                    {logs.map((log, i) => (
                        <div key={i} className={`mb-1 flex items-center gap-2 ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {log.status === 'success' ? <FaCheckCircle/> : <FaExclamationTriangle/>}
                            {log.msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}