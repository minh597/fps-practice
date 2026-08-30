class CyberNeonMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0x04060a);
    scene.fog = new THREE.FogExp2(0x04060a, 0.025); // Sương mù dày để giấu góc mê cung

    // Sàn nhà
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 0.4 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor); mapObjects.push(floor);

    const grid = new THREE.GridHelper(120, 40, 0x00e5ff, 0x142032);
    grid.position.y = 0.01;
    scene.add(grid); mapObjects.push(grid);

    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb); mapObjects.push(amb);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x101a2d, roughness: 0.2 });

    const createWall = (x, z, w, d) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 8, d), wallMat);
      mesh.position.set(x, 4, z);
      scene.add(mesh);
      mapObjects.push(mesh);
    };

    // Khung mê cung bao bên ngoài
    createWall(0, -60, 120, 4); createWall(0, 60, 120, 4);
    createWall(-60, 0, 4, 120); createWall(60, 0, 4, 120);

    // Thuật toán dựng các vách tường hành lang Mê Cung
    const mazeLayout = [
      [-30, -30, 40, 4], [-10, -10, 4, 40], [20, -40, 4, 30],
      [30, 10, 30, 4], [-40, 20, 4, 40], [10, 30, 40, 4],
      [-20, 40, 30, 4], [40, -20, 4, 30]
    ];

    mazeLayout.forEach(w => createWall(w[0], w[1], w[2], w[3]));
  }
}
