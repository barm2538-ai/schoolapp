"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function CourseRegistrationModal({ isOpen, onClose, onConfirm, student, enrolledCourseIds }) {
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const unsubscribe = onSnapshot(query(collection(db, 'courses')), (snapshot) => {
        setAllCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setSelectedCourses(new Set());
    }
  }, [isOpen]);

  // กรองเอารายวิชาที่ยังไม่ได้ลงทะเบียน และตรงกับระดับชั้นของนักศึกษา
  const availableCourses = useMemo(() => {
    if (!student || !student.educationLevel) return [];
    return allCourses.filter(course => 
      !enrolledCourseIds.includes(course.id) && 
      course.educationLevel === student.educationLevel
    );
  }, [allCourses, enrolledCourseIds, student]);

  const handleSelect = (courseId) => {
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
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-2">เลือกลงทะเบียนวิชาเพิ่ม</h2>
        <p className="text-gray-600 mb-6">สำหรับระดับชั้น: <span className="font-semibold">{student?.educationLevel}</span></p>

        <div className="flex-1 overflow-y-auto border-t border-b py-4">
          {loading ? <p>กำลังโหลดรายวิชา...</p> : availableCourses.map(course => (
            <div key={course.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => handleSelect(course.id)}>
              <input
                type="checkbox"
                checked={selectedCourses.has(course.id)}
                readOnly
                className="h-5 w-5 rounded border-gray-300"
              />
              <label className="ml-3 text-lg">{course.subjectName}</label>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
          <button onClick={() => onConfirm(Array.from(selectedCourses))} disabled={selectedCourses.size === 0} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300">
            ยืนยัน ({selectedCourses.size} วิชา)
          </button>
        </div>
      </div>
    </div>
  );
}