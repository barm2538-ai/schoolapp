import React from 'react';

export default function CertificateModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const config = data.certConfig || {};

  const find = (keys) => {
    for (const key of keys) {
        if (config[key]) return config[key];
        if (data[key]) return data[key];
    }
    return null;
  };

  const schoolName = find(['certSchoolName', 'schoolName', 'certSchool']) || "ไม่ระบุสถานศึกษา";
  const directorName = find(['certSignerName', 'directorName', 'signerName']) || "..........................";
  const directorPos = find(['certSignerPosition', 'directorPosition', 'position']) || "ผู้บริหารสถานศึกษา";
  const logoUrl = find(['certLogoUrl', 'logoUrl', 'logo']);
  const signUrl = find(['certSignUrl', 'signatureUrl', 'signUrl']);
  const certTitle = find(['certTitle', 'title']) || "ขอมอบวุฒิบัตรฉบับนี้เพื่อแสดงว่า";
  
  // ★★★ เพิ่มบรรทัดนี้: ดึงข้อความขยาย ★★★
  const certExtraText = find(['certExtraText', 'extraText', 'description']);

  const studentName = data.studentName || "ไม่ระบุชื่อ";
  const courseTitle = data.examTitle || data.courseTitle || "ไม่ระบุวิชา";
  
  let dateStr = "-";
  if (data.completedAt?.seconds) dateStr = new Date(data.completedAt.seconds * 1000).toLocaleDateString('th-TH', {year:'numeric',month:'long',day:'numeric'});
  else if (data.issuedDate?.seconds) dateStr = new Date(data.issuedDate.seconds * 1000).toLocaleDateString('th-TH', {year:'numeric',month:'long',day:'numeric'});
  else if (data.createdAt) dateStr = new Date(data.createdAt).toLocaleDateString('th-TH', {year:'numeric',month:'long',day:'numeric'});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:block">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #cert-print-area, #cert-print-area * { visibility: visible; }
          @page { size: landscape; margin: 0; }
          #cert-print-area {
            position: fixed; left: 0; top: 0; width: 297mm; height: 210mm; margin: 0; padding: 0;
            border: none !important; transform: scale(1) !important; box-shadow: none !important; background-color: white !important; z-index: 9999;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl relative flex flex-col my-auto print:shadow-none print:w-full">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl no-print">
            <h3 className="font-bold text-gray-700 text-lg">ตัวอย่างวุฒิบัตร</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl font-bold px-2 leading-none">&times;</button>
        </div>
        
        <div className="p-6 bg-gray-200 flex justify-center overflow-auto print:p-0 print:bg-white">
            <div id="cert-print-area" className="bg-white text-center shadow-lg w-full max-w-[900px] aspect-[297/210] relative mx-auto flex flex-col justify-center box-border">
                <div className="w-full h-full border-[12px] border-[#1a4ca1] p-2 box-border flex flex-col">
                    <div className="w-full h-full border-[3px] border-dashed border-[#DAA520] flex flex-col items-center justify-between py-6 px-12 box-border">
                        
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="h-24 mb-2 flex items-center justify-center">
                                {logoUrl ? (<img src={logoUrl} alt="Logo" className="h-full object-contain drop-shadow-sm" />) : (<div className="text-gray-300 text-xs border px-2 py-1 rounded">No Logo</div>)}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#1a4ca1] leading-tight break-words w-full px-4">{schoolName}</h2>
                        </div>

                        <div className="flex flex-col items-center justify-center w-full flex-grow">
                            <p className="text-lg text-gray-600 mb-1">{certTitle}</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-black border-b-[3px] border-gray-300 inline-block pb-2 mb-3 px-10 min-w-[300px] break-words text-center leading-tight">{studentName}</h1>
                            <p className="text-xl text-gray-700 mb-1">ได้ผ่านการทดสอบความรู้เรื่อง</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#1a4ca1] mb-2 break-words w-full px-8 leading-snug">{courseTitle}</h2>
                            
                            {/* ★★★ แสดงข้อความขยาย (ถ้ามี) ★★★ */}
                            {certExtraText && (
                                <p className="text-lg text-gray-600 mb-2 font-medium px-8">{certExtraText}</p>
                            )}

                            <p className="text-lg text-gray-600">ให้ไว้ ณ วันที่ {dateStr}</p>
                        </div>
                        
                        <div className="mt-2 flex flex-col items-center justify-end w-full">
                            <div className="h-20 mb-1 flex items-end justify-center relative">
                                {signUrl ? (<img src={signUrl} alt="Signature" className="h-full object-contain block" />) : (<div className="text-gray-300 text-xs mb-2">No Signature</div>)}
                            </div>
                            <div className="w-64 border-t border-black mb-2"></div>
                            <p className="text-xl font-bold text-black">({directorName})</p>
                            <p className="text-lg text-gray-600 font-medium mt-1">{directorPos}</p>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div className="p-4 border-t bg-white flex justify-center gap-4 rounded-b-xl no-print">
             <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium">ปิดหน้าต่าง</button>
             <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 transition transform hover:scale-105">🖨️ สั่งพิมพ์ / บันทึก PDF</button>
        </div>
      </div>
    </div>
 
);
}