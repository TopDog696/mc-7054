class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setClearColor(0x87CEEB);
    document.body.appendChild(this.renderer.domElement);

    this.world = new World();
    this.raycaster = new Raycaster(this.world);
    this.player = new Player(this.camera);

    this.init();
  }

  init() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(1, 1, 1);
    this.scene.add(directional);

    this.world.generateTerrain();
    this.scene.add(this.world.group);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('contextmenu', e => e.preventDefault());
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.player.update(this.world, this.raycaster);
    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
