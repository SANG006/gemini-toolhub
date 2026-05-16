import { useState } from 'react'
import PosterSlicer from './components/PosterSlicer'
import ImageCompressor from './components/ImageCompressor'
import QRCodeGenerator from './components/QRCodeGenerator'
import './App.css'

type ToolId = 'home' | 'poster' | 'compressor' | 'qrcode';

function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('home');

  const tools = [
    {
      id: 'poster' as ToolId,
      title: 'Poster Slicer Pro',
      desc: 'หั่นรูปภาพเป็น A4 หลายแผ่นเพื่อทำโปสเตอร์ติดผนัง',
      icon: '🖼️',
      color: 'linear-gradient(135deg, #6366f1, #a855f7)'
    },
    {
      id: 'compressor' as ToolId,
      title: 'Image Compressor',
      desc: 'บีบอัดขนาดไฟล์ภาพให้เล็กลงโดยยังคงความคมชัด',
      icon: '🗜️',
      color: 'linear-gradient(135deg, #10b981, #3b82f6)'
    },
    {
      id: 'qrcode' as ToolId,
      title: 'QR Code Generator',
      desc: 'สร้าง QR Code ปรับแต่งสีและขนาดได้ตามต้องการ',
      icon: '📱',
      color: 'linear-gradient(135deg, #f59e0b, #ef4444)'
    }
  ];

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="nav-brand" onClick={() => setActiveTool('home')}>
          <span className="brand-logo">✨</span>
          <span className="brand-name">Gemini Tools Hub</span>
        </div>
        <div className="nav-links">
          {tools.map(t => (
            <button 
              key={t.id} 
              className={`nav-link ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => setActiveTool(t.id)}
            >
              {t.title}
            </button>
          ))}
        </div>
      </nav>

      <main className="content">
        {activeTool === 'home' && (
          <div className="dashboard">
            <header className="dash-header">
              <h1>สวัสดีครับ! วันนี้อยากทำอะไรดี?</h1>
              <p>เลือกเครื่องมือที่คุณต้องการใช้งานได้จากด้านล่างนี้เลย</p>
            </header>
            <div className="tool-grid">
              {tools.map(t => (
                <div key={t.id} className="tool-card" onClick={() => setActiveTool(t.id)}>
                  <div className="card-icon" style={{ background: t.color }}>{t.icon}</div>
                  <div className="card-body">
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                  <div className="card-footer">
                    <span>เรียกใช้งาน</span>
                    <span className="arrow">→</span>
                  </div>
                </div>
              ))}
              <div className="tool-card disabled">
                <div className="card-icon" style={{ background: '#e2e8f0', color: '#94a3b8' }}>➕</div>
                <div className="card-body">
                  <h3>Coming Soon</h3>
                  <p>เครื่องมือใหม่ๆ กำลังตามมาเร็วๆ นี้...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTool === 'poster' && <PosterSlicer />}
        {activeTool === 'compressor' && <ImageCompressor />}
        {activeTool === 'qrcode' && <QRCodeGenerator />}
      </main>

      <footer className="app-footer">
        <p>Gemini Tools Hub v1.3 | พัฒนาด้วย ❤️ โดย Gemini CLI</p>
      </footer>
    </div>
  )
}

export default App
