/**
 * Bản đồ Deep Space Station (Trạm không gian)
 */
class DeepSpaceMap {
  static build(scene, registry) {
    scene.background = new THREE.Color(0x020208);
    scene.fog = new THREE.FogExp2(0x020208, 0.008);

    // Sàn đĩa vũ trụ
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(40, 40, 1, 32),
      new THREE.MeshStandardMaterial({ color: 0x1b1b2f, metalness: 0.9, roughness: 0.3 })
    );
    floor.position.y = -0.5;
    scene.add(floor);
    registry.push(floor);

    // Bầu trời đầy sao
    const starsGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 800; i++) {
      starCoords.push((Math.random() - 0.5) * 300, Math.random() * 150, (Math.random() - 0.5) * 300);
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);
    registry.push(starField);

    // Ánh sáng tím huyền ảo
    const light = new THREE.PointLight(0xff00ff, 1.5, 60);
    light.position.set(0, 15, 0);
    scene.add(light);
    registry.push(light);
  }
}
