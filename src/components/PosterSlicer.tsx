import { useState, useRef } from 'react'
import jsPDF from 'jspdf'

interface Slice {
  dataUrl: string;
  row: number;
  col: number;
}

type Orientation = 'p' | 'l';

export default function PosterSlicer() {
  const [image, setImage] = useState<string | null>(null);
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);
  const [overlap, setOverlap] = useState(10); // mm
  const [orientation, setOrientation] = useState<Orientation>('p');
  const [slices, setSlices] = useState<Slice[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgInfo, setImgInfo] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const a4 = orientation === 'p' ? { w: 210, h: 297 } : { w: 297, h: 210 };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImage(dataUrl);
        setSlices([]);
        const img = new Image();
        img.onload = () => {
          setImgInfo({ width: img.width, height: img.height });
          const ratio = img.width / img.height;
          if (ratio > 1.5) { setCols(3); setRows(2); }
          else if (ratio < 0.6) { setCols(2); setRows(3); }
          else { setCols(2); setRows(2); }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const processSlices = async () => {
    if (!image || !imgInfo) return;
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = image;
      await img.decode();
      const newSlices: Slice[] = [];
      const baseWidth = img.width / cols;
      const baseHeight = img.height / rows;
      const overlapX = (overlap / a4.w) * baseWidth;
      const overlapY = (overlap / a4.h) * baseHeight;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const canvas = document.createElement('canvas');
          let sx = c * baseWidth - overlapX;
          let sy = r * baseHeight - overlapY;
          let sw = baseWidth + overlapX * 2;
          let sh = baseHeight + overlapY * 2;
          if (sx < 0) { sw += sx; sx = 0; }
          if (sy < 0) { sh += sy; sy = 0; }
          if (sx + sw > img.width) sw = img.width - sx;
          if (sy + sh > img.height) sh = img.height - sy;
          canvas.width = sw;
          canvas.height = sh;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            newSlices.push({
              dataUrl: canvas.toDataURL('image/jpeg', 0.85),
              row: r,
              col: c
            });
          }
        }
      }
      setSlices(newSlices);
    } catch (err) {
      console.error(err);
      alert("Error processing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = () => {
    if (slices.length === 0) return;
    const pdf = new jsPDF({
      orientation: orientation === 'p' ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    slices.forEach((slice, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(slice.dataUrl, 'JPEG', 0, 0, a4.w, a4.h);
      pdf.setFontSize(8);
      pdf.setTextColor(180);
      pdf.text(`R:${slice.row + 1} C:${slice.col + 1} | Overlap: ${overlap}mm`, 5, a4.h - 5);
      pdf.setDrawColor(200);
      const m = 5;
      pdf.line(0, 0, m, 0); pdf.line(0, 0, 0, m);
      pdf.line(a4.w, 0, a4.w - m, 0); pdf.line(a4.w, 0, a4.w, m);
      pdf.line(0, a4.h, m, a4.h); pdf.line(0, a4.h, 0, a4.h - m);
      pdf.line(a4.w, a4.h, a4.w - m, a4.h); pdf.line(a4.w, a4.h, a4.w, a4.h - m);
    });
    pdf.save(`poster-${cols}x${rows}.pdf`);
  };

  const estWidth = (cols * a4.w - (cols - 1) * overlap) / 10;
  const estHeight = (rows * a4.h - (rows - 1) * overlap) / 10;

  return (
    <div className="tool-container">
      <header className="tool-header">
        <h1>Poster Slicer Pro</h1>
        <p>สร้างโปสเตอร์ขนาดใหญ่จากการต่อกระดาษ A4 พร้อมระบบ Overlap</p>
      </header>

      <section 
        className={`upload-zone ${image ? 'has-image' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if(e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} ref={fileInputRef} hidden />
        {!image ? (
          <div className="upload-prompt">
            <span className="icon">📤</span>
            <p>ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          </div>
        ) : (
          <div className="image-preview-wrapper">
            <img src={image} alt="Preview" className="mini-preview" />
            <button className="change-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>เปลี่ยนรูป</button>
          </div>
        )}
      </section>

      {image && (
        <section className="config-panel">
          <div className="config-grid">
            <div className="config-item">
              <label>แนวกระดาษ</label>
              <div className="toggle-group">
                <button className={orientation === 'p' ? 'active' : ''} onClick={() => setOrientation('p')}>แนวตั้ง</button>
                <button className={orientation === 'l' ? 'active' : ''} onClick={() => setOrientation('l')}>แนวนอน</button>
              </div>
            </div>
            <div className="config-item">
              <label>จำนวนคอลัมน์ (กว้าง)</label>
              <input type="number" min="1" max="15" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
            </div>
            <div className="config-item">
              <label>จำนวนแถว (สูง)</label>
              <input type="number" min="1" max="15" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
            </div>
            <div className="config-item">
              <label>ระยะซ้อนทับ (Overlap) {overlap}mm</label>
              <input type="range" min="0" max="50" step="5" value={overlap} onChange={(e) => setOverlap(Number(e.target.value))} />
            </div>
          </div>
          <div className="est-box">
            <div className="est-info">
              <span>ขนาดโดยประมาณ: <strong>{estWidth.toFixed(1)} x {estHeight.toFixed(1)} ซม.</strong></span>
              <span>จำนวนที่ต้องใช้: <strong>{cols * rows} แผ่น</strong></span>
            </div>
            <button className="process-btn" onClick={processSlices} disabled={isProcessing}>
              {isProcessing ? 'กำลังประมวลผล...' : 'เริ่มหั่นรูปภาพ'}
            </button>
          </div>
        </section>
      )}

      {slices.length > 0 && (
        <section className="results-area">
          <div className="results-header">
            <h3>หั่นเรียบร้อย! {slices.length} แผ่น</h3>
            <button className="download-btn-pro" onClick={downloadPDF}>📥 ดาวน์โหลด PDF</button>
          </div>
          <div className="preview-grid-container">
            <div className="slices-preview-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, aspectRatio: `${cols * a4.w} / ${rows * a4.h}` }}>
              {slices.map((slice, i) => (
                <div key={i} className="slice-card">
                  <img src={slice.dataUrl} alt={`Part ${i}`} />
                  <div className="slice-meta">{slice.row+1}-{slice.col+1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
