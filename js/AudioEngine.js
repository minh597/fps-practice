/**
 * Bộ tổng hợp âm thanh hiệu ứng bằng Web Audio API (Không cần tải file bên ngoài)
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.8;
  }

  // Khởi tạo AudioContext khi người dùng click tương tác với trang web
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  
  // Âm thanh khi bắn súng
  playShoot(wType) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = wType === 'Plasma Railgun' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(wType === 'AWP Sniper' ? 120 : 350, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    
    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.12);
  }

  // Âm thanh trúng mục tiêu (Headshot hay Bodyshot)
  playHit(isHead) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHead ? 1400 : 700, t);
    osc.frequency.exponentialRampToValueAtTime(isHead ? 2400 : 400, t + 0.08);
    
    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.08);
  }
}

// Global Audio Manager Singleton Instance
const audio = new AudioEngine();
