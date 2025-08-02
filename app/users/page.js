"use client";

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import UserForm from '../../components/UserForm';
import AddUserForm from '../../components/AddUserForm';
import UserImportModal from '../../components/UserImportModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (filter !== 'ทั้งหมด') {
      filtered = filtered.filter(u => u.educationLevel === filter);
    }
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.fullName && u.fullName.toLowerCase().includes(lowercasedQuery)) ||
        (u.email && u.email.toLowerCase().includes(lowercasedQuery)) ||
        (u.studentId && u.studentId.includes(lowercasedQuery))
      );
    }
    return filtered;
  }, [users, filter, searchQuery]);

  const toggleAdmin = async (userId, currentStatus) => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { isAdmin: !currentStatus });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleDelete = async (userId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลผู้ใช้นี้? (บัญชีล็อกอินจะยังคงอยู่)")) {
      await deleteDoc(doc(db, 'users', userId));
    }
  };

  const handleApprove = async (userId) => {
    if (window.confirm("คุณต้องการอนุมัติผู้ใช้นี้ใช่หรือไม่?")) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { isApproved: true });
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

const userCounts = useMemo(() => {
    return users.reduce((acc, user) => {
      acc.total++;
      if (user.role === 'admin') {
        acc.admin++;
      } else if (user.role === 'teacher') {
        acc.teacher++;
      } else { // ถ้าไม่ใช่ admin หรือ teacher ก็นับเป็น student
        switch (user.educationLevel) {
          case 'ประถม':
            acc.primary++;
            break;
          case 'มัธยมต้น':
            acc.juniorHigh++;
            break;
          case 'มัธยมปลาย':
            acc.seniorHigh++;
            break;
          default:
            acc.unclassified++;
        }
      }
      return acc;
    }, { total: 0, admin: 0, teacher: 0, primary: 0, juniorHigh: 0, seniorHigh: 0, unclassified: 0 });
  }, [users]);

  if (loading) return <p className="text-center p-8">กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">จัดการผู้ใช้</h1>
  
          <div>
<div className="text-sm text-gray-500 flex flex-wrap gap-x-2">
              <span>ทั้งหมด: {userCounts.total}</span>
              <span>|</span>
              <span className="text-red-500">Admin: {userCounts.admin}</span>
              <span>|</span>
              <span className="text-purple-500">ครู: {userCounts.teacher}</span>
              <span>|</span>
              <span className="text-green-500">ประถม: {userCounts.primary}</span>
              <span>|</span>
              <span className="text-blue-500">ม.ต้น: {userCounts.juniorHigh}</span>
              <span>|</span>
              <span className="text-indigo-500">ม.ปลาย: {userCounts.seniorHigh}</span>
              {userCounts.unclassified > 0 && (
                <>
                  <span>|</span>
                  <span className="text-gray-400">ไม่ระบุ: {userCounts.unclassified}</span>
                </>
              )}
            </div>
          </div>
          <div>
            <Link href="/user-stats" className="bg-gray-500 text-white px-4 py-2 rounded mr-4">
              ดูสถิติ
            </Link>
            <button onClick={() => setIsImportModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded mr-4">
              + เพิ่มผู้ใช้จากไฟล์
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              + เพิ่มผู้ใช้ใหม่
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยชื่อ, อีเมล, รหัสนักศึกษา..."
            className="px-4 py-2 border rounded-lg flex-grow"
          />
          <div className="flex gap-2">
            {['ทั้งหมด', 'ประถม', 'มัธยมต้น', 'มัธยมปลาย'].map(level => (
              <button key={level} onClick={() => setFilter(level)} className={`px-3 py-1 rounded-full text-sm ${filter === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{level}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">อีเมล</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">รหัสนักศึกษา</th>
                <th className="p-4">ระดับชั้น</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4">บทบาท (Role)</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 font-medium">{user.fullName || '-'}</td>
                  <td className="p-4 text-gray-600">{user.studentId || '-'}</td>
                  <td className="p-4 text-gray-600">{user.educationLevel || '-'}</td>
                  <td className="p-4">
                    {user.isApproved ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">อนุมัติแล้ว</span>
                    ) : (
                        <button onClick={() => handleApprove(user.id)} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full hover:bg-yellow-200">
                        รออนุมัติ
                        </button>
                    )}
                  </td>
<td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-200 text-red-800' :
                      user.role === 'teacher' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {user.role || 'student'}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                                       <Link href={`/users/${user.id}/courses`} className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-4 hover:bg-blue-600">
                        ลงทะเบียน
                    </Link>
                    <Link href={`/users/${user.id}/activities`} className="bg-purple-500 text-white px-3 py-1 rounded text-sm mr-4 hover:bg-purple-600">
                        กิจกรรม
                    </Link>
                    <button onClick={() => openPasswordModal(user)} className="text-blue-500 hover:underline mr-4">รหัสผ่าน</button>
                    <button onClick={() => handleEdit(user)} className="text-yellow-500 hover:underline mr-4">แก้ไข</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserForm isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} userToEdit={editingUser} />
      <AddUserForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <UserImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} user={selectedUser} />
    </>
  );
}