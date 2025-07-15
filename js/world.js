class World {
  constructor() {
    this.chunkSize = 16;
    this.worldSize = 4;
    this.blocks = {};
    this.blockTypes = {
      grass: { color: 0x4a7c59, name: 'Grass' },
      dirt:  { color: 0x8b4513, name: 'Dirt'  },
      stone: { color: 0x696969, name: 'Stone' },
      wood:  { color: 0x8b4513, name: 'Wood'  }
    };

    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.materials = {};
    Object.keys(this.blockTypes).forEach(type => {
      this.materials[type] = new THREE.MeshLambertMaterial({ color: this.blockTypes[type].color });
    });

    this.group = new THREE.Group();
  }

  generateTerrain() {
    const noise = (x, z) => Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3 +
                           Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5;

    for (let x = -this.worldSize * this.chunkSize / 2;
         x < this.worldSize * this.chunkSize / 2; x++) {
      for (let z = -this.worldSize * this.chunkSize / 2;
           z < this.worldSize * this.chunkSize / 2; z++) {
        const h = Math.floor(noise(x, z));
        for (let y = -5; y <= h; y++) {
          const type = y === h ? 'grass' : y >= h - 3 ? 'dirt' : 'stone';
          this.addBlock(x, y, z, type);
        }
      }
    }

    // Add a few trees
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * 40) - 20;
      const z = Math.floor(Math.random() * 40) - 20;
      const h = Math.floor(noise(x, z));
      this.generateTree(x, h + 1, z);
    }
  }

  generateTree(x, y, z) {
    for (let i = 0; i < 5; i++) this.addBlock(x, y + i, z, 'wood');
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = 2; dy <= 4; dy++)
        for (let dz = -2; dz <= 2; dz++)
          if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy - 3) <= 3)
            this.addBlock(x + dx, y + dy, z + dz, 'grass');
  }

  addBlock(x, y, z, type) {
    const key = `${x},${y},${z}`;
    if (this.blocks[key]) return;
    const mesh = new THREE.Mesh(this.geometry, this.materials[type]);
    mesh.position.set(x, y, z);
    mesh.userData = { type, x, y, z };
    this.blocks[key] = mesh;
    this.group.add(mesh);
  }

  removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    const block = this.blocks[key];
    if (block) {
      this.group.remove(block);
      delete this.blocks[key];
    }
  }

  getBlock(x, y, z) {
    return this.blocks[`${x},${y},${z}`];
  }
}

class Raycaster {
  constructor(world) {
    this.world = world;
    this.raycaster = new THREE.Raycaster();
  }

  castRay(origin, direction) {
    this.raycaster.set(origin, direction);
    const meshes = Object.values(this.world.blocks);
    const intersects = this.raycaster.intersectObjects(meshes);
    if (intersects.length === 0) return null;

    const { object: block, face, point } = intersects[0];
    const adjacent = {
      x: block.userData.x + Math.round(face.normal.x),
      y: block.userData.y + Math.round(face.normal.y),
      z: block.userData.z + Math.round(face.normal.z)
    };
    return { block, adjacent, distance: intersects[0].distance };
  }
}
