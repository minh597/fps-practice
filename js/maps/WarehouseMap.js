/**
 * Bản đồ Warehouse Training (Phòng tập bắn tiêu chuẩn)
 */
class WarehouseMap {
  static build(scene, registry) {
    scene.background = new THREE.Color(0x22252a);
    scene.fog = new THREE.FogExp2(0x22252a, 0.015);

    // Sàn bê tông
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x4a4e57, roughness: 0.4 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    registry.push(floor);

    // Ánh sáng đèn nhà xưởng
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(amb);
    registry.push(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(0, 30, 0);
    scene.add(dir);
    registry.push(dir);
  }
}
