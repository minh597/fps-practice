/**
 * Luồng game chính & Cấu hình phím bấm (Keybinds)
 */

// Cấu hình phím bấm mặc định
const keybinds = {
  reload: 'r',
  slot1: '1',
  slot2: '2',
  slot3: '3',
  slot4: '4',
  slot5: '5'
};

// Thông số kỹ thuật kho vũ khí
const WEAPONS = [
  { name: 'M4A1 Assault', ammoMax: 30, reserveMax: 120, rpm: 600, recoil: 0.015, damage: 45, color: 0x4488ff, type: 'auto' },
  { name: 'AK-47 Heavy', ammoMax: 30, reserveMax: 90, rpm: 500, recoil: 0.030, damage: 70, color: 0xff4400, type: 'auto' },
  { name: 'Vector SMG', ammoMax: 40, reserveMax: 160, rpm: 1100, recoil: 0.012, damage: 25, color: 0x00ffcc, type: 'auto' },
  { name: 'AWP Sniper', ammoMax: 5, reserveMax: 25, rpm: 50, recoil: 0.080, damage: 250, color: 0xffee00, type: 'bolt', scope: true },
  { name: 'Plasma Railgun', ammoMax: 10, reserveMax: 40, rpm: 180, recoil: 0.040, damage: 120, color: 0xff00ff, type: 'semi' }
];

class FPSGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.initThree();
    
    this.mapManager = new MapManager(this.scene);
    this.droneManager = new EnemyDroneManager(this.scene);
    
    this.playing = false;
    this.paused = false;
    this.mode = 0; // 0: Static, 1: Reflex, 2: Tracking
    this.modeNames = ["MỤC TIÊU TĨNH", "PHẢN XẠ NHANH", "DI CHUYỂN"];
    
    this.currWeaponIdx = 0;
    this.weapon = { ...WEAPONS[0] };
    this.ammo = this.weapon.ammoMax;
    this.reserve = this.weapon.reserveMax;

    this.score = 0; this.kills = 0; this.shots = 0; this.hits = 0; this.headshots = 0;
    this.combo = 0; this.maxCombo = 0;
    
    this.pitch = 0; this.yaw = 0;
    this.sensitivity = 1.0;
    this.recoilOffset = 0;

    this.bindEvents();
    this.mapManager.loadMap('cyber');
    this.animate(0);
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.rotation.order = 'YXZ';

    this.raycaster = new THREE.Raycaster();
  }

  start() {
    this.playing = true; this.paused = false;
    this.score = 0; this.kills = 0; this.shots = 0; this.hits = 0; this.headshots = 0;
    this.combo = 0; this.maxCombo = 0;
    this.startTime = performance.now();

    this.droneManager.clear();
    for (let i = 0; i < 10; i++) this.droneManager.spawn(this.mode);

    document.querySelectorAll('.overlay-panel').forEach(el => el.style.display = 'none');
    this.canvas.requestPointerLock();
    this.updateHUD();
  }

  pause() {
    if (!this.playing || this.paused) return;
    this.paused = true;
    document.getElementById('pause-modal').style.display = 'flex';
    document.exitPointerLock();
  }

  resume() {
    if (!this.playing || !this.paused) return;
    this.paused = false;
    document.getElementById('pause-modal').style.display = 'none';
    this.canvas.requestPointerLock();
  }

  shoot() {
    if (!this.playing || this.paused) return;
    if (this.ammo <= 0) return;

    this.ammo--; this.shots++;
    audio.playShoot(this.weapon.name);

    // Tính toán giật súng
    this.pitch += this.weapon.recoil;
    this.recoilOffset += this.weapon.recoil * 100;

    // Raycast bắn đường đạn 3D
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    
    let targets = [];
    this.droneManager.drones.forEach(d => {
      if (d.alive) targets.push(...d.group.children);
    });

    const intersects = this.raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const isHead = hitObj.userData.isHead;
      
      this.hits++; this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      
      if (isHead) this.headshots++;
      const pts = (isHead ? 200 : 100) + this.combo * 10;
      this.score += pts;
      this.kills++;

      audio.playHit(isHead);
      this.triggerHitmark();

      // Xóa Drone bị tiêu diệt
      const parentGroup = hitObj.parent;
      const dEntry = this.droneManager.drones.find(d => d.group === parentGroup);
      if (dEntry) {
        dEntry.alive = false;
        this.scene.remove(parentGroup);
        this.droneManager.spawn(this.mode);
      }
    } else {
      this.combo = 0;
    }

    this.updateHUD();
  }

  triggerHitmark() {
    const hm = document.getElementById('hitmark');
    hm.classList.remove('hitmark-active');
    void hm.offsetWidth;
    hm.classList.add('hitmark-active');
  }

  updateHUD() {
    document.getElementById('kills').textContent = this.kills;
    document.getElementById('score').textContent = this.score;
    document.getElementById('acc').textContent = (this.shots ? Math.round(this.hits / this.shots * 100) : 100) + '%';
    document.getElementById('weapon-name').textContent = this.weapon.name;
    document.getElementById('ammo-display').innerHTML = `${this.ammo} / <span id="reserve">${this.reserve}</span><small>${this.weapon.type.toUpperCase()}</small>`;
  }

  end() {
    this.playing = false;
    document.exitPointerLock();
    
    const acc = this.shots ? Math.round(this.hits / this.shots * 100) : 100;
    const hs = this.kills ? Math.round(this.headshots / this.kills * 100) : 0;
    
    document.getElementById('res-score').textContent = this.score;
    document.getElementById('res-kills').textContent = this.kills;
    document.getElementById('res-acc').textContent = acc + '%';
    document.getElementById('res-hs').textContent = hs + '%';
    document.getElementById('res-combo').textContent = 'x' + this.maxCombo;

    let grade = 'D';
    if (this.score > 4000) grade = 'S';
    else if (this.score > 2500) grade = 'A';
    else if (this.score > 1200) grade = 'B';
    document.getElementById('grade').textContent = grade;

    document.getElementById('result-modal').style.display = 'flex';
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.playing || this.paused) return;
      this.yaw -= e.movementX * 0.002 * this.sensitivity;
      this.pitch -= e.movementY * 0.002 * this.sensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    this.canvas.addEventListener('mousedown', (e) => {
      audio.init();
      if (!this.playing) return;
      if (this.paused) { this.resume(); return; }
      if (e.button === 0) this.shoot();
    });

    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'escape' && this.playing) {
        this.paused ? this.resume() : this.pause();
      }
      if (this.playing && !this.paused) {
        if (k === keybinds.reload) {
          this.ammo = this.weapon.ammoMax;
          this.updateHUD();
        }
        if (k === keybinds.slot1) this.switchWeapon(0);
        if (k === keybinds.slot2) this.switchWeapon(1);
        if (k === keybinds.slot3) this.switchWeapon(2);
        if (k === keybinds.slot4) this.switchWeapon(3);
        if (k === keybinds.slot5) this.switchWeapon(4);
      }
    });

    // Menu Controls
    document.getElementById('btn-play').onclick = () => this.start();
    document.getElementById('btn-restart').onclick = () => this.start();
    document.getElementById('btn-play-again').onclick = () => this.start();
    document.getElementById('btn-resume').onclick = () => this.resume();
    
    document.getElementById('btn-select-mode').onclick = (e) => {
      this.mode = (this.mode + 1) % 3;
      e.target.textContent = "🎯 CHẾ ĐỘ: " + this.modeNames[this.mode];
    };

    // Chọn Map Modal
    document.getElementById('btn-select-map').onclick = () => {
      document.getElementById('map-modal').style.display = 'flex';
    };
    document.getElementById('btn-close-map').onclick = () => {
      document.getElementById('map-modal').style.display = 'none';
    };
    document.querySelectorAll('.map-opt-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.map-opt-btn').forEach(b => b.classList.add('btn-secondary'));
        e.target.classList.remove('btn-secondary');
        const mapId = e.target.dataset.map;
        this.mapManager.loadMap(mapId);
        document.getElementById('current-map-name').textContent = e.target.textContent;
      };
    });

    // Settings & Custom Keybinds
    const openSettings = () => document.getElementById('settings-modal').style.display = 'flex';
    document.getElementById('btn-settings').onclick = openSettings;
    document.getElementById('btn-pause-settings').onclick = openSettings;
    document.getElementById('btn-close-settings').onclick = () => document.getElementById('settings-modal').style.display = 'none';

    document.getElementById('sens-slider').oninput = (e) => {
      this.sensitivity = parseFloat(e.target.value);
      document.getElementById('sens-val').textContent = this.sensitivity.toFixed(1);
    };

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById('tab-' + e.target.dataset.tab).classList.add('active');
      };
    });

    document.querySelectorAll('.keybind-btn').forEach(btn => {
      btn.onclick = (e) => {
        const action = e.target.dataset.action;
        e.target.classList.add('listening');
        e.target.textContent = 'ẤN PHÍM...';
        
        const handler = (ev) => {
          ev.preventDefault();
          keybinds[action] = ev.key.toLowerCase();
          e.target.textContent = ev.key.toUpperCase();
          e.target.classList.remove('listening');
          window.removeEventListener('keydown', handler);
        };
        window.addEventListener('keydown', handler);
      };
    });
  }

  switchWeapon(idx) {
    this.currWeaponIdx = idx;
    this.weapon = { ...WEAPONS[idx] };
    this.ammo = this.weapon.ammoMax;
    this.reserve = this.weapon.reserveMax;
    this.updateHUD();
  }

  animate(time) {
    requestAnimationFrame((t) => this.animate(t));

    const dt = 0.016;
    if (this.playing && !this.paused) {
      // Giảm độ giật súng trả về tâm ngắm
      this.pitch += (0 - this.pitch) * dt * 2.0;
      this.recoilOffset += (0 - this.recoilOffset) * dt * 10.0;
      
      const ring = document.getElementById('recoil-ring');
      ring.style.opacity = this.recoilOffset > 1 ? 0.8 : 0;
      ring.style.width = (28 + this.recoilOffset) + 'px';
      ring.style.height = (28 + this.recoilOffset) + 'px';

      // Xoay Camera
      this.camera.rotation.set(this.pitch, this.yaw, 0);

      // Đếm ngược thời gian
      const elapsed = Math.floor((performance.now() - this.startTime) / 1000);
      const remain = Math.max(0, 60 - elapsed);
      document.getElementById('time').textContent = `00:${String(remain).padStart(2, '0')}`;
      if (remain <= 0) this.end();

      this.droneManager.update(dt, this.mode);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Tự động khởi chạy trò chơi khi trang load xong
window.onload = () => {
  window.game = new FPSGame();
};
