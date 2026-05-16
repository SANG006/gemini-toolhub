import { useState, useRef } from 'react'

export default function ImageCompressor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setCompressedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const compress = async () => {
    if (!originalImage) return;
    setIsProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        setCompressedImage(dataUrl);
        
        // Estimate size from dataURL
        const head = "data:image/jpeg;base64,";
        const size = Math.round((dataUrl.length - head.length) * 3 / 4);
        setCompressedSize(size);
      }
      setIsProcessing(false);
    };
    img.src = originalImage;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="tool-container">
      <header className="tool-header">
        <h1>Image Compressor</h1>
        <p>ลดขนาดไฟล์รูปภาพโดยยังคงความคมชัด (ประมวลผลบนเครื่องคุณ 100%)</p>
      </header>

      <section 
        className={`upload-zone ${originalImage ? 'has-image' : ''}`}
        onClick={() => !originalImage && fileInputRef.current?.click()}
      >
        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} ref={fileInputRef} hidden />
        {!originalImage ? (
          <div className="upload-prompt">
            <span className="icon">🗜️</span>
            <p>ลากรูปมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
          </div>
        ) : (
          <div className="image-preview-wrapper">
            <div className="mini-info">
              <img src={originalImage} alt="Original" className="mini-preview" />
              <p>ต้นฉบับ: {formatSize(originalSize)}</p>
            </div>
            <button className="change-btn" onClick={() => fileInputRef.current?.click()}>เปลี่ยนรูป</button>
          </div>
        )}
      </section>

      {originalImage && (
        <section className="config-panel">
          <div className="config-item">
            <label>คุณภาพรูปภาพ (Quality): {Math.round(quality * 100)}%</label>
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05" 
              value={quality} 
              onChange={(e) => setQuality(Number(e.target.value))} 
            />
            <p className="hint">ค่ายิ่งน้อย ไฟล์ยิ่งเล็ก แต่ความคมชัดจะลดลง</p>
          </div>
          <div className="est-box">
             <button className="process-btn" onClick={compress} disabled={isProcessing}>
              {isProcessing ? 'กำลังบีบอัด...' : 'เริ่มบีบอัด'}
            </button>
          </div>
        </section>
      )}

      {compressedImage && (
        <section className="results-area">
          <div className="results-header">
            <div className="comp-stats">
              <h3>บีบอัดเสร็จแล้ว!</h3>
              <p>ขนาดใหม่: <strong>{formatSize(compressedSize)}</strong> 
                <span className="save-tag"> (ลดลง {Math.round((1 - compressedSize/originalSize) * 100)}%)</span>
              </p>
            </div>
            <a href={compressedImage} download="compressed-image.jpg" className="download-btn-pro">
              📥 ดาวน์โหลดรูปที่บีบอัดแล้ว
            </a>
          </div>
          <div className="comparison-view">
             <div className="comp-item">
                <p>ก่อน</p>
                <img src={originalImage || undefined} alt="Before" />
             </div>
             <div className="comp-item">
                <p>หลัง</p>
                <img src={compressedImage || undefined} alt="After" />
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
