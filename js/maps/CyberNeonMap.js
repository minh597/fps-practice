/**
 * Bản đồ Cyber Neon Vault
 */
class CyberNeonMap {
  static build(scene, registry) {
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x060912, 0.018);

    // Sàn nhà dạng lưới Neon
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c1424, roughness: 0.2, metalness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    registry.push(floor);

    const grid = new THREE.GridHelper(100, 40, 0x00e5ff, 0x1a2638);
    grid.position.y = 0.01;
    scene.add(grid);
    registry.push(grid);

    // Ánh sáng và các trụ Neon
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    registry.push(amb);

    const dir = new THREE.DirectionalLight(0x00e5ff, 0.8);
    dir.position.set(20, 40, 20);
    scene.add(dir);
    registry.push(dir);

    for (let i = -30; i <= 30; i += 20) {
      for (let j = -30; j <= 30; j += 20) {
        if (Math.abs(i) < 10 && Math.abs(j) < 10) continue;
        const pil = new THREE.Mesh(
          new THREE.BoxGeometry(2, 12, 2),
          new THREE.MeshStandardMaterial({ color: 0x101a2c, emissive: 0x00e5ff, emissiveIntensity: 0.2 })
        );
        pil.position.set(i, 6, j);
        scene.add(pil);
        registry.push(pil);
      }
    }
  }
}
