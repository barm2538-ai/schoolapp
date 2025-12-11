"use client";

// เรียกใช้ Component หน้าจอจัดการลิงก์ตัวใหม่ที่เราทำไว้
import AdditionalLinkForm from '../../components/AdditionalLinkForm'; 


export default function AdditionalLinksPage() {
  return (
    <div className="w-full">
      {/* แสดงผลแค่ Component ใหม่ตัวเดียว */}
      <AdditionalLinkForm />
    </div>
  );
}