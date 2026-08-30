class DesertOutpostMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0xd9a474);
    scene.fog = new THREE.FogExp2(0xd9a474, 0.006);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({ color: 0xc69666 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor); mapObjects.push(floor);

    const amb = new THREE.AmbientLight(0x8c6f54, 0.6);
    scene.add(amb); mapObjects.push(amb);

    const crateMat = new THREE.MeshStandardMaterial({ color: 0x6e472d });
    for (let k = 0; k < 30; k++) {
      const rx = (Math.random() - 0.5) * 140;
      const rz = (Math.random() - 0.5) * 140;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), crateMat);
      mesh.position.set(rx, 1.5, rz);
      scene.add(mesh); mapObjects.push(mesh);
    }
  }
}
