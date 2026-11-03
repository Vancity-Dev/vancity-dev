<script lang="ts">
  import { onMount } from 'svelte';

  // Pinned to exact versions, each with an SRI hash
  const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  const THREE_SRI =
    'sha512-dLxUelApnYxpLt6K2iomGngnHO83iUvZytA3YjDUCjT0HDOHKXnVYdf3hU4JjM8uEhxf9nD1/ey98U3t2vZ0qQ==';
  const ORBIT_SRC = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
  const ORBIT_SRI = 'sha384-wagZhIFgY4hD+7awjQjR4e2E294y6J2HSnd8eTNc15ZubTeQeVRZwhQJ+W6hnBsf';

  let container: HTMLDivElement;

  function loadScript(src: string, integrity: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.integrity = integrity;
      s.crossOrigin = 'anonymous';
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function loadThree(): Promise<any> {
    const w = window as any;
    if (!w.THREE) await loadScript(THREE_SRC, THREE_SRI);
    // OrbitControls attaches itself to THREE, so it must load after it
    if (!w.THREE.OrbitControls) await loadScript(ORBIT_SRC, ORBIT_SRI);
    return w.THREE;
  }

  onMount(() => {
    let dispose = () => {};
    let cancelled = false;

    loadThree().then((THREE) => {
      if (!cancelled) dispose = start(THREE);
    });

    return () => {
      cancelled = true;
      dispose();
    };
  });

  function start(THREE: any): () => void {
    // Exact metrics (1 unit = 1 meter)
    const roomWidth = 1.5494; // 5'1"
    const roomLength = 2.6416; // 8'8"
    const roomHeight = 2.7432; // 9'0"
    const showerDepth = 0.9144; // 36"
    const tileHeight = 1.524; // 5'0" (dry area tile height)
    const wallThickness = 0.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);

    // Orthographic camera for the isometric view
    const frustumSize = 3.5;
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect, frustumSize * aspect, frustumSize, -frustumSize, 0.1, 1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // don't go below ground

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(5, 8, 3);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -3;
    dirLight.shadow.camera.right = 3;
    dirLight.shadow.camera.top = 3;
    dirLight.shadow.camera.bottom = -3;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.5);
    fillLight.position.set(-5, 4, -5);
    scene.add(fillLight);

    // Procedural textures
    function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D) => void, mip = true) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      draw(canvas.getContext('2d')!);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      if (mip) tex.minFilter = THREE.LinearMipMapLinearFilter;
      return tex;
    }

    function createWhiteOakTexture() {
      const tex = canvasTexture(1024, (ctx) => {
        ctx.fillStyle = '#d7c7aa';
        ctx.fillRect(0, 0, 1024, 1024);
        const numPlanks = 10;
        const plankWidth = 1024 / numPlanks;
        for (let i = 0; i < numPlanks; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#e0d1b5' : '#caba9d';
          ctx.fillRect(i * plankWidth, 0, plankWidth - 2, 1024);
          ctx.fillStyle = 'rgba(100, 80, 50, 0.08)';
          for (let g = 0; g < 30; g++) {
            ctx.fillRect(i * plankWidth + Math.random() * (plankWidth - 2), 0, 1 + Math.random() * 2, 1024);
          }
          ctx.fillStyle = '#b3a07a';
          ctx.fillRect((i + 1) * plankWidth - 2, 0, 2, 1024);
        }
      });
      tex.repeat.set(roomWidth, roomLength / 2);
      return tex;
    }

    function createEmeraldTileTexture() {
      const tex = canvasTexture(1024, (ctx) => {
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(0, 0, 1024, 1024);
        const numTiles = 24;
        const tileSize = 1024 / numTiles;
        const gap = 4;
        for (let i = 0; i < numTiles; i++) {
          for (let j = 0; j < numTiles; j++) {
            const greenBase = 140 + Math.random() * 20;
            const blueBase = 130 + Math.random() * 20;
            ctx.fillStyle = `rgb(90, ${greenBase}, ${blueBase})`;
            ctx.fillRect(i * tileSize + gap / 2, j * tileSize + gap / 2, tileSize - gap, tileSize - gap);
          }
        }
      });
      tex.repeat.set(roomWidth * 2, showerDepth * 2);
      return tex;
    }

    function createWhiteTileTexture() {
      return canvasTexture(512, (ctx) => {
        const gap = 6;
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#fdfdfd';
        ctx.fillRect(gap / 2, gap / 2, 512 - gap, 512 - gap);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gap / 2, gap / 2, 512 - gap, 8);
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(gap / 2, 512 - gap / 2 - 8, 512 - gap, 8);
      });
    }

    function createCedarTexture() {
      return canvasTexture(256, (ctx) => {
        ctx.fillStyle = '#a66a3d';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(70, 40, 20, 0.1)';
        for (let g = 0; g < 10; g++) ctx.fillRect(0, Math.random() * 256, 256, 2);
      }, false);
    }

    // Tiles stay an exact 24" (0.6096m) whatever the wall size
    function getTileMaterial(width: number, height: number) {
      const tex = createWhiteTileTexture();
      const tileSize = 0.6096;
      tex.repeat.set(width / tileSize, height / tileSize);
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2, metalness: 0.1 });
    }

    const matPaint = new THREE.MeshStandardMaterial({ color: 0xfffcf9, roughness: 0.95 });
    const matFloor = new THREE.MeshStandardMaterial({ map: createWhiteOakTexture(), roughness: 0.3, metalness: 0.05 });
    const matShowerFloor = new THREE.MeshStandardMaterial({ map: createEmeraldTileTexture(), roughness: 0.4 });
    const matCeramic = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.1 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa, transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.5, side: THREE.DoubleSide
    });
    const matCedar = new THREE.MeshStandardMaterial({ map: createCedarTexture(), roughness: 0.8 });
    const matCutaway = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 1.0 }); // cut architectural walls

    // Shell
    const modelGroup = new THREE.Group();
    modelGroup.position.set(0, -roomHeight / 4, 0); // pivot around the origin
    scene.add(modelGroup);

    function mesh(group: any, geo: any, mat: any, x: number, y: number, z: number, cast = true, receive = true) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = receive;
      group.add(m);
      return m;
    }

    mesh(modelGroup, new THREE.BoxGeometry(roomWidth + wallThickness * 2, 0.2, roomLength + wallThickness * 2),
      matCutaway, 0, -0.1, 0, false);

    const dryLength = roomLength - showerDepth;

    const dryFloor = mesh(modelGroup, new THREE.PlaneGeometry(roomWidth, dryLength), matFloor,
      0, 0.001, roomLength / 2 - dryLength / 2, false);
    dryFloor.rotation.x = -Math.PI / 2;

    const showerPan = mesh(modelGroup, new THREE.PlaneGeometry(roomWidth, showerDepth), matShowerFloor,
      0, 0.01, -roomLength / 2 + showerDepth / 2, false);
    showerPan.rotation.x = -Math.PI / 2;

    // Solid walls (with thickness): back and right full height, front and left cut low
    mesh(modelGroup, new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness), matCutaway,
      0, roomHeight / 2, -roomLength / 2 - wallThickness / 2);
    mesh(modelGroup, new THREE.BoxGeometry(wallThickness, roomHeight, roomLength + wallThickness * 2), matCutaway,
      roomWidth / 2 + wallThickness / 2, roomHeight / 2, 0);

    const cutHeight = 0.2;
    mesh(modelGroup, new THREE.BoxGeometry(roomWidth, cutHeight, wallThickness), matCutaway,
      0, cutHeight / 2, roomLength / 2 + wallThickness / 2);
    mesh(modelGroup, new THREE.BoxGeometry(wallThickness, cutHeight, roomLength + wallThickness * 2), matCutaway,
      -roomWidth / 2 - wallThickness / 2, cutHeight / 2, 0);

    // Interior finishes (planes against the inside faces)
    mesh(modelGroup, new THREE.PlaneGeometry(roomWidth, roomHeight), getTileMaterial(roomWidth, roomHeight),
      0, roomHeight / 2, -roomLength / 2 + 0.001, false);

    const paintHeight = roomHeight - tileHeight;
    const rightShower = mesh(modelGroup, new THREE.PlaneGeometry(showerDepth, roomHeight),
      getTileMaterial(showerDepth, roomHeight), roomWidth / 2 - 0.001, roomHeight / 2, -roomLength / 2 + showerDepth / 2, false);
    rightShower.rotation.y = -Math.PI / 2;

    const rightDryTile = mesh(modelGroup, new THREE.PlaneGeometry(dryLength, tileHeight),
      getTileMaterial(dryLength, tileHeight), roomWidth / 2 - 0.001, tileHeight / 2, roomLength / 2 - dryLength / 2, false);
    rightDryTile.rotation.y = -Math.PI / 2;

    const rightDryPaint = mesh(modelGroup, new THREE.PlaneGeometry(dryLength, paintHeight), matPaint,
      roomWidth / 2 - 0.001, tileHeight + paintHeight / 2, roomLength / 2 - dryLength / 2, false);
    rightDryPaint.rotation.y = -Math.PI / 2;

    // Shower glass and head
    const glassWidth = 1.0;
    mesh(modelGroup, new THREE.BoxGeometry(glassWidth, 2.0, 0.01), matGlass,
      roomWidth / 2 - glassWidth / 2, 1.0, -roomLength / 2 + showerDepth, true, false);

    const showerHead = mesh(modelGroup, new THREE.CylinderGeometry(0.04, 0.04, 0.15), matMetal,
      0, 2.1, -roomLength / 2 + 0.05, true, false);
    showerHead.rotation.x = Math.PI / 4;

    // Vanity (right wall, near front)
    const vanityDepth = 0.55;
    const vanityWidth = 0.78;
    const sinkZ = roomLength / 2 - 0.5;
    const sinkX = roomWidth / 2 - vanityDepth / 2;

    const vanityGroup = new THREE.Group();
    modelGroup.add(vanityGroup);

    mesh(vanityGroup, new THREE.BoxGeometry(vanityDepth, 0.45, vanityWidth), matCedar, sinkX, 0.55, sinkZ);

    const counterHeight = 0.03;
    const counterY = 0.55 + 0.45 / 2 + counterHeight / 2;
    const matMarble = new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.1, metalness: 0.1 });
    mesh(vanityGroup, new THREE.BoxGeometry(vanityDepth + 0.02, counterHeight, vanityWidth + 0.02), matMarble,
      sinkX - 0.01, counterY, sinkZ);

    // Inset sink, simulated as a darker slab for the isometric view
    mesh(vanityGroup, new THREE.BoxGeometry(0.3, 0.02, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.2 }),
      sinkX - 0.05, counterY + 0.005, sinkZ, false, false);

    mesh(vanityGroup, new THREE.CylinderGeometry(0.015, 0.015, 0.1), matMetal,
      sinkX + 0.15, counterY + 0.05, sinkZ, true, false);

    mesh(modelGroup, new THREE.BoxGeometry(0.02, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x99ccff, roughness: 0.1, metalness: 0.9 }),
      roomWidth / 2 - 0.01, 1.4, sinkZ, true, false);

    // Toilet (equidistant between shower glass and vanity)
    const showerGlassZ = -roomLength / 2 + showerDepth;
    const vanityEdgeZ = sinkZ - vanityWidth / 2;
    const toiletZ = (showerGlassZ + vanityEdgeZ) / 2;

    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(roomWidth / 2 - 0.3, 0, toiletZ);
    toiletGroup.rotation.y = -Math.PI / 2;
    modelGroup.add(toiletGroup);

    const bowlGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.4, 32);
    bowlGeo.translate(0, 0.2, 0.05);
    mesh(toiletGroup, bowlGeo, matCeramic, 0, 0, 0);

    const seat = mesh(toiletGroup, new THREE.CylinderGeometry(0.18, 0.18, 0.03, 32), matCeramic, 0, 0.42, 0.05, true, false);
    seat.scale.set(1, 1, 1.15);

    mesh(toiletGroup, new THREE.BoxGeometry(0.4, 0.38, 0.2), matCeramic, -0.05, 0.61, -0.15);

    const onResize = () => {
      const a = window.innerWidth / window.innerHeight;
      camera.left = -frustumSize * a;
      camera.right = frustumSize * a;
      camera.top = frustumSize;
      camera.bottom = -frustumSize;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      controls.update(); // required with damping
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }
</script>

