/**
 * Trình Quản Lý Mục Tiêu 3D Cyber Drones
 */
class EnemyDroneManager {
  constructor(scene) {
    this.scene = scene;
    this.drones = [];
  }

  // Tạo Drone 3D mới
  spawn(mode) {
    const group = new THREE.Group();
    
    // Lõi Năng Lượng (Vùng Headshot)
    const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff3300, emissiveIntensity: 0.8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.userData = { isHead: true };
    group.add(core);

    // Vòng giáp kim loại xung quanh
    const bodyGeo = new THREE.TorusGeometry(1.0, 0.25, 8, 24);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a323d, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.userData = { isHead: false };
    group.add(body);

    // Vị trí xuất hiện ngẫu nhiên trong không gian 3D
    const dist = 12 + Math.random() * 18;
    const angle = Math.random() * Math.PI * 2;
    const height = 1 + Math.random() * 8;
    
    group.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);
    
    this.scene.add(group);
    this.drones.push({
      group,
      born: performance.now(),
      vx: (Math.random() - 0.5) * (mode === 2 ? 4 : 0),
      vy: (Math.random() - 0.5) * (mode === 2 ? 2 : 0),
      alive: true
    });
  }

  // Cập nhật chuyển động của các Drones
  update(dt, mode) {
    this.drones.forEach(d => {
      if (!d.alive) return;
      if (mode === 2) { // Mode di chuyển
        d.group.position.x += d.vx * dt;
        d.group.position.y += d.vy * dt;
        if (Math.abs(d.group.position.x) > 25) d.vx *= -1;
        if (d.group.position.y < 1 || d.group.position.y > 10) d.vy *= -1;
      }
      d.group.rotation.y += dt * 1.5;
    });
  }

  // Xóa sạch tất cả Drone
  clear() {
    this.drones.forEach(d => this.scene.remove(d.group));
    this.drones = [];
  }
}
