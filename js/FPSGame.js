const WEAPONS = [
  { name: 'M4A1 Assault', ammoMax: 30, reserveMax: 120, recoil: 0.015 },
  { name: 'AK-47 Heavy', ammoMax: 30, reserveMax: 90, recoil: 0.030 },
  { name: 'AWP Sniper', ammoMax: 5, reserveMax: 25, recoil: 0.080 }
];

class FPSGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.audio = new AudioEngine();
    
    this.initThree();
    
    this.mapManager = new MapManager(this.scene);
    this.droneManager = new EnemyDroneManager(this.scene);
    
    this.playing = false;
    this.paused = false;
    this.mode = 0;
    
    this.weapon = { ...WEAPONS[0] };
    this.ammo = this.weapon.ammoMax;
    this.reserve = this.weapon.reserveMax;

    this.score = 0; this.kills = 0; this.shots = 0; this.hits = 0; this.headshots = 0;
    
    this.playerPos = new THREE.Vector3(0, 1.7, 0);
    this.pitch = 0; this.yaw = 0;
    this.sensitivity = 1.0;

    this.keys = {};
    this.isCrouching = false;
    this.isSprinting = false;

    this.bindEvents();
    this.mapManager.loadMap('cyber');
    this.animate();
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 600);
    this.camera.rotation.order = 'YXZ';

    this.raycaster = new THREE.Raycaster();
  }

  start() {
    this.playing = true; this.paused = false;
    this.score = 0; this.kills = 0; this.shots = 0; this.hits = 0; this.headshots = 0;
    this.playerPos.set(0, 1.7, 0);

    this.droneManager.clear();
    for (let i = 0; i < 14; i++) this.droneManager.spawn(this.mode);

    document.querySelectorAll('.overlay-panel').forEach(el => el.style.display = 'none');
    this.canvas.requestPointerLock();
    this.updateHUD();
  }

  shoot() {
    if (!this.playing || this.paused || this.ammo <= 0) return;

    this.ammo--; this.shots++;
    this.audio.playShoot(this.weapon.name);

    this.pitch += this.weapon.recoil;
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    
    let targets = [];
    this.droneManager.drones.forEach(d => {
      if (d.alive) targets.push(...d.group.children);
    });

    const intersects = this.raycaster.intersectObjects(targets);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const isHead = hitObj.userData.isHead;
      
      this.hits++;
      if (isHead) this.headshots++;
      this.score += isHead ? 200 : 100;
      this.kills++;

      this.audio.playHit(isHead);
      
      const parentGroup = hitObj.parent;
      const dEntry = this.droneManager.drones.find(d => d.group === parentGroup);
      if (dEntry) {
        dEntry.alive = false;
        this.scene.remove(parentGroup);
        this.droneManager.spawn(this.mode);
      }
    }

    this.updateHUD();
  }

  updateHUD() {
    document.getElementById('kills').textContent = this.kills;
    document.getElementById('score').textContent = this.score;
    document.getElementById('acc').textContent = (this.shots ? Math.round(this.hits / this.shots * 100) : 100) + '%';
    document.getElementById('ammo-display').innerHTML = `${this.ammo} / <span id="reserve">${this.reserve}</span>`;
  }

  updateMovement(dt) {
    if (!this.playing || this.paused) return;

    let moveSpeed = this.isCrouching ? 4.0 : (this.isSprinting ? 16.0 : 10.0);

    const moveVector = new THREE.Vector3();
    if (this.keys['w']) moveVector.z -= 1;
    if (this.keys['s']) moveVector.z += 1;
    if (this.keys['a']) moveVector.x -= 1;
    if (this.keys['d']) moveVector.x += 1;

    moveVector.normalize();
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    this.playerPos.addScaledVector(moveVector, moveSpeed * dt);

    const targetEyeHeight = this.isCrouching ? 0.9 : 1.7;
    this.playerPos.y += (targetEyeHeight - this.playerPos.y) * dt * 10.0;

    this.camera.position.copy(this.playerPos);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      if (!this.playing || this.paused) return;
      this.yaw -= e.movementX * 0.002 * this.sensitivity;
      this.pitch -= e.movementY * 0.002 * this.sensitivity;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (this.playing && !this.paused && e.button === 0) this.shoot();
    });

    document.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if (this.playing) {
        if (k === 'control') this.isCrouching = true;
        if (k === 'shift') this.isSprinting = true;
        if (k === 'r') { this.ammo = this.weapon.ammoMax; this.updateHUD(); }
      }
    });

    document.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.keys[k] = false;
      if (k === 'control') this.isCrouching = false;
      if (k === 'shift') this.isSprinting = false;
    });

    document.getElementById('btn-play').onclick = () => this.start();
    document.getElementById('btn-play-again').onclick = () => this.start();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = 0.016;

    if (this.playing && !this.paused) {
      this.updateMovement(dt);
      this.camera.rotation.set(this.pitch, this.yaw, 0);
      this.droneManager.update(dt, this.mode);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.onload = () => {
  window.game = new FPSGame();
};