<svelte:head>
  <title>3D Isometric Bathroom Floorplan</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bp-root">
  <div class="bp-canvas" bind:this={container}></div>

  <div class="bp-ui">
    <div class="bp-card">
      <h1>Isometric Floorplan</h1>
      <p>
        Interactive architectural rendering.<br />
        <strong>Dimensions:</strong> 8'8" x 5'1" x 9'
      </p>
      <div class="bp-controls">
        <strong>Controls:</strong><br />
        • <strong>Left Click + Drag:</strong> Rotate Model<br />
        • <strong>Scroll Wheel:</strong> Zoom In/Out<br />
        • <strong>Right Click + Drag:</strong> Pan Model
      </div>
    </div>
  </div>
</div>

<style>
  .bp-root {
    position: fixed;
    inset: 0;
    background: #f0f0f0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    cursor: auto;
  }
  .bp-canvas {
    width: 100vw;
    height: 100vh;
  }
  .bp-ui {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    z-index: 10;
    pointer-events: none;
  }
  .bp-card {
    max-width: 24rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    pointer-events: auto;
  }
  h1 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }
  p {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #4b5563;
  }
  .bp-controls {
    padding: 0.75rem;
    font-size: 0.75rem;
    line-height: 1.5;
    color: #6b7280;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }
</style>
