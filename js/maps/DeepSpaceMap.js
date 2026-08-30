class DeepSpaceMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0x020208);
    
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(100, 100, 2, 48),
      new THREE.MeshStandardMaterial({ color: 0x161724, metalness: 0.5 })
    );
    floor.position.y = -1;
    scene.add(floor); mapObjects.push(floor);

    const amb = new THREE.AmbientLight(0x404060, 0.7);
    scene.add(amb); mapObjects.push(amb);
  }
}
