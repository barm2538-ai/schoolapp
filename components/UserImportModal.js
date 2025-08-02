"use client";

import { useState } from 'react';
import Papa from 'papaparse';
// 1. นำเข้าเครื่องมือสำหรับเรียกใช้ Functions
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function UserImportModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 2. แก้ไขฟังก์ชันนี้ให้เรียกใช้ Backend
  const handleImport = () => {
    if (!file) {
      alert("กรุณาเลือกไฟล์ CSV ก่อน");
      return;
    }
    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const functions = getFunctions();
          const importUsers = httpsCallable(functions, 'importUsers');
          const result = await importUsers(results.data);
          
          console.log(result.data);
          alert(result.data.message); // แสดงผลลัพธ์ที่ได้จาก Function
          
          if (result.data.errors && result.data.errors.length > 0) {
            console.error("Import Errors:", result.data.errors);
          }

        } catch (error) {
          console.error("Error calling importUsers function:", error);
          alert(`เกิดข้อผิดพลาดร้ายแรง: ${error.message}`);
        } finally {
          setIsProcessing(false);
          onClose();
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ CSV");
        setIsProcessing(false);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">เพิ่มผู้ใช้จากไฟล์ CSV</h2>
        <p className="text-sm text-gray-500 mb-6">
          *ไฟล์ CSV ต้องมี Header เป็น `email`, `password`, `fullName`, `studentId`
        </p>
        <div className="mb-6">
          <input 
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
          <button onClick={handleImport} disabled={!file || isProcessing} className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300">
            {isProcessing ? 'กำลังประมวลผล...' : 'เริ่มนำเข้าข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
}