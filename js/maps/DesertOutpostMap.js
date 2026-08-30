/**
 * Bản đồ Desert Outpost (Căn cứ sa mạc)
 */
class DesertOutpostMap {
  static build(scene, registry) {
    scene.background = new THREE.Color(0xd4a373);
    scene.fog = new THREE.FogExp2(0xd4a373, 0.012);

    // Mặt đất cát
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0xc29463, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    registry.push(floor);

    // Ánh sáng mặt trời vàng nắng
    const sun = new THREE.DirectionalLight(0xfff0dd, 1.2);
    sun.position.set(40, 50, -20);
    scene.add(sun);
    registry.push(sun);

    const amb = new THREE.AmbientLight(0x8a6d4b, 0.5);
    scene.add(amb);
    registry.push(amb);

    // Thùng hàng quân sự
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x7f5539, roughness: 0.6 });
    for (let k = 0; k < 12; k++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), crateMat);
      crate.position.set((Math.random() - 0.5) * 50, 2, (Math.random() - 0.5) * 50);
      scene.add(crate);
      registry.push(crate);
    }
  }
}
