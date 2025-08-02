"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, Timestamp, addDoc } from 'firebase/firestore';

export default function BulkAddActivitiesPage() {
  const [activityName, setActivityName] = useState('');
  const [hours, setHours] = useState(0);
  const [completedDate, setCompletedDate] = useState('');
  
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  const [filter, setFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), 
      (snapshot) => {
        const usersData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => !user.isAdmin);
          
        setStudents(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error: ", error);
        alert("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้!");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);
  
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (filter !== 'ทั้งหมด') {
      filtered = filtered.filter(s => s.educationLevel && s.educationLevel.trim() === filter);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.fullName && s.fullName.toLowerCase().includes(lowercasedQuery)) ||
        (s.email && s.email.toLowerCase().includes(lowercasedQuery))
      );
    }
    return filtered;
  }, [students, filter, searchQuery]);

  const handleSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!activityName || hours <= 0 || !completedDate || selectedStudents.length === 0) {
      alert("กรุณากรอกข้อมูลกิจกรรมและเลือกนักศึกษาอย่างน้อย 1 คน");
      return;
    }
    if (!window.confirm(`ยืนยันการบันทึกกิจกรรม "${activityName}" ให้กับนักศึกษา ${selectedStudents.length} คน?`)) {
      return;
    }
    setIsSubmitting(true);
    const activityPayload = {
      activityName: activityName,
      hours: Number(hours),
      completedDate: Timestamp.fromDate(new Date(completedDate)),
    };
    let successCount = 0;
    let errorCount = 0;
    for (const uid of selectedStudents) {
      try {
        const activityRef = collection(db, 'users', uid, 'completedActivities');
        await addDoc(activityRef, activityPayload);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }
    alert(`บันทึกข้อมูลเสร็จสิ้น! สำเร็จ: ${successCount} คน, ล้มเหลว: ${errorCount} คน`);
    setActivityName('');
    setHours(0);
    setCompletedDate('');
    setSelectedStudents([]);
    setIsSubmitting(false);
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">บันทึกกิจกรรมที่เข้าร่วมให้นักศึกษา</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลกิจกรรม</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="ชื่อกิจกรรม" className="w-full px-3 py-2 border rounded-lg" />
          <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} placeholder="จำนวนชั่วโมง" className="w-full px-3 py-2 border rounded-lg" />
          <input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">เลือกนักศึกษาที่เข้าร่วม ({selectedStudents.length} คน)</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ หรือ อีเมล..."
            className="px-4 py-2 border rounded-lg flex-grow"
          />
          <div className="flex gap-2">
            {['ทั้งหมด', 'ประถม', 'มัธยมต้น', 'มัธยมปลาย'].map(level => (
              <button key={level} onClick={() => setFilter(level)} className={`px-3 py-1 rounded-full text-sm ${filter === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{level}</button>
            ))}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(student.id)}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  readOnly
                  className="h-5 w-5 rounded border-gray-300"
                />
                <label className="ml-3 text-lg">{student.fullName || student.email}</label>
              </div>
            ))}
        </div>
        <div className="flex justify-end mt-6">
            <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-500 text-white px-6 py-2 rounded-lg text-lg disabled:bg-green-300">
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
        </div>
      </div>
    </div>
  );
}