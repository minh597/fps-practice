class EnemyDroneManager {
  constructor(scene) {
    this.scene = scene;
    this.drones = [];
  }

  spawn(mode) {
    const group = new THREE.Group();
    
    // Core (Headshot point)
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff3300, emissiveIntensity: 0.9 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), coreMat);
    core.userData = { isHead: true };
    group.add(core);

    // Ring Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x222a36, metalness: 0.8 });
    const body = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.22, 8, 20), bodyMat);
    body.rotation.x = Math.PI / 2;
    body.userData = { isHead: false };
    group.add(body);

    const dist = 15 + Math.random() * 55;
    const angle = Math.random() * Math.PI * 2;
    const height = 1.2 + Math.random() * 8;
    
    group.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);
    
    this.scene.add(group);
    this.drones.push({
      group,
      vx: (Math.random() - 0.5) * (mode === 2 ? 6 : 0),
      vy: (Math.random() - 0.5) * (mode === 2 ? 3 : 0),
      alive: true
    });
  }

  update(dt, mode) {
    this.drones.forEach(d => {
      if (!d.alive) return;
      if (mode === 2) {
        d.group.position.x += d.vx * dt;
        d.group.position.y += d.vy * dt;
        if (Math.abs(d.group.position.x) > 60) d.vx *= -1;
        if (d.group.position.y < 1 || d.group.position.y > 12) d.vy *= -1;
      }
      d.group.rotation.y += dt * 1.5;
    });
  }

  clear() {
    this.drones.forEach(d => this.scene.remove(d.group));
    this.drones = [];
  }
}
