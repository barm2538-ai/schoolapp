"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';
import Link from 'next/link';
import { FiPrinter } from 'react-icons/fi';

export default function QuizHistoryPage() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizHistories, setQuizHistories] = useState({});
  const [loading, setLoading] = useState(true);

  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [educationLevelFilter, setEducationLevelFilter] = useState('all');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubUsers(); unsubCourses(); };
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const studentIds = users.filter(u => u.role === 'student').map(s => s.id);
      if (studentIds.length === 0) {
        setLoading(false);
        return;
      }
      const unsubscribers = studentIds.map(studentId => {
        const historyQuery = query(collection(db, 'users', studentId, 'quizHistory'));
        return onSnapshot(historyQuery, (snapshot) => {
          const histories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setQuizHistories(prev => ({ ...prev, [studentId]: histories }));
        });
      });
      setLoading(false);
      return () => unsubscribers.forEach(unsub => unsub());
    } else if (!loading) {
        setLoading(false);
    }
  }, [users, loading]);

  // 1. ▼▼▼ กรองรายวิชาตามระดับชั้นที่เลือก ▼▼▼
  const filteredCourses = useMemo(() => {
    if (educationLevelFilter === 'all') {
      return courses;
    }
    return courses.filter(course => course.educationLevel === educationLevelFilter);
  }, [courses, educationLevelFilter]);

  const processedData = useMemo(() => {
    const students = users.filter(u => u.role === 'student');
    
    let filteredStudents = students;
    if (selectedTeacher !== 'all') {
      filteredStudents = students.filter(s => s.teacherId === selectedTeacher);
    }
    if (educationLevelFilter !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.educationLevel === educationLevelFilter);
    }

    return filteredStudents.map(student => {
      const studentHistory = quizHistories[student.id] || [];
      // 2. ▼▼▼ ใช้ filteredCourses ในการสร้างผลลัพธ์ ▼▼▼
      const results = filteredCourses.map(course => {
        const historyEntry = studentHistory.find(h => h.examId === course.examId);
        return {
          courseName: course.subjectName,
          score: historyEntry ? `${historyEntry.score}/${historyEntry.totalQuestions}` : '-',
        };
      });
      return {
        studentId: student.id,
        studentName: student.fullName || student.email,
        educationLevel: student.educationLevel || 'N/A',
        results: results,
      };
    });
  }, [users, filteredCourses, quizHistories, selectedTeacher, educationLevelFilter]);


  if (loading) return <p className="text-center p-8">กำลังประมวลผลข้อมูล...</p>;

  return (
    <div className="w-full max-w-7xl" id="report-page">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div className="flex items-center">
          <Link href="/exams" className="text-blue-500 hover:underline mr-4">&larr; กลับ</Link>
          <h1 className="text-3xl font-bold">ประวัติคะแนนสอบ</h1>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={educationLevelFilter} 
            onChange={(e) => setEducationLevelFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">ระดับชั้นทั้งหมด</option>
            <option value="ประถม">ประถม</option>
            <option value="มัธยมต้น">มัธยมต้น</option>
            <option value="มัธยมปลาย">มัธยมปลาย</option>
          </select>
          <select 
            value={selectedTeacher} 
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="all">ครูทั้งหมด</option>
            {users.filter(u => u.role === 'teacher').map(t => (
              <option key={t.id} value={t.id}>{t.fullName || t.email}</option>
            ))}
          </select>
          <button onClick={() => window.print()} className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <FiPrinter size={20} />
          </button>
        </div>
      </div>

      {/* 3. ▼▼▼ เพิ่มหัวข้อสำหรับหน้าปริ้น ▼▼▼ */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">รายงานประวัติคะแนนสอบ</h1>
        <p>ระดับชั้น: {educationLevelFilter} | ครูที่ปรึกษา: {selectedTeacher === 'all' ? 'ทั้งหมด' : users.find(u => u.id === selectedTeacher)?.fullName}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 sticky left-0 bg-gray-100 z-10">ชื่อนักเรียน</th>
              <th className="p-4">ระดับชั้น</th>
              {/* 4. ▼▼▼ แสดงหัวตารางจาก filteredCourses ▼▼▼ */}
              {filteredCourses.map(course => (
                <th key={course.id} className="p-4 text-center min-w-[120px]">{course.subjectName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map(student => (
              <tr key={student.studentId} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium sticky left-0 bg-white">{student.studentName}</td>
                <td className="p-4">{student.educationLevel}</td>
                {student.results.map((result, index) => (
                  <td key={index} className="p-4 text-center">{result.score}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}