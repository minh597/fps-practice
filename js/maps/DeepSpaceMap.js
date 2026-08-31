class DeepSpaceMap {
  static build(scene, mapObjects) {
    scene.background = new THREE.Color(0x01030a);

    const add = (obj) => {
      scene.add(obj);
      mapObjects.push(obj);
      return obj;
    };

    const mat = (color, metalness = 0.3, roughness = 0.7) =>
      new THREE.MeshStandardMaterial({
        color,
        metalness,
        roughness
      });

    const emissive = (color, glow, intensity = 2) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: glow,
        emissiveIntensity: intensity,
        metalness: 0.4,
        roughness: 0.3
      });

    const floorMat = mat(0x101522, 0.75, 0.35);
    const wallMat = mat(0x252c3d, 0.8, 0.35);
    const darkMat = mat(0x070a12, 0.85, 0.45);
    const metalMat = mat(0x3c4354, 0.95, 0.22);
    const blue = emissive(0x008cff, 0x0066ff, 2.5);
    const cyan = emissive(0x00ffff, 0x00aaff, 3);
    const red = emissive(0xff1744, 0xff0033, 3);
    const purple = emissive(0x8a2be2, 0x5b00aa, 2.5);

    const box = (x, y, z, sx, sy, sz, material, rot = 0) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        material
      );
      m.position.set(x, y, z);
      m.rotation.y = rot;
      return add(m);
    };

    const cylinder = (
      x,
      y,
      z,
      radius,
      height,
      material,
      segments = 32
    ) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(
          radius,
          radius,
          height,
          segments
        ),
        material
      );
      m.position.set(x, y, z);
      return add(m);
    };

    const light = (
      color,
      intensity,
      distance,
      x,
      y,
      z
    ) => {
      const l = new THREE.PointLight(
        color,
        intensity,
        distance
      );
      l.position.set(x, y, z);
      return add(l);
    };

    const floor = box(
      0,
      -1,
      0,
      160,
      2,
      160,
      floorMat
    );

    const grid = new THREE.GridHelper(
      160,
      80,
      0x0088bb,
      0x182536
    );

    grid.position.y = 0.02;
    add(grid);

    box(0, 9, -80, 160, 18, 2, wallMat);
    box(0, 9, 80, 160, 18, 2, wallMat);
    box(-80, 9, 0, 2, 18, 160, wallMat);
    box(80, 9, 0, 2, 18, 160, wallMat);

    box(-35, 5, -55, 35, 10, 3, wallMat);
    box(35, 5, -55, 35, 10, 3, wallMat);

    box(-35, 5, 55, 35, 10, 3, wallMat);
    box(35, 5, 55, 35, 10, 3, wallMat);

    box(-55, 5, -35, 3, 10, 35, wallMat);
    box(-55, 5, 35, 3, 10, 35, wallMat);

    box(55, 5, -35, 3, 10, 35, wallMat);
    box(55, 5, 35, 3, 10, 35, wallMat);

    box(-25, 4, -25, 18, 8, 3, darkMat);
    box(25, 4, -25, 18, 8, 3, darkMat);
    box(-25, 4, 25, 18, 8, 3, darkMat);
    box(25, 4, 25, 18, 8, 3, darkMat);

    const cover = [
      [-12, 2, -10, 6, 4, 3, 0],
      [12, 2, -10, 6, 4, 3, 0],
      [-12, 2, 10, 6, 4, 3, 0],
      [12, 2, 10, 6, 4, 3, 0],
      [-38, 2, -12, 4, 4, 7, 0],
      [38, 2, -12, 4, 4, 7, 0],
      [-38, 2, 12, 4, 4, 7, 0],
      [38, 2, 12, 4, 4, 7, 0],
      [-10, 2, -38, 7, 4, 4, Math.PI / 2],
      [10, 2, -38, 7, 4, 4, Math.PI / 2],
      [-10, 2, 38, 7, 4, 4, Math.PI / 2],
      [10, 2, 38, 7, 4, 4, Math.PI / 2]
    ];

    for (const c of cover) {
      box(...c, metalMat);
    }

    for (const [x, z] of [
      [-28, -28],
      [28, -28],
      [-28, 28],
      [28, 28]
    ]) {
      cylinder(x, 6, z, 2.2, 12, metalMat);
      cylinder(x, 6, z, 1.25, 12.2, blue);
      light(0x0088ff, 2, 18, x, 7, z);
    }

    const reactorBase = cylinder(
      0,
      1,
      0,
      7,
      2,
      metalMat,
      48
    );

    cylinder(
      0,
      6,
      0,
      5,
      10,
      darkMat,
      48
    );

    cylinder(
      0,
      6,
      0,
      3.2,
      10.5,
      cyan,
      48
    );

    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          4.5 + i * 1.2,
          0.14,
          12,
          64
        ),
        i % 2 === 0 ? cyan : purple
      );

      ring.position.y = 2 + i * 2.6;
      ring.rotation.x = Math.PI / 2;
      add(ring);
    }

    light(
      0x00ffff,
      4,
      35,
      0,
      7,
      0
    );

    const consoles = [
      [-65, -50],
      [65, -50],
      [-65, 50],
      [65, 50],
      [-50, 0],
      [50, 0]
    ];

    for (const [x, z] of consoles) {
      box(x, 2, z, 6, 4, 3, darkMat);
      box(x, 3.2, z - 1.6, 4, 2, 0.15, blue);
      box(x, 0.7, z - 1.7, 2, 0.25, 0.15, cyan);
      light(0x0088ff, 0.8, 10, x, 4, z);
    }

    const doors = [
      [0, 5, -78, 14, 10, 1],
      [0, 5, 78, 14, 10, 1],
      [-78, 5, 0, 1, 10, 14],
      [78, 5, 0, 1, 10, 14]
    ];

    for (const [x, y, z, sx, sy, sz] of doors) {
      box(x, y, z, sx, sy, sz, darkMat);

      box(
        x,
        y,
        z + (z < -50 ? 0.7 : z > 50 ? -0.7 : 0),
        Math.min(sx * 0.65, 9),
        7,
        0.15,
        blue
      );
    }

    for (const z of [-65, -35, 0, 35, 65]) {
      box(-68, 10, z, 0.4, 0.3, 8, cyan);
      box(68, 10, z, 0.4, 0.3, 8, cyan);
    }

    for (const x of [-65, -35, 0, 35, 65]) {
      box(x, 10, -68, 8, 0.3, 0.4, cyan);
      box(x, 10, 68, 8, 0.3, 0.4, cyan);
    }

    for (const [x, z] of [
      [-70, -70],
      [70, -70],
      [-70, 70],
      [70, 70]
    ]) {
      cylinder(x, 7, z, 0.65, 1.2, red, 20);
      light(0xff0033, 2.5, 20, x, 7, z);
    }

    for (let i = 0; i < 16; i++) {
      const x =
        Math.floor((Math.random() - 0.5) * 130 / 5) * 5;

      const z =
        Math.floor((Math.random() - 0.5) * 130 / 5) * 5;

      if (Math.abs(x) < 15 && Math.abs(z) < 15) {
        continue;
      }

      box(
        x,
        12 + Math.random() * 8,
        z,
        2 + Math.random() * 3,
        0.7,
        2 + Math.random() * 3,
        metalMat,
        Math.random() * Math.PI
      );
    }

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(
      starCount * 3
    );

    for (let i = 0; i < starCount; i++) {
      const n = i * 3;

      positions[n] =
        (Math.random() - 0.5) * 600;

      positions[n + 1] =
        Math.random() * 300 + 25;

      positions[n + 2] =
        (Math.random() - 0.5) * 600;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.6
      })
    );

    add(stars);

    add(
      new THREE.AmbientLight(
        0x30354d,
        0.65
      )
    );

    const directional = new THREE.DirectionalLight(
      0x6688ff,
      1.2
    );

    directional.position.set(
      -40,
      70,
      -40
    );

    add(directional);

    const spawnPoints = [
      new THREE.Vector3(-65, 0, -65),
      new THREE.Vector3(65, 0, -65),
      new THREE.Vector3(-65, 0, 65),
      new THREE.Vector3(65, 0, 65),
      new THREE.Vector3(-45, 0, 0),
      new THREE.Vector3(45, 0, 0),
      new THREE.Vector3(0, 0, -45),
      new THREE.Vector3(0, 0, 45),
      new THREE.Vector3(-30, 0, -15),
      new THREE.Vector3(30, 0, -15),
      new THREE.Vector3(-30, 0, 15),
      new THREE.Vector3(30, 0, 15)
    ];

    mapObjects.spawnPoints = spawnPoints;

    mapObjects.mapInfo = {
      name: "Deep Space Base",
      type: "close_quarters",
      size: 160,
      spawnPoints,
      playerSpawn: new THREE.Vector3(0, 0, 50),
      maxEnemies: 20
    };
  }
}
