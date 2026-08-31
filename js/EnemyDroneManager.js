class EnemyDroneManager {
  constructor(scene) {
    this.scene = scene;
    this.dummies = [];
    this.maxDummies = 10;
    this.mapLimit = 68;
    this.speedMin = 2;
    this.speedMax = 4;

    // Walking animation tuning
    this.walkCycleSpeed = 6; // how fast the limb swing cycles per unit speed
    this.walkSwingAmplitude = 0.55; // radians, arms/legs swing
    this.walkBobAmplitude = 0.05; // vertical torso bob
    this.poseLerpSpeed = 8; // how quickly limbs ease toward idle when stopped
  }

  createDummy() {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x263238,
      metalness: 0.4,
      roughness: 0.7
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xc7a27c,
      roughness: 0.8
    });

    const headMat = new THREE.MeshStandardMaterial({
      color: 0xff3333,
      emissive: 0x440000,
      emissiveIntensity: 1
    });

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.35, 0.5),
      bodyMat
    );
    torso.position.y = 1.55;
    torso.userData.hitPart = "body";
    group.add(torso);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 16, 16),
      headMat
    );
    head.position.y = 2.55;
    head.userData = {
      isHead: true,
      hitPart: "head"
    };
    group.add(head);

    // Arms and legs are pivoted so rotation.x swings them naturally
    // from the shoulder/hip instead of from their geometric center.

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.65, 2.15, 0);
    const leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 1.25, 0.28),
      skinMat
    );
    leftArm.position.set(0, -0.625, 0);
    leftArm.rotation.z = -0.08;
    leftArm.userData.hitPart = "arm";
    leftArmPivot.add(leftArm);
    group.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.65, 2.15, 0);
    const rightArm = leftArm.clone();
    rightArm.position.set(0, -0.625, 0);
    rightArm.rotation.z = 0.08;
    rightArmPivot.add(rightArm);
    group.add(rightArmPivot);

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.23, 1.125, 0);
    const leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 1.35, 0.34),
      bodyMat
    );
    leftLeg.position.set(0, -0.675, 0);
    leftLeg.userData.hitPart = "leg";
    leftLegPivot.add(leftLeg);
    group.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.23, 1.125, 0);
    const rightLeg = leftLeg.clone();
    rightLeg.position.set(0, -0.675, 0);
    rightLegPivot.add(rightLeg);
    group.add(rightLegPivot);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 24),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35
      })
    );

    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    group.add(shadow);

    group.userData.isEnemy = true;

    // Keep references for animation
    group.userData.limbs = {
      leftArmPivot,
      rightArmPivot,
      leftLegPivot,
      rightLegPivot,
      torso
    };
    group.userData.walkPhase = Math.random() * Math.PI * 2; // desync dummies
    group.userData.walkBlend = 0; // 0 = idle pose, 1 = full walk pose

    return group;
  }

  getSpawnPosition(playerPos) {
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 35;

      const x =
        THREE.MathUtils.clamp(
          playerPos.x + Math.cos(angle) * distance,
          -this.mapLimit,
          this.mapLimit
        );

      const z =
        THREE.MathUtils.clamp(
          playerPos.z + Math.sin(angle) * distance,
          -this.mapLimit,
          this.mapLimit
        );

      if (
        Math.abs(x - playerPos.x) < 18 &&
        Math.abs(z - playerPos.z) < 18
      ) {
        continue;
      }

      let valid = true;

      for (const d of this.dummies) {
        if (!d.alive) continue;

        if (
          Math.hypot(
            d.group.position.x - x,
            d.group.position.z - z
          ) < 8
        ) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return new THREE.Vector3(x, 0, z);
      }
    }

    return null;
  }

  spawn(playerPos) {
    if (this.dummies.length >= this.maxDummies) {
      return null;
    }

    const position = this.getSpawnPosition(playerPos);

    if (!position) {
      return null;
    }

    const group = this.createDummy();

    group.position.copy(position);

    this.scene.add(group);

    const dummy = {
      group,
      speed:
        this.speedMin +
        Math.random() *
          (this.speedMax - this.speedMin),
      alive: true,
      radius: 0.8
    };

    this.dummies.push(dummy);

    return dummy;
  }

  canMove(dummy, direction, distance) {
    const origin = dummy.group.position.clone();
    origin.y = 1.2;

    const raycaster = new THREE.Raycaster(
      origin,
      direction,
      0,
      distance + 0.8
    );

    const objects = [];

    for (const obj of this.scene.children) {
      if (obj === dummy.group) continue;
      if (obj.userData && obj.userData.isEnemy) continue;

      objects.push(obj);
    }

    const hits = raycaster.intersectObjects(
      objects,
      true
    );

    return hits.length === 0;
  }

  animateWalk(dummy, dt, isMoving) {
    const limbs = dummy.group.userData.limbs;
    if (!limbs) return;

    // Ease the walk blend in/out so starting/stopping isn't a snap
    const targetBlend = isMoving ? 1 : 0;
    dummy.group.userData.walkBlend = THREE.MathUtils.damp(
      dummy.group.userData.walkBlend,
      targetBlend,
      this.poseLerpSpeed,
      dt
    );

    const blend = dummy.group.userData.walkBlend;

    if (isMoving) {
      dummy.group.userData.walkPhase +=
        dt * dummy.speed * this.walkCycleSpeed;
    }

    const phase = dummy.group.userData.walkPhase;
    const swing = Math.sin(phase) * this.walkSwingAmplitude * blend;

    // Legs swing opposite to each other; arms swing opposite to legs
    // (natural counter-swing gait)
    limbs.leftLegPivot.rotation.x = swing;
    limbs.rightLegPivot.rotation.x = -swing;
    limbs.leftArmPivot.rotation.x = -swing;
    limbs.rightArmPivot.rotation.x = swing;

    // Subtle vertical bob synced to the double-step cycle
    limbs.torso.position.y =
      1.55 +
      Math.abs(Math.sin(phase * 2)) * this.walkBobAmplitude * blend;
  }

  update(dt, playerPos) {
    for (const d of this.dummies) {
      if (!d.alive) continue;

      const toPlayer = new THREE.Vector3()
        .subVectors(playerPos, d.group.position);

      toPlayer.y = 0;

      const distance = toPlayer.length();

      let moved = false;

      if (distance < 2.2) {
        this.animateWalk(d, dt, false);
        continue;
      }

      toPlayer.normalize();

      const movement =
        d.speed * dt;

      if (
        this.canMove(
          d,
          toPlayer,
          movement
        )
      ) {
        d.group.position.addScaledVector(
          toPlayer,
          movement
        );
        moved = true;
      } else {
        const side = new THREE.Vector3(
          -toPlayer.z,
          0,
          toPlayer.x
        );

        const sideDirection =
          Math.random() > 0.5
            ? side
            : side.negate();

        if (
          this.canMove(
            d,
            sideDirection,
            movement
          )
        ) {
          d.group.position.addScaledVector(
            sideDirection,
            movement
          );
          moved = true;
        }
      }

      d.group.position.x =
        THREE.MathUtils.clamp(
          d.group.position.x,
          -this.mapLimit,
          this.mapLimit
        );

      d.group.position.z =
        THREE.MathUtils.clamp(
          d.group.position.z,
          -this.mapLimit,
          this.mapLimit
        );

      d.group.lookAt(
        playerPos.x,
        d.group.position.y,
        playerPos.z
      );

      this.animateWalk(d, dt, moved);
    }
  }

  remove(dummy) {
    if (!dummy || !dummy.alive) return;

    dummy.alive = false;

    this.scene.remove(dummy.group);

    const index =
      this.dummies.indexOf(dummy);

    if (index !== -1) {
      this.dummies.splice(index, 1);
    }
  }

  clear() {
    for (const d of this.dummies) {
      this.scene.remove(d.group);
    }

    this.dummies = [];
  }

  getAliveCount() {
    return this.dummies.filter(
      d => d.alive
    ).length;
  }
}
