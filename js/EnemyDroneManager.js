class EnemyDroneManager {
  constructor(scene) {
    this.scene = scene;
    this.drones = [];
  }

  // Spawn ngẫu nhiên nấp sau các góc tường
  spawn(playerPos) {
    const group = new THREE.Group();
    
    // Core (Headshot point)
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xff1100, emissive: 0xff1100, emissiveIntensity: 1 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), coreMat);
    core.userData = { isHead: true };
    group.add(core);

    // Thân Drone
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9 });
    const body = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.2, 8, 16), bodyMat);
    body.rotation.x = Math.PI / 2;
    body.userData = { isHead: false };
    group.add(body);

    // Spawn cách xa người chơi từ 15m - 35m trong mê cung
    const angle = Math.random() * Math.PI * 2;
    const dist = 15 + Math.random() * 20;
    
    let spawnX = playerPos.x + Math.cos(angle) * dist;
    let spawnZ = playerPos.z + Math.sin(angle) * dist;

    // Giới hạn trong bản đồ
    spawnX = Math.max(-50, Math.min(50, spawnX));
    spawnZ = Math.max(-50, Math.min(50, spawnZ));

    group.position.set(spawnX, 1.5, spawnZ);
    this.scene.add(group);

    this.drones.push({
      group,
      speed: 4 + Math.random() * 4, // Tốc độ áp sát
      alive: true
    });
  }

  update(dt, playerPos) {
    this.drones.forEach(d => {
      if (!d.alive) return;
      
      // Hướng và đuổi theo vị trí người chơi bất ngờ
      const dir = new THREE.Vector3().subVectors(playerPos, d.group.position);
      dir.y = 0; // Giữ ở tầm nhìn ngang mặt người chơi
      dir.normalize();

      d.group.position.addScaledVector(dir, d.speed * dt);
      d.group.rotation.y += dt * 3.0; // Xoay vòng hiệu ứng
    });
  }

  clear() {
    this.drones.forEach(d => this.scene.remove(d.group));
    this.drones = [];
  }
}
