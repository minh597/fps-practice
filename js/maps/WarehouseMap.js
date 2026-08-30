class WarehouseMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0x1c1e24);
    
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      new THREE.MeshStandardMaterial({ color: 0x383c45 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor); mapObjects.push(floor);

    const amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb); mapObjects.push(amb);
  }
}
