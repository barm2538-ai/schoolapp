"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaTimes, FaSave, FaUserPlus, FaUserEdit, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

export default function AddUserForm({ isOpen, onClose, itemToEdit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student');
  // ❌ ลบเบอร์โทรออกแล้ว

  // State เฉพาะนักเรียน
  const [studentId, setStudentId] = useState('');
  const [educationLevel, setEducationLevel] = useState('ประถม');
  const [teacherId, setTeacherId] = useState('');
  
  const [teachersList, setTeachersList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // ★★★ ระดับชั้น (ตามที่คุณต้องการ) ★★★
  const educationOptions = [
      'ประถม',
      'มัธยมต้น',
      'มัธยมปลาย'
  ];

  // 1. โหลดรายชื่อครู
  useEffect(() => {
    const fetchTeachers = async () => {
        try {
            const q = query(collection(db, "users"), where("role", "==", "teacher"));
            const snapshot = await getDocs(q);
            setTeachersList(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().fullName || doc.data().email })));
        } catch (error) { console.error("Error fetching teachers:", error); }
    };
    fetchTeachers();
  }, []);

  // 2. โหลดข้อมูลผู้ใช้ (ดึงสดจาก Firebase)
  useEffect(() => {
    const fetchUserData = async () => {
      if (itemToEdit) {
        setIsLoadingData(true); 
        try {
          const userDoc = await getDoc(doc(db, "users", itemToEdit.id));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            setEmail(userData.email || '');
            setFullName(userData.fullName || '');
            setRole(userData.role || 'student');
            // ❌ ไม่ดึงเบอร์โทร
            
            // ข้อมูลนักเรียน
            setStudentId(userData.studentId || '');
            setEducationLevel(userData.educationLevel || 'ประถม');
            setTeacherId(userData.teacherId || '');
          }
        } catch (error) {
          console.error("Error fetching user detail:", error);
        } finally {
          setIsLoadingData(false);
        }
      } else {
        // Reset Form
        setEmail('');
        setPassword('');
        setFullName('');
        setRole('student');
        // ❌ ไม่รีเซ็ตเบอร์โทร (เพราะไม่มีแล้ว)
        setStudentId('');
        setEducationLevel('ประถม');
        setTeacherId('');
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let selectedTeacherName = "";
      if (teacherId) {
          const t = teachersList.find(x => x.id === teacherId);
          if (t) selectedTeacherName = t.name;
      }

      const userData = {
        fullName,
        role,
        // ❌ ไม่ส่งเบอร์โทรไปบันทึก
        
        studentId: role === 'student' ? studentId : null,
        educationLevel: role === 'student' ? educationLevel : null,
        teacherId: role === 'student' ? teacherId : null,
        teacherName: role === 'student' ? selectedTeacherName : null,
      };

      if (itemToEdit) {
        await updateDoc(doc(db, "users", itemToEdit.id), userData);
        alert("แก้ไขข้อมูลเรียบร้อย");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
            email, ...userData, isApproved: true, createdAt: serverTimestamp()
        });
        alert("เพิ่มผู้ใช้งานเรียบร้อย");
      }
      
      onClose();
      // window.location.reload(); // เปิดบรรทัดนี้ถ้าต้องการรีเฟรชหน้าจอหลังบันทึก
      
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                {itemToEdit ? <FaUserEdit className="text-blue-600"/> : <FaUserPlus className="text-green-600"/>}
                {itemToEdit ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้งานใหม่'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes size={20}/></button>
        </div>

        <div className="overflow-y-auto p-6">
            {isLoadingData ? (
                <div className="text-center py-10 text-gray-500">กำลังดึงข้อมูลล่าสุด...</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* อีเมล & รหัสผ่าน */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!itemToEdit} className="w-full border rounded-lg px-3 py-2 outline-none disabled:bg-gray-100" />
                        </div>
                        {!itemToEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none" />
                            </div>
                        )}
                    </div>

                    {/* ชื่อ-นามสกุล (ลบเบอร์โทรออกแล้ว เหลือแค่ชื่อเต็มบรรทัด) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                        <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border rounded-lg px-3 py-2 outline-none" />
                    </div>

                    {/* ตำแหน่ง */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง (Role)</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border rounded-lg px-3 py-2 bg-white outline-none">
                            <option value="student">🎓 นักเรียน</option>
                            <option value="teacher">👨‍🏫 ครู</option>
                            <option value="director">🎖️ ผู้อำนวยการ</option>
                            <option value="admin">👑 ผู้ดูแลระบบ</option>
                            <option value="public">👥 ประชาชน</option>
                        </select>
                    </div>

                    {/* ข้อมูลนักเรียน */}
                    {role === 'student' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 animate-fade-in">
                            <h4 className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2 mb-2 flex items-center gap-2">
                                <FaGraduationCap /> ข้อมูลการศึกษา
                            </h4>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">รหัสนักศึกษา</label>
                                <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="6xxxxxx" className="w-full border rounded px-3 py-1.5 text-sm outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">ระดับชั้น</label>
                                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm outline-none bg-white">
                                    {educationOptions.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1"><FaChalkboardTeacher /> ครูที่ปรึกษา</label>
                                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full border rounded px-3 py-1.5 text-sm outline-none bg-white">
                                    <option value="">-- เลือกครูที่ปรึกษา --</option>
                                    {teachersList.length > 0 ? (
                                        teachersList.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))
                                    ) : (
                                        <option disabled>ไม่พบรายชื่อครูในระบบ</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300">ยกเลิก</button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? 'บันทึก' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}