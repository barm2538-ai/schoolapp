"use client";
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';

export default function LibraryCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'libraryCategories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.trim() === '') return;
    await addDoc(collection(db, 'libraryCategories'), { name: newCategory });
    setNewCategory('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?")) {
      await deleteDoc(doc(db, 'libraryCategories', id));
    }
  };

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">จัดการหมวดหมู่ห้องสมุด</h1>
      <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
        <input 
          value={newCategory} 
          onChange={(e) => setNewCategory(e.target.value)} 
          placeholder="เพิ่มหมวดหมู่ใหม่..." 
          className="flex-grow px-3 py-2 border rounded-lg" 
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">เพิ่ม</button>
      </form>
      <div className="bg-white rounded-lg shadow-md">
        <ul>
          {categories.map(cat => (
            <li key={cat.id} className="flex justify-between items-center p-4 border-b">
              <span className="font-medium">{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)} className="text-red-500 text-sm">ลบ</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}