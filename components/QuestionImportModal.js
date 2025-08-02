"use client";
import { useState } from 'react';
import Papa from 'papaparse';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function QuestionImportModal({ isOpen, onClose, examId }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = () => {
    if (!file) return alert("กรุณาเลือกไฟล์ CSV");
    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const functions = getFunctions();
          const importQuestions = httpsCallable(functions, 'importQuestions');
          const result = await importQuestions({ examId: examId, questions: results.data });
          alert(result.data.message);
        } catch (error) {
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
        } finally {
          setIsProcessing(false);
          onClose();
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">เพิ่มคำถามจากไฟล์ CSV</h2>
        <p className="text-sm text-gray-500 mb-6">
          *Header ที่ต้องมี: `questionText`, `option1`, `option2`, `option3`, `option4`, `correctAnswerIndex` (0-3)
        </p>
        <div className="mb-6">
          <input type="file" accept=".csv" onChange={handleFileChange} className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
          <button onClick={handleImport} disabled={!file || isProcessing} className="px-4 py-2 bg-green-500 text-white rounded-lg">{isProcessing ? 'กำลังประมวลผล...' : 'เริ่มนำเข้าข้อมูล'}</button>
        </div>
      </div>
    </div>
  );
}