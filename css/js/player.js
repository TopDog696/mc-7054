class Player {
  constructor(camera) {
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.speed = 0.1;
    this.jumpSpeed = 0.3;
    this.gravity = 0.02;
    this.onGround = false;
    this.selectedBlockType = 'grass';

    this.camera.position.set(0, 10, 0);
    this.keys = {};
    this.setupControls();
  }

  setupControls() {
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      const types = ['grass', 'dirt', 'stone', 'wood'];
      const idx = parseInt(e.code.slice(-1)) - 1;
      if (types[idx]) {
        this.selectedBlockType = types[idx];
        this.updateBlockSelector();
      }
    });
    document.addEventListener('keyup', e => this.keys[e.code] = false);
    document.addEventListener('click', () => document.body.requestPointerLock());
    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement === document.body) {
        this.camera.rotation.y -= e.movementX * 0.002;
        this.camera.rotation.x -= e.movementY * 0.002;
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
      }
    });
    document.querySelectorAll('.block-option').forEach((el, i) => {
      el.addEventListener('click', () => {
        const types = ['grass', 'dirt', 'stone', 'wood'];
        this.selectedBlockType = types[i];
        this.updateBlockSelector();
      });
    });
    this.updateBlockSelector();
  }

  updateBlockSelector() {
    document.querySelectorAll('.block-option').forEach((el, i) => {
      const types = ['grass', 'dirt', 'stone', 'wood'];
      el.classList.toggle('selected', types[i] === this.selectedBlockType);
    });
  }

  update(world, raycaster) {
    const dir = new THREE.Vector3();
    const front = new THREE.Vector3(); front.setFromMatrixColumn(this.camera.matrix, 0).cross(this.camera.up);
    const side  = new THREE.Vector3(); side.setFromMatrixColumn(this.camera.matrix, 0);

    dir.z = (this.keys['KeyW'] ? 1 : 0) - (this.keys['KeyS'] ? 1 : 0);
    dir.x = (this.keys['KeyD'] ? 1 : 0) - (this.keys['KeyA'] ? 1 : 0);
    dir.normalize();

    const moveX = dir.z * front.x + dir.x * side.x;
    const moveZ = dir.z * front.z + dir.x * side.z;
    this.camera.position.x += moveX * this.speed;
    this.camera.position.z += moveZ * this.speed;

    this.velocity.y -= this.gravity;
    if (this.keys['Space'] && this.onGround) {
      this.velocity.y = this.jumpSpeed;
      this.onGround = false;
    }
    this.camera.position.y += this.velocity.y;

    if (this.camera.position.y < 1.6) {
      this.camera.position.y = 1.6;
      this.velocity.y = 0;
      this.onGround = true;
    }

    if (document.pointerLockElement === document.body) {
      document.addEventListener('mousedown', e => {
        const ray = raycaster.castRay(
          this.camera.position,
          new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion)
        );
        if (!ray) return;
        if (e.button === 0) {
          world.removeBlock(ray.block.userData.x, ray.block.userData.y, ray.block.userData.z);
        } else if (e.button === 2) {
          world.addBlock(ray.adjacent.x, ray.adjacent.y, ray.adjacent.z, this.selectedBlockType);
        }
      }, { once: true });
    }
  }
}
