<script lang="ts">
  import { onMount } from 'svelte';

  const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

  let container: HTMLDivElement;
  let locked = $state(false);
  let ready = $state(false);

  function loadThree(): Promise<any> {
    const w = window as any;
    if (w.THREE) return Promise.resolve(w.THREE);
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = THREE_SRC;
      s.onload = () => resolve(w.THREE);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function enter() {
    document.body.requestPointerLock();
  }

  onMount(() => {
    let dispose = () => {};
    let cancelled = false;

    loadThree().then((THREE) => {
      if (cancelled) return;
      ready = true;
      dispose = start(THREE);
    });

    return () => {
      cancelled = true;
      dispose();
    };
  });

  function start(THREE: any): () => void {
    // Scale: 1 unit = 1 meter
    const roomWidth = 1.55; // ~ 5'1"
    const roomLength = 2.64; // ~ 8'8"
    const roomHeight = 2.74; // ~ 9'0"
    const showerDepth = 0.91; // ~ 36"

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 0, 10);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Controls (first person WASD + mouse)
    const pitchObject = new THREE.Object3D();
    pitchObject.add(camera);
    const yawObject = new THREE.Object3D();
    yawObject.position.set(0, 1.6, 1.0);
    yawObject.add(pitchObject);
    scene.add(yawObject);

    let isLocked = false;
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const onLockChange = () => {
      isLocked = document.pointerLockElement === document.body;
      locked = isLocked;
      if (!isLocked) moveForward = moveBackward = moveLeft = moveRight = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked) return;
      yawObject.rotation.y -= e.movementX * 0.002;
      pitchObject.rotation.x -= e.movementY * 0.002;
      pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchObject.rotation.x));
    };
    const setKey = (code: string, down: boolean) => {
      switch (code) {
        case 'ArrowUp':
        case 'KeyW': moveForward = down; break;
        case 'ArrowLeft':
        case 'KeyA': moveLeft = down; break;
        case 'ArrowDown':
        case 'KeyS': moveBackward = down; break;
        case 'ArrowRight':
        case 'KeyD': moveRight = down; break;
      }
    };
    const onKeyDown = (e: KeyboardEvent) => setKey(e.code, true);
    const onKeyUp = (e: KeyboardEvent) => setKey(e.code, false);
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const ceilingLight = new THREE.PointLight(0xffe8cc, 0.8, 10);
    ceilingLight.position.set(0, roomHeight - 0.2, 0);
    ceilingLight.castShadow = true;
    ceilingLight.shadow.bias = -0.001;
    scene.add(ceilingLight);

    const showerLight = new THREE.PointLight(0xe5f2ff, 0.5, 5);
    showerLight.position.set(0, roomHeight - 0.2, -roomLength / 2 + showerDepth / 2);
    scene.add(showerLight);

    const vanityLight = new THREE.PointLight(0xfffae6, 0.4, 3);
    vanityLight.position.set(roomWidth / 2 - 0.3, 2.0, 0.6);
    scene.add(vanityLight);

    // Procedural textures
    function canvasTexture(draw: (ctx: CanvasRenderingContext2D) => void) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      draw(canvas.getContext('2d')!);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    }

    function createCedarTexture() {
      const tex = canvasTexture((ctx) => {
        ctx.fillStyle = '#9e6439';
        ctx.fillRect(0, 0, 512, 512);
        const numPlanks = 16;
        const plankHeight = 512 / numPlanks;
        for (let i = 0; i < numPlanks; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#a66a3d' : '#8e5932';
          ctx.fillRect(0, i * plankHeight, 512, plankHeight - 2);
          ctx.fillStyle = 'rgba(70, 40, 20, 0.1)';
          for (let g = 0; g < 5; g++) {
            ctx.fillRect(0, i * plankHeight + Math.random() * (plankHeight - 2), 512, 1);
          }
          ctx.fillStyle = '#3a200a';
          ctx.fillRect(0, i * plankHeight + plankHeight - 2, 512, 2);
        }
      });
      tex.repeat.set(roomWidth * 1.5, roomLength * 1.5);
      return tex;
    }

    function createWhiteOakTexture() {
      const tex = canvasTexture((ctx) => {
        ctx.fillStyle = '#d7c7aa';
        ctx.fillRect(0, 0, 512, 512);
        const numPlanks = 6;
        const plankWidth = 512 / numPlanks;
        for (let i = 0; i < numPlanks; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#e0d1b5' : '#caba9d';
          ctx.fillRect(i * plankWidth, 0, plankWidth - 2, 512);
          ctx.fillStyle = 'rgba(100, 80, 50, 0.08)';
          for (let g = 0; g < 15; g++) {
            ctx.fillRect(i * plankWidth + Math.random() * (plankWidth - 2), 0, 1 + Math.random() * 2, 512);
          }
          ctx.fillStyle = '#b3a07a';
          ctx.fillRect((i + 1) * plankWidth - 2, 0, 2, 512);
        }
      });
      tex.repeat.set(roomWidth, roomLength / 2);
      return tex;
    }

    function createEmeraldTileTexture() {
      const tex = canvasTexture((ctx) => {
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(0, 0, 512, 512);
        const numTiles = 12;
        const tileSize = 512 / numTiles;
        const gap = 4;
        for (let i = 0; i < numTiles; i++) {
          for (let j = 0; j < numTiles; j++) {
            const greenBase = 120 + Math.random() * 20;
            const blueBase = 110 + Math.random() * 20;
            ctx.fillStyle = `rgb(90, ${greenBase}, ${blueBase})`;
            ctx.fillRect(i * tileSize + gap / 2, j * tileSize + gap / 2, tileSize - gap, tileSize - gap);
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(i * tileSize + gap / 2, j * tileSize + gap / 2, (tileSize - gap) / 2, tileSize - gap);
          }
        }
      });
      tex.repeat.set(roomWidth * 3, showerDepth * 3);
      return tex;
    }

    function createWhiteTileTexture() {
      return canvasTexture((ctx) => {
        const gap = 8;
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#fdfdfd';
        ctx.fillRect(gap / 2, gap / 2, 512 - gap, 512 - gap);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gap / 2, gap / 2, 512 - gap, 10);
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(gap / 2, 512 - gap / 2 - 10, 512 - gap, 10);
      });
    }

    // Tiles stay 24"x24" (~0.61m) whatever the wall size
    function getTileMaterial(width: number, height: number) {
      const tex = createWhiteTileTexture();
      const tileSize = 0.61;
      tex.repeat.set(width / tileSize, height / tileSize);
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.15, metalness: 0.1 });
    }

    const matPaint = new THREE.MeshStandardMaterial({ color: 0xfffcf9, roughness: 0.95 });
    const matFloor = new THREE.MeshStandardMaterial({ map: createWhiteOakTexture(), roughness: 0.3, metalness: 0.05 });
    const matCeiling = new THREE.MeshStandardMaterial({ map: createCedarTexture(), roughness: 0.9 });
    const matCeramic = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.2 });
    const matShowerFloor = new THREE.MeshStandardMaterial({ map: createEmeraldTileTexture(), roughness: 0.4 });
    const matMetal = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa, transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.5, side: THREE.DoubleSide
    });

    // Room
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomLength), matFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomLength), matCeiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    roomGroup.add(ceiling);

    const tileHeight = 1.52; // ~5 feet
    const paintHeight = roomHeight - tileHeight;
    const dryLength = roomLength - showerDepth;

    function wall(w: number, h: number, mat: any, x: number, y: number, z: number, rotY: number) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z);
      m.rotation.y = rotY;
      m.receiveShadow = true;
      roomGroup.add(m);
    }

    // Back wall (shower): full-height tile
    wall(roomWidth, roomHeight, getTileMaterial(roomWidth, roomHeight), 0, roomHeight / 2, -roomLength / 2, 0);
    // Front wall (door): tile + paint
    wall(roomWidth, tileHeight, getTileMaterial(roomWidth, tileHeight), 0, tileHeight / 2, roomLength / 2, Math.PI);
    wall(roomWidth, paintHeight, matPaint, 0, tileHeight + paintHeight / 2, roomLength / 2, Math.PI);
    // Left wall
    wall(showerDepth, roomHeight, getTileMaterial(showerDepth, roomHeight), -roomWidth / 2, roomHeight / 2, -roomLength / 2 + showerDepth / 2, Math.PI / 2);
    wall(dryLength, tileHeight, getTileMaterial(dryLength, tileHeight), -roomWidth / 2, tileHeight / 2, roomLength / 2 - dryLength / 2, Math.PI / 2);
    wall(dryLength, paintHeight, matPaint, -roomWidth / 2, tileHeight + paintHeight / 2, roomLength / 2 - dryLength / 2, Math.PI / 2);
    // Right wall
    wall(showerDepth, roomHeight, getTileMaterial(showerDepth, roomHeight), roomWidth / 2, roomHeight / 2, -roomLength / 2 + showerDepth / 2, -Math.PI / 2);
    wall(dryLength, tileHeight, getTileMaterial(dryLength, tileHeight), roomWidth / 2, tileHeight / 2, roomLength / 2 - dryLength / 2, -Math.PI / 2);
    wall(dryLength, paintHeight, matPaint, roomWidth / 2, tileHeight + paintHeight / 2, roomLength / 2 - dryLength / 2, -Math.PI / 2);

    // Door (closed)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 2.1, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 })
    );
    door.position.set(0, 2.1 / 2, roomLength / 2 - 0.025);
    door.castShadow = true;
    door.receiveShadow = true;
    roomGroup.add(door);

    // Shower
    const showerPan = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, 0.1, showerDepth), matShowerFloor);
    showerPan.position.set(0, 0.05, -roomLength / 2 + showerDepth / 2);
    showerPan.receiveShadow = true;
    showerPan.castShadow = true;
    roomGroup.add(showerPan);

    const glassWidth = 1.0;
    const showerGlass = new THREE.Mesh(new THREE.PlaneGeometry(glassWidth, 2.0), matGlass);
    showerGlass.position.set(roomWidth / 2 - glassWidth / 2, 1.0, -roomLength / 2 + showerDepth);
    roomGroup.add(showerGlass);

    const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1), matMetal);
    showerHead.position.set(0, 2.2, -roomLength / 2 + 0.1);
    showerHead.rotation.x = Math.PI / 4;
    showerHead.castShadow = true;
    roomGroup.add(showerHead);

    // Toilet
    const toiletGroup = new THREE.Group();
    toiletGroup.position.set(roomWidth / 2 - 0.25, 0, 0.0);
    toiletGroup.rotation.y = -Math.PI / 2;
    roomGroup.add(toiletGroup);

    function part(group: any, geo: any, mat: any, x: number, y: number, z: number, shadow = true) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = shadow;
      m.receiveShadow = shadow;
      group.add(m);
      return m;
    }

    const bowlGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.4, 32);
    bowlGeo.translate(0, 0.2, 0.05);
    part(toiletGroup, bowlGeo, matCeramic, 0, 0, 0);

    const seat = part(toiletGroup, new THREE.TorusGeometry(0.15, 0.035, 16, 32), matCeramic, 0, 0.41, 0.05);
    seat.rotation.x = Math.PI / 2;
    seat.scale.set(1, 1.2, 1);

    const lid = part(toiletGroup, new THREE.CylinderGeometry(0.15, 0.15, 0.015, 32), matCeramic, 0, 0.44, 0.05);
    lid.scale.set(1, 1, 1.2);

    part(toiletGroup, new THREE.BoxGeometry(0.4, 0.35, 0.2), matCeramic, -0.05, 0.6, -0.15);
    part(toiletGroup, new THREE.BoxGeometry(0.42, 0.04, 0.22), matCeramic, -0.05, 0.79, -0.15);

    const lever = part(toiletGroup, new THREE.CylinderGeometry(0.01, 0.01, 0.08), matMetal, 0.17, 0.65, -0.04);
    lever.rotation.z = Math.PI / 2;

    // Vanity
    const sinkZ = 0.8;
    const sinkX = roomWidth / 2 - 0.25;
    const vanityGroup = new THREE.Group();
    roomGroup.add(vanityGroup);

    part(vanityGroup, new THREE.BoxGeometry(0.48, 0.4, 0.78), matCeiling, sinkX + 0.01, 0.55, sinkZ);
    const drawerGapMat = new THREE.MeshStandardMaterial({ color: 0x3a200a, roughness: 1.0 });
    part(vanityGroup, new THREE.BoxGeometry(0.02, 0.02, 0.78), drawerGapMat, sinkX - 0.23, 0.55, sinkZ, false);

    const counterY = 0.765;
    const matMarble = new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.1, metalness: 0.1 });
    part(vanityGroup, new THREE.BoxGeometry(0.5, 0.03, 0.2), matMarble, sinkX, counterY, sinkZ + 0.3);
    part(vanityGroup, new THREE.BoxGeometry(0.5, 0.03, 0.2), matMarble, sinkX, counterY, sinkZ - 0.3);
    part(vanityGroup, new THREE.BoxGeometry(0.1, 0.03, 0.4), matMarble, sinkX - 0.2, counterY, sinkZ);
    part(vanityGroup, new THREE.BoxGeometry(0.1, 0.03, 0.4), matMarble, sinkX + 0.2, counterY, sinkZ);

    // Inset basin (five thin boxes)
    part(vanityGroup, new THREE.BoxGeometry(0.3, 0.02, 0.4), matCeramic, sinkX, counterY - 0.1, sinkZ);
    part(vanityGroup, new THREE.BoxGeometry(0.3, 0.1, 0.02), matCeramic, sinkX, counterY - 0.04, sinkZ + 0.19, false);
    part(vanityGroup, new THREE.BoxGeometry(0.3, 0.1, 0.02), matCeramic, sinkX, counterY - 0.04, sinkZ - 0.19, false);
    part(vanityGroup, new THREE.BoxGeometry(0.02, 0.1, 0.4), matCeramic, sinkX - 0.14, counterY - 0.04, sinkZ, false);
    part(vanityGroup, new THREE.BoxGeometry(0.02, 0.1, 0.4), matCeramic, sinkX + 0.14, counterY - 0.04, sinkZ, false);

    const faucet = part(roomGroup, new THREE.CylinderGeometry(0.02, 0.02, 0.12), matMetal, roomWidth / 2 - 0.05, 0.84, sinkZ, false);
    faucet.castShadow = true;
    faucet.rotation.z = Math.PI / 4;

    const mirror = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x99ccff, roughness: 0.1, metalness: 0.9 })
    );
    mirror.position.set(roomWidth / 2 - 0.01, 1.45, sinkZ);
    mirror.rotation.y = -Math.PI / 2;
    roomGroup.add(mirror);

    function checkCollision() {
      const pos = yawObject.position;
      const margin = 0.2;
      const halfWidth = roomWidth / 2;
      const halfLength = roomLength / 2;

      pos.x = Math.max(-halfWidth + margin, Math.min(halfWidth - margin, pos.x));
      pos.z = Math.max(-halfLength + margin, Math.min(halfLength - margin, pos.z));

      // Shower glass sits at z = -halfLength + showerDepth, 1m wide on the right
      const glassZ = -halfLength + showerDepth;
      const glassLeftEdge = roomWidth / 2 - 1.0;
      if (pos.x > glassLeftEdge - margin && pos.z > glassZ - margin && pos.z < glassZ + margin) {
        pos.z = pos.z > glassZ ? glassZ + margin : glassZ - margin;
      }

      // Sink and toilet stand off the right wall
      if (pos.x > halfWidth - margin - 0.3) {
        if (pos.z > 0.5 && pos.z < 1.0) pos.x = halfWidth - margin - 0.3;
        if (pos.z > -0.3 && pos.z < 0.3) pos.x = halfWidth - margin - 0.3;
      }
    }

    let prevTime = performance.now();
    let frame = 0;
    function animate() {
      frame = requestAnimationFrame(animate);
      const time = performance.now();
      const delta = (time - prevTime) / 1000;
      prevTime = time;

      if (isLocked) {
        const speed = 2.5;
        const dir = new THREE.Vector3();
        if (moveForward) dir.z -= 1;
        if (moveBackward) dir.z += 1;
        if (moveLeft) dir.x -= 1;
        if (moveRight) dir.x += 1;
        dir.normalize();
        if (dir.lengthSq() > 0) {
          yawObject.translateX(dir.x * speed * delta);
          yawObject.translateZ(dir.z * speed * delta);
        }
        checkCollision();
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      if (document.pointerLockElement === document.body) document.exitPointerLock();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }
</script>

<svelte:head>
  <title>3D Bathroom Walkthrough</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="bw-root">
  <div class="bw-canvas" bind:this={container}></div>

  {#if !locked}
    <div class="bw-blocker">
      <div class="bw-card">
        <h1>Bathroom Concept</h1>
        <p>
          Explore the space in 3D.<br />
          <strong>Dimensions:</strong> 8'8" x 5'1" x 9' (H)<br />
          <strong>Features:</strong> Cedar Ceiling, Pedestal Sink, Linear Layout, 36"x60" Shower.
        </p>
        <div class="bw-keys">
          <div><span>Move</span>W, A, S, D or Arrows</div>
          <div><span>Look</span>Mouse Movement</div>
        </div>
        <button onclick={enter} disabled={!ready}>{ready ? 'Click to Enter' : 'Loading…'}</button>
      </div>
    </div>
  {:else}
    <div class="bw-crosshair"></div>
  {/if}
</div>

<style>
  .bw-root {
    position: fixed;
    inset: 0;
    background: #000;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    cursor: auto;
  }
  .bw-canvas {
    width: 100vw;
    height: 100vh;
  }
  .bw-blocker {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    color: #fff;
  }
  .bw-card {
    max-width: 28rem;
    padding: 2rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
  }
  h1 {
    margin: 0 0 1rem;
    font-size: 1.875rem;
    font-weight: 700;
  }
  p {
    margin: 0 0 1.5rem;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #e5e7eb;
  }
  .bw-keys {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #d1d5db;
  }
  .bw-keys div {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
  }
  .bw-keys span {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 700;
    color: #fff;
  }
  button {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 9999px;
    background: #2563eb;
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
    transition: background 0.15s;
  }
  button:hover:not(:disabled) {
    background: #3b82f6;
  }
  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .bw-crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 5;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
</style>
