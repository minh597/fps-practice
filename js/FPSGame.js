import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class FPSGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.audio = new AudioEngine();

    this.initThree();

    this.mapManager = new MapManager(this.scene);
    this.droneManager = new EnemyDroneManager(this.scene);

    this.selectedMapKey = 'cyber';
    this.playing = false;
    this.paused = false;
    this.isCrouching = false;

    this.weapon = {
      name: 'AWM',
      ammoMax: 5,
      reserveMax: 40,
      recoil: 0.035
    };

    this.ammo = this.weapon.ammoMax;
    this.weaponModel = null;

    this.score = 0;
    this.kills = 0;
    this.shots = 0;
    this.hits = 0;
    this.headshots = 0;

    this.playerPos = new THREE.Vector3(0, 1.7, 0);
    this.pitch = 0;
    this.yaw = 0;
    this.sensitivity = 1.0;

    this.keys = {};

    this.bindEvents();
    this.loadWeaponModel();

    this.mapManager.loadMap(this.selectedMapKey);
    this.animate();
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    this.camera.rotation.order = 'YXZ';

    this.scene.add(this.camera);

    this.raycaster = new THREE.Raycaster();

    window.addEventListener('resize', () => {
      this.camera.aspect =
        window.innerWidth / window.innerHeight;

      this.camera.updateProjectionMatrix();

      this.renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    });
  }

  loadWeaponModel() {
    const loader = new GLTFLoader();

    loader.load(
      'Models/Awm.glb',

      (gltf) => {
        this.weaponModel = gltf.scene;

        this.weaponModel.scale.set(
          1,
          1,
          1
        );

        this.weaponModel.position.set(
          0.35,
          -0.35,
          -0.7
        );

        this.weaponModel.rotation.set(
          0,
          Math.PI,
          0
        );

        this.weaponModel.traverse((child) => {
          child.userData.isWeapon = true;
        });

        this.camera.add(this.weaponModel);

        console.log('AWM loaded successfully');
      },

      (progress) => {
        if (progress.total) {
          const percent =
            (progress.loaded / progress.total) * 100;

          console.log(
            `AWM loading: ${percent.toFixed(0)}%`
          );
        }
      },

      (error) => {
        console.error(
          'Failed to load Models/Awm.glb',
          error
        );
      }
    );
  }

  start() {
    this.playing = true;
    this.paused = false;

    this.score = 0;
    this.kills = 0;
    this.shots = 0;
    this.hits = 0;
    this.headshots = 0;

    this.ammo = this.weapon.ammoMax;

    this.playerPos.set(
      0,
      1.7,
      0
    );

    this.pitch = 0;
    this.yaw = 0;

    this.mapManager.loadMap(
      this.selectedMapKey
    );

    this.droneManager.clear();

    for (let i = 0; i < 8; i++) {
      this.droneManager.spawn(
        this.playerPos
      );
    }

    const startModal =
      document.getElementById('start-modal');

    const resultModal =
      document.getElementById('result-modal');

    if (startModal) {
      startModal.style.display = 'none';
    }

    if (resultModal) {
      resultModal.style.display = 'none';
    }

    this.canvas.requestPointerLock();

    this.updateHUD();
  }

  endAndAnalyze() {
    this.playing = false;

    document.exitPointerLock();

    const accuracy =
      this.shots
        ? Math.round(
            this.hits /
            this.shots *
            100
          )
        : 100;

    let grade = 'C';

    if (this.score > 2000) {
      grade = 'S';
    } else if (this.score > 1000) {
      grade = 'A';
    } else if (this.score > 500) {
      grade = 'B';
    }

    const scoreEl =
      document.getElementById('res-score');

    const killsEl =
      document.getElementById('res-kills');

    const accEl =
      document.getElementById('res-acc');

    const headshotsEl =
      document.getElementById('res-headshots');

    const gradeEl =
      document.getElementById('grade');

    if (scoreEl) {
      scoreEl.textContent = this.score;
    }

    if (killsEl) {
      killsEl.textContent = this.kills;
    }

    if (accEl) {
      accEl.textContent =
        accuracy + '%';
    }

    if (headshotsEl) {
      headshotsEl.textContent =
        this.headshots;
    }

    if (gradeEl) {
      gradeEl.textContent = grade;
    }

    const resultModal =
      document.getElementById('result-modal');

    if (resultModal) {
      resultModal.style.display = 'flex';
    }
  }

  shoot() {
    if (
      !this.playing ||
      this.paused ||
      this.ammo <= 0
    ) {
      return;
    }

    this.ammo--;
    this.shots++;

    this.audio.playShoot(
      this.weapon.name
    );

    this.pitch +=
      this.weapon.recoil;

    this.raycaster.setFromCamera(
      {
        x: 0,
        y: 0
      },
      this.camera
    );

    const targets = [];

    this.droneManager.drones.forEach((d) => {
      if (d.alive) {
        d.group.traverse((child) => {
          if (!child.userData.isWeapon) {
            targets.push(child);
          }
        });
      }
    });

    const intersects =
      this.raycaster.intersectObjects(
        targets,
        true
      );

    if (intersects.length > 0) {
      const hitObj =
        intersects[0].object;

      const isHead =
        hitObj.userData.isHead === true;

      this.hits++;

      if (isHead) {
        this.headshots++;
      }

      this.score +=
        isHead ? 250 : 100;

      this.kills++;

      this.audio.playHit(
        isHead
      );

      let current =
        hitObj;

      let dEntry = null;

      while (current && !dEntry) {
        dEntry =
          this.droneManager.drones.find(
            d => d.group === current
          );

        current =
          current.parent;
      }

      if (dEntry) {
        dEntry.alive = false;

        this.scene.remove(
          dEntry.group
        );

        this.droneManager.spawn(
          this.playerPos
        );
      }
    }

    this.updateHUD();
  }

  reload() {
    if (
      !this.playing ||
      this.paused
    ) {
      return;
    }

    if (
      this.ammo >=
      this.weapon.ammoMax
    ) {
      return;
    }

    this.ammo =
      this.weapon.ammoMax;

    this.updateHUD();
  }

  updateHUD() {
    const killsEl =
      document.getElementById('kills');

    const scoreEl =
      document.getElementById('score');

    const accEl =
      document.getElementById('acc');

    const ammoEl =
      document.getElementById('ammo-display');

    const accuracy =
      this.shots
        ? Math.round(
            this.hits /
            this.shots *
            100
          )
        : 100;

    if (killsEl) {
      killsEl.textContent =
        this.kills;
    }

    if (scoreEl) {
      scoreEl.textContent =
        this.score;
    }

    if (accEl) {
      accEl.textContent =
        accuracy + '%';
    }

    if (ammoEl) {
      ammoEl.innerHTML =
        `${this.ammo} / ${this.weapon.reserveMax}`;
    }
  }

  updateMovement(dt) {
    if (
      !this.playing ||
      this.paused
    ) {
      return;
    }

    const moveSpeed =
      this.isCrouching
        ? 4.0
        : 10.0;

    const moveVector =
      new THREE.Vector3();

    if (this.keys['w']) {
      moveVector.z -= 1;
    }

    if (this.keys['s']) {
      moveVector.z += 1;
    }

    if (this.keys['a']) {
      moveVector.x -= 1;
    }

    if (this.keys['d']) {
      moveVector.x += 1;
    }

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();

      moveVector.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.yaw
      );

      this.playerPos.addScaledVector(
        moveVector,
        moveSpeed * dt
      );
    }

    const targetEyeHeight =
      this.isCrouching
        ? 0.9
        : 1.7;

    this.playerPos.y +=
      (
        targetEyeHeight -
        this.playerPos.y
      ) *
      dt *
      10.0;

    this.camera.position.copy(
      this.playerPos
    );
  }

  bindEvents() {
    document.addEventListener(
      'mousemove',
      (e) => {
        if (
          !this.playing ||
          document.pointerLockElement !==
            this.canvas
        ) {
          return;
        }

        this.yaw -=
          e.movementX *
          0.002 *
          this.sensitivity;

        this.pitch -=
          e.movementY *
          0.002 *
          this.sensitivity;

        this.pitch =
          Math.max(
            -Math.PI / 2.2,
            Math.min(
              Math.PI / 2.2,
              this.pitch
            )
          );
      }
    );

    this.canvas.addEventListener(
      'mousedown',
      (e) => {
        this.audio.init();

        if (
          this.playing &&
          e.button === 0
        ) {
          this.shoot();
        }
      }
    );

    document.addEventListener(
      'keydown',
      (e) => {
        const k =
          e.key.toLowerCase();

        this.keys[k] = true;

        if (k === 'c') {
          this.isCrouching = true;
        }

        if (e.key === 'Control') {
          if (
            document.pointerLockElement ===
            this.canvas
          ) {
            document.exitPointerLock();
          } else if (
            this.playing
          ) {
            this.canvas.requestPointerLock();
          }
        }

        if (
          k === 'x' &&
          this.playing
        ) {
          this.endAndAnalyze();
        }

        if (
          k === 'r' &&
          this.playing
        ) {
          this.reload();
        }
      }
    );

    document.addEventListener(
      'keyup',
      (e) => {
        const k =
          e.key.toLowerCase();

        this.keys[k] = false;

        if (k === 'c') {
          this.isCrouching = false;
        }
      }
    );

    document
      .querySelectorAll('.map-card')
      .forEach((card) => {
        card.addEventListener(
          'click',
          () => {
            document
              .querySelectorAll(
                '.map-card'
              )
              .forEach((c) => {
                c.classList.remove(
                  'active'
                );
              });

            card.classList.add(
              'active'
            );

            this.selectedMapKey =
              card.getAttribute(
                'data-map'
              );
          }
        );
      });

    const btnPlay =
      document.getElementById(
        'btn-play'
      );

    if (btnPlay) {
      btnPlay.addEventListener(
        'click',
        () => this.start()
      );
    }

    const btnPlayAgain =
      document.getElementById(
        'btn-play-again'
      );

    if (btnPlayAgain) {
      btnPlayAgain.addEventListener(
        'click',
        () => this.start()
      );
    }

    const btnMenu =
      document.getElementById(
        'btn-menu'
      );

    if (btnMenu) {
      btnMenu.addEventListener(
        'click',
        () => {
          const resultModal =
            document.getElementById(
              'result-modal'
            );

          const startModal =
            document.getElementById(
              'start-modal'
            );

          if (resultModal) {
            resultModal.style.display =
              'none';
          }

          if (startModal) {
            startModal.style.display =
              'flex';
          }
        }
      );
    }
  }

  animate() {
    requestAnimationFrame(
      () => this.animate()
    );

    const dt = 0.016;

    if (
      this.playing &&
      !this.paused
    ) {
      this.updateMovement(dt);

      this.camera.rotation.set(
        this.pitch,
        this.yaw,
        0
      );

      this.droneManager.update(
        dt,
        this.playerPos
      );
    }

    this.renderer.render(
      this.scene,
      this.camera
    );
  }
}

window.onload = () => {
  window.game = new FPSGame();
};
