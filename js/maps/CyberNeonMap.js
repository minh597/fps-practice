class CyberNeonMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.008);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.3 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor); mapObjects.push(floor);

    const grid = new THREE.GridHelper(200, 50, 0x00e5ff, 0x142032);
    grid.position.y = 0.01;
    scene.add(grid); mapObjects.push(grid);

    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb); mapObjects.push(amb);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x121d30 });
    const coverMat = new THREE.MeshStandardMaterial({ color: 0x1c2b45, emissive: 0x00e5ff, emissiveIntensity: 0.1 });

    const createWall = (x, y, z, w, h, d, mat) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y + h / 2, z);
      scene.add(mesh);
      mapObjects.push(mesh);
    };

    createWall(0, 0, -100, 200, 15, 4, wallMat);
    createWall(0, 0, 100, 200, 15, 4, wallMat);
    createWall(-100, 0, 0, 4, 15, 200, wallMat);
    createWall(100, 0, 0, 4, 15, 200, wallMat);

    for (let i = -60; i <= 60; i += 30) {
      for (let j = -60; j <= 60; j += 30) {
        if (i === 0 && j === 0) continue;
        createWall(i, 0, j, 12, 3.5, 1.5, coverMat);
      }
    }
  }
}
