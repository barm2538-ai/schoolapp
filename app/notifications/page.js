"use client";

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert('กรุณากรอกหัวข้อและข้อความ');
      return;
    }
    setIsSubmitting(true);
    setResult('กำลังส่ง...');
    
    try {
      const functions = getFunctions();
      const sendNotification = httpsCallable(functions, 'sendPushNotificationToAll');
      const response = await sendNotification({ title, body });
      setResult(response.data.message);
    } catch (error) {
      console.error("Error sending notification:", error);
      setResult(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">ส่งการแจ้งเตือน (Push Notification)</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">หัวข้อ (Title)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">ข้อความ (Message)</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows="4" className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300">
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งแจ้งเตือนถึงผู้ใช้ทุกคน'}
          </button>
        </div>
        {result && <p className="mt-4 text-center text-gray-600">{result}</p>}
      </form>
    </div>
  );
}