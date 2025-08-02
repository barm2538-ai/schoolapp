"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';

export default function BulkRegistrationPage() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [courseFilter, setCourseFilter] = useState('ทั้งหมด');
  const [studentFilter, setStudentFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const coursesQuery = query(collection(db, 'courses'));
    const studentsQuery = query(collection(db, 'users'));

    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      // ▼▼▼ กรองให้แสดงเฉพาะ Student เท่านั้น ▼▼▼
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => !user.isAdmin); // เอาเฉพาะคนที่ไม่ใช่ Admin
      
      setStudents(usersData);
      setLoading(false);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeStudents();
    };
  }, []);

  const filteredCourses = useMemo(() => {
    if (courseFilter === 'ทั้งหมด') {
      return courses;
    }
    return courses.filter(course => course.educationLevel && course.educationLevel.trim() === courseFilter);
  }, [courses, courseFilter]);

  const filteredStudents = useMemo(() => {
    let tempStudents = [...students];
    if (studentFilter !== 'ทั้งหมด') {
      tempStudents = tempStudents.filter(student => student.educationLevel && student.educationLevel.trim() === studentFilter);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempStudents = tempStudents.filter(student =>
        (student.fullName && student.fullName.toLowerCase().includes(lowercasedQuery)) ||
        (student.email && student.email.toLowerCase().includes(lowercasedQuery))
      );
    }
    return tempStudents;
  }, [students, studentFilter, searchQuery]);

  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };
  
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedCourses.size === 0 || selectedStudents.size === 0) {
      alert("กรุณาเลือกอย่างน้อย 1 รายวิชา และ 1 นักศึกษา");
      return;
    }
    if (!window.confirm(`ยืนยันการลงทะเบียน ${selectedCourses.size} วิชา ให้กับนักศึกษา ${selectedStudents.size} คน?`)) {
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    const coursesToRegister = courses.filter(c => selectedCourses.has(c.id));
    const studentIds = Array.from(selectedStudents);

    for (const studentId of studentIds) {
      for (const course of coursesToRegister) {
        try {
          const registrationRef = doc(db, 'users', studentId, 'enrolledCourses', course.id);
          await setDoc(registrationRef, {
            subjectName: course.subjectName || '',
            teacherName: course.teacherName || '',
          });
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }
    }
    
    alert(`ลงทะเบียนเสร็จสิ้น! สำเร็จ: ${successCount} รายการ, ล้มเหลว: ${errorCount} รายการ`);
    setIsSubmitting(false);
    setSelectedCourses(new Set());
    setSelectedStudents(new Set());
  };

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <div className="w-full max-w-6xl space-y-8">
      <h1 className="text-3xl font-bold">ลงทะเบียนกลุ่ม</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ขั้นตอนที่ 1: เลือกรายวิชา ({selectedCourses.size} วิชา)</h2>
          <div className="flex gap-2">
            {['ทั้งหมด', 'ประถม', 'มัธยมต้น', 'มัธยมปลาย'].map(level => (
              <button key={level} onClick={() => setCourseFilter(level)} className={`px-3 py-1 rounded-full text-sm ${courseFilter === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{level}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredCourses.map(course => (
            <div key={course.id} className="flex items-center p-2 rounded-lg border hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectCourse(course.id)}>
              <input type="checkbox" checked={selectedCourses.has(course.id)} readOnly className="h-5 w-5" />
              <label className="ml-2">{course.subjectName}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">ขั้นตอนที่ 2: เลือกนักศึกษา ({selectedStudents.size} คน)</h2>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2">
            {['ทั้งหมด', 'ประถม', 'มัธยมต้น', 'มัธยมปลาย'].map(level => (
              <button key={level} onClick={() => setStudentFilter(level)} className={`px-3 py-1 rounded-full text-sm ${studentFilter === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{level}</button>
            ))}
          </div>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ค้นหา..." className="px-4 py-2 border rounded-lg flex-grow" />
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <div key={student.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer border" onClick={() => handleSelectStudent(student.id)}>
                <input
                  type="checkbox"
                  checked={selectedStudents.has(student.id)}
                  readOnly
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-3 text-md">{student.fullName || student.email}</label>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={isSubmitting || selectedStudents.size === 0 || selectedCourses.size === 0} className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg disabled:bg-green-300">
            {isSubmitting ? 'กำลังลงทะเบียน...' : 'ยืนยันการลงทะเบียน'}
        </button>
      </div>
    </div>
  );
}