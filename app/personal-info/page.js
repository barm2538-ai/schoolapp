"use client";

import { useState, useEffect } from 'react';
// ★ ถอย 2 ชั้นเพื่อหาไฟล์ config (../../firebaseConfig)
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { FaTrash, FaEdit, FaLink, FaTimes, FaSave, FaPlus, FaUserSecret } from 'react-icons/fa';

export default function ManagePersonalInfo() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState(null);

  // 1. ดึงข้อมูล (จาก studentReports)
  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "studentReports"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setReports(items);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 2. บันทึกข้อมูล
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("กรุณากรอกหัวข้อและลิงก์");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        title: title,
        url: url,
        imageUrl: imageUrl.trim() ? imageUrl : null,
      };

      if (editId) {
        await updateDoc(doc(db, "studentReports", editId), {
          ...dataToSave,
          updatedAt: serverTimestamp()
        });
        alert("แก้ไขเรียบร้อย!");
      } else {
        await addDoc(collection(db, "studentReports"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        alert("เพิ่มข้อมูลเรียบร้อย!");
      }
      
      resetForm();
      fetchReports();
    } catch (error) {
      console.error("Error saving:", error);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setUrl(item.url);
    setImageUrl(item.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setUrl('');
    setImageUrl('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบรายการนี้?")) return;
    try {
      await deleteDoc(doc(db, "studentReports", id));
      setReports(prev => prev.filter(item => item.id !== id));
      if (editId === id) resetForm();
    } catch (error) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        📂 จัดการข้อมูลส่วนตัว / รายงาน
      </h1>

      {/* ฟอร์มกรอกข้อมูล */}
      <div className={`p-6 rounded-xl shadow-sm mb-8 border transition-colors ${editId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
        
        <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${editId ? 'text-blue-700' : 'text-gray-700'}`}>
                {editId ? <><FaEdit/> แก้ไขข้อมูล</> : <><FaPlus/> เพิ่มข้อมูลใหม่</>}
            </h2>
            {editId && (
                <button onClick={resetForm} className="text-red-500 font-bold text-sm flex items-center gap-1">
                    <FaTimes/> ยกเลิก
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">หัวข้อรายงาน *</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="เช่น ตรวจสอบผลการเรียน, ตารางสอน" 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ลิงก์ข้อมูล (URL) *</label>
                    <input 
                        type="url" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                        placeholder="https://..." 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">รูปไอคอน/ปก (ถ้ามี)</label>
                <div className="flex gap-2">
                    <input 
                        type="url" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        placeholder="https://... (เว้นว่างได้)" 
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {imageUrl && (
                        <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-10 h-10 rounded border object-cover bg-gray-50" 
                            onError={(e)=>e.target.style.display='none'}
                        />
                    )}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting} 
                className={`px-6 py-2 rounded-lg font-bold text-white transition w-full md:w-auto self-end flex items-center justify-center gap-2 
                    ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
                {isSubmitting ? 'กำลังบันทึก...' : (editId ? <><FaSave/> บันทึกแก้ไข</> : <><FaPlus/> เพิ่มข้อมูล</>)}
            </button>
        </form>
      </div>

      {/* ตารางแสดงผล */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 w-[80px] text-center">รูป</th>
              <th className="p-4 font-semibold text-gray-600">หัวข้อ</th>
              <th className="p-4 font-semibold text-gray-600">URL</th>
              <th className="p-4 font-semibold text-gray-600 text-center w-[140px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            ) : reports.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">ยังไม่มีข้อมูล</td></tr>
            ) : (
             reports.map((item) => (
                <tr key={item.id} className={`transition ${editId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <td className="p-2 text-center align-middle">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-10 h-10 rounded object-cover mx-auto border bg-white"/>
                    ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                            <FaUserSecret />
                        </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800 align-middle">
                      {item.title}
                      {editId === item.id && <span className="ml-2 text-xs text-blue-600 font-bold">(กำลังแก้ไข)</span>}
                  </td>
                  <td className="p-4 align-middle">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs flex items-center gap-1">
                          <FaLink className="text-xs flex-shrink-0"/> <span className="truncate">{item.url}</span>
                      </a>
                  </td>
                  <td className="p-4 text-center space-x-2 align-middle">
                    <button onClick={() => startEdit(item)} className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition" title="แก้ไข">
                        <FaEdit/>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition" title="ลบ">
                        <FaTrash/>
                    </button>
                  </td>
                </tr>
             )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}