"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'maintenanceRequests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, 'maintenanceRequests', id), { status: newStatus });
  };

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div className="w-full max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">รายการแจ้งซ่อมครุภัณฑ์</h1>
      <div className="bg-white rounded-lg shadow-md">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4">ครุภัณฑ์</th>
              <th className="p-4">อาการ</th>
              <th className="p-4">ผู้แจ้ง</th>
              <th className="p-4">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b">
                <td className="p-4 font-medium">{req.equipmentName}</td>
                <td className="p-4">{req.problemDescription}</td>
                <td className="p-4">{req.reportedByName}</td>
                <td className="p-4">
                  <select 
                    value={req.status} 
                    onChange={(e) => updateStatus(req.id, e.target.value)}
                    className={`p-1 rounded ${
                      req.status === 'เสร็จสิ้น' ? 'bg-green-200' : 
                      req.status === 'กำลังดำเนินการ' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}
                  >
                    <option>รอดำเนินการ</option>
                    <option>กำลังดำเนินการ</option>
                    <option>เสร็จสิ้น</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}