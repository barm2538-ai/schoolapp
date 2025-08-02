"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

export default function StudentSelectorModal({ isOpen, onClose, onConfirm, activityTitle }) {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(usersData);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setSelectedStudents([]); // เคลียร์รายชื่อที่เลือกเมื่อปิด
    }
  }, [isOpen]);

  const handleSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-2">ลงทะเบียนนักศึกษา</h2>
        <p className="text-gray-600 mb-6">สำหรับกิจกรรม: <span className="font-semibold">{activityTitle}</span></p>

        <div className="flex-1 overflow-y-auto border-t border-b py-4">
          {loading ? <p>กำลังโหลดรายชื่อ...</p> : students.map(student => (
            <div key={student.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => handleSelect(student.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-3 text-lg">{student.fullName || student.email} ({student.studentId || 'N/A'})</label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
          <button onClick={() => onConfirm(selectedStudents)} disabled={selectedStudents.length === 0} className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-green-300">
            ยืนยันลงทะเบียน {selectedStudents.length} คน
          </button>
        </div>
      </div>
    </div>
  );
}