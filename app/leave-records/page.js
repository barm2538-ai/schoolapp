"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';

const LEAVE_TYPES = [
  'การลาป่วย', 'การลาคลอดบุตร', 'การลาไปช่วยเหลือภริยาที่คลอดบุตร', 'การลากิจส่วนตัว',
  'การลาพักผ่อน', 'การลาอุปสมบทหรือการไปประกอบพิธีฮัจย์', 'การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล',
  'การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน', 'การลาไปปฏิบัติงานในองค์การระหว่างประเทศ',
  'การลาติดตามคู่สมรส', 'การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ'
];

export default function LeaveRecordsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    leaveType: LEAVE_TYPES[0],
    startDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.role === 'student');
      setStudents(usersData);
      if (usersData.length > 0) {
        setFormData(prev => ({ ...prev, studentId: usersData[0].id }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.startDate) {
      alert("กรุณาเลือกนักศึกษาและวันที่ลา");
      return;
    }
    setIsSubmitting(true);
    try {
      const studentRef = collection(db, 'users', formData.studentId, 'leaveRecords');
      await addDoc(studentRef, {
        leaveType: formData.leaveType,
        startDate: Timestamp.fromDate(new Date(formData.startDate)),
        reason: formData.reason,
        recordedAt: serverTimestamp(),
      });
      alert("บันทึกข้อมูลการลาสำเร็จ");
      setFormData(prev => ({ ...prev, reason: '', startDate: '' }));
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">บันทึกข้อมูลการลา</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">เลือกนักศึกษา</label>
          <select name="studentId" value={formData.studentId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName || s.email}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ประเภทการลา</label>
          <select name="leaveType" value={formData.leaveType} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
            {LEAVE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">วันที่ลา</label>
          <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">เหตุผล/หมายเหตุ (ถ้ามี)</label>
          <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-500 text-white rounded-lg">
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
    </div>
  );
}