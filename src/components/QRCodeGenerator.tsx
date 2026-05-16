import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function QRCodeGenerator() {
  const [text, setText] = useState('https://github.com');
  const [qrUrl, setQrUrl] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(4);
  const [size, setSize] = useState(300);

  const generateQR = async () => {
    if (!text) return;
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateQR();
  }, [text, fgColor, bgColor, margin, size]);

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrUrl;
    link.click();
  };

  const copyToClipboard = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      alert('คัดลอก QR Code ลง Clipboard เรียบร้อยแล้ว!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('ไม่สามารถคัดลอกได้ใน Browser นี้');
    }
  };

  return (
    <div className="tool-container">
      <header className="tool-header">
        <h1>QR Code Generator</h1>
        <p>สร้าง QR Code สำหรับลิงก์, ข้อความ หรือเบอร์โทรศัพท์ พร้อมปรับแต่งสีได้</p>
      </header>

      <div className="qr-layout">
        <section className="config-panel">
          <div className="config-item">
            <label>ข้อความ หรือ URL</label>
            <textarea 
              rows={3}
              value={text} 
              onChange={(e) => setText(e.target.value)}
              placeholder="ใส่ลิงก์หรือข้อความที่นี่..."
              className="full-width-input"
            />
          </div>

          <div className="config-grid">
            <div className="config-item">
              <label>สีจุด (Foreground)</label>
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
            </div>
            <div className="config-item">
              <label>สีพื้นหลัง (Background)</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
            <div className="config-item">
              <label>ขอบ (Margin): {margin}</label>
              <input type="range" min="0" max="10" value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
            </div>
            <div className="config-item">
              <label>ขนาด (px): {size}</label>
              <input type="range" min="100" max="1000" step="50" value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </div>
          </div>
        </section>

        <section className="qr-preview-section">
          <div className="qr-card">
            {qrUrl ? (
              <>
                <img src={qrUrl} alt="QR Code" className="qr-image" />
                <div className="qr-actions">
                  <button className="download-btn-pro" onClick={downloadQR}>
                    📥 ดาวน์โหลด PNG
                  </button>
                  <button className="secondary-btn" onClick={copyToClipboard} style={{ width: '100%', marginTop: '10px' }}>
                    📋 คัดลอกรูปภาพ
                  </button>
                </div>
              </>
            ) : (
              <p>กำลังเตรียมความพร้อม...</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
