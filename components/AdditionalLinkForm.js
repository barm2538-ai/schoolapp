"use client";

import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { FaTrash, FaEdit, FaLink, FaTimes, FaSave, FaPlus, FaImage, FaSortNumericDown } from 'react-icons/fa';

export default function AdditionalLinkForm() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(''); 
  const [order, setOrder] = useState(''); // ★ เพิ่ม State สำหรับลำดับ
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState(null);

  // --- 1. โหลดข้อมูลและจัดเรียง ---
  const fetchLinks = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลทั้งหมดมาก่อน (เรียงตามเวลาสร้างไปก่อน)
      const q = query(collection(db, "additionalLinks"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      // ★★★ จัดเรียงด้วย JavaScript (Client-side Sorting) ★★★
      // เรียงตาม order น้อย -> มาก (ใครไม่มี order ให้ไปอยู่ท้ายสุด)
      items.sort((a, b) => {
        const orderA = a.order !== undefined && a.order !== "" ? Number(a.order) : 99999;
        const orderB = b.order !== undefined && b.order !== "" ? Number(b.order) : 99999;
        return orderA - orderB;
      });

      setLinks(items);
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("กรุณากรอกชื่อและ URL ให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = {
        title: title,
        url: url,
        imageUrl: imageUrl.trim() ? imageUrl : null,
        // ★ บันทึกลำดับเป็นตัวเลข (ถ้าไม่ได้กรอกให้เป็น null หรือค่าว่าง)
        order: order !== "" ? Number(order) : null
      };

      if (editId) {
        const linkRef = doc(db, "additionalLinks", editId);
        await updateDoc(linkRef, {
          ...dataToSave,
          updatedAt: serverTimestamp()
        });
        alert("บันทึกการแก้ไขเรียบร้อย!");
      } else {
        await addDoc(collection(db, "additionalLinks"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        alert("เพิ่มลิงก์ใหม่เรียบร้อย!");
      }
      
      resetForm();
      fetchLinks();
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
    setOrder(item.order !== undefined && item.order !== null ? item.order.toString() : ''); // ดึงลำดับมาโชว์
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setUrl('');
    setImageUrl('');
    setOrder('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ยืนยันการลบรายการนี้?")) return;
    try {
      await deleteDoc(doc(db, "additionalLinks", id));
      setLinks(prev => prev.filter(item => item.id !== id));
      if (editId === id) resetForm();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        🔗 จัดการลิงก์เพิ่มเติม
      </h1>

      {/* --- ฟอร์ม --- */}
      <div className={`p-6 rounded-xl shadow-sm mb-8 border transition-colors ${editId ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        
        <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${editId ? 'text-yellow-700' : 'text-gray-700'}`}>
                {editId ? <><FaEdit/> กำลังแก้ไขข้อมูล</> : <><FaPlus/> เพิ่มลิงก์ใหม่</>}
            </h2>
            
            {editId && (
                <button onClick={resetForm} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold">
                    <FaTimes /> ยกเลิก
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* แถวที่ 1: ลำดับ (เล็กๆ) - ชื่อ - URL */}
            <div className="flex flex-col md:flex-row gap-4">
                
                {/* ★ ช่องกรอกลำดับ ★ */}
                <div className="w-full md:w-24 flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-600 mb-1">ลำดับที่</label>
                    <input 
                        type="number" 
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="1" 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-center font-bold"
                    />
                </div>

                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">ชื่อลิงก์ / หัวข้อ *</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="เช่น คู่มือการใช้งาน" 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-1">URL ปลายทาง *</label>
                    <input 
                        type="url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..." 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                </div>
            </div>
            
            {/* แถวที่ 2: รูปภาพ */}
            <div className="w-full">
                <label className="block text-sm font-medium text-gray-600 mb-1">URL รูปภาพโลโก้ (ถ้ามี)</label>
                <div className="flex gap-2">
                    <input 
                        type="url" 
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/logo.png" 
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    />
                    {imageUrl && (
                        <div className="w-10 h-10 border rounded overflow-hidden bg-gray-50 flex-shrink-0">
                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                        </div>
                    )}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-md w-full md:w-auto h-[42px] flex items-center justify-center gap-2 self-end mt-2
                    ${editId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}
                    disabled:bg-gray-400`}
            >
                {isSubmitting ? 'กำลังบันทึก...' : (editId ? <><FaSave/> บันทึกแก้ไข</> : <><FaPlus/> เพิ่มลิงก์</>)}
            </button>
        </form>
      </div>

      {/* --- ตารางแสดงผล --- */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 w-[60px] text-center">#</th> {/* หัวข้อลำดับ */}
              <th className="p-4 font-semibold text-gray-600 w-[80px] text-center">รูป</th>
              <th className="p-4 font-semibold text-gray-600">ชื่อลิงก์</th>
              <th className="p-4 font-semibold text-gray-600">URL</th>
              <th className="p-4 font-semibold text-gray-600 text-center w-[140px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            ) : links.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลลิงก์</td></tr>
            ) : (
              links.map((item) => (
                <tr key={item.id} className={`transition ${editId === item.id ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                  
                  {/* แสดงลำดับ */}
                  <td className="p-4 text-center font-bold text-gray-500">
                      {item.order ? item.order : '-'}
                  </td>

                  <td className="p-2 text-center align-middle">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt="Logo" className="w-10 h-10 object-contain rounded-md mx-auto bg-gray-50 border" />
                    ) : (
                        <div className="w-10 h-10 mx-auto flex items-center justify-center bg-gray-100 rounded-md text-gray-400">
                            <FaImage />
                        </div>
                    )}
                  </td>

                  <td className="p-4 font-medium text-gray-800 align-middle">
                      {item.title}
                      {editId === item.id && <span className="ml-2 text-xs text-yellow-600 font-bold bg-yellow-100 px-2 py-0.5 rounded-full">กำลังแก้ไข</span>}
                  </td>

                  <td className="p-4 align-middle">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate block max-w-xs flex items-center gap-2">
                      <FaLink className="text-xs flex-shrink-0" /> 
                      <span className="truncate">{item.url}</span>
                    </a>
                  </td>

                  <td className="p-4 text-center space-x-2 align-middle">
                    <button onClick={() => startEdit(item)} className="bg-yellow-100 text-yellow-600 p-2 rounded-lg hover:bg-yellow-500 hover:text-white transition" title="แก้ไข">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition" title="ลบ">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}