const c = document.getElementById("canvas");
const vsSource = document.getElementById("vs").textContent;
const fsSource = document.getElementById("fs").textContent;
const renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
const camera = new THREE.PerspectiveCamera(45, c.width / c.height);
camera.position.set(0, 0, 8);
const sceneRT = new THREE.WebGLRenderTarget(c.width, c.height);
const backFaceRT = new THREE.WebGLRenderTarget(c.width, c.height);
const scene = new THREE.Scene();

const controls = new THREE.OrbitControls(camera, c);
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.2;

const texLoader = new THREE.TextureLoader();
const texture = texLoader.load(backGroundTextureData);
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(c.width / c.height, 1);

const uniforms = {
    u_image: { type: "t", value: texture },
    resolution: { type: "v2", value: new THREE.Vector2(c.width, c.height) }
};

const urls = [
    "images/right.png",
    "images/left.png",
    "images/top.png",
    "images/bottom.png",
    "images/front.png",
    "images/back.png"
]
const cubeTextureLoader = new THREE.CubeTextureLoader();
const texCube = cubeTextureLoader.load(urls);

const shader = THREE.ShaderLib['cube'];
shader.uniforms['tCube'].value = texCube;

const cM = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
});

const cubeM = new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), cM);
scene.add(cubeM);

const geometry = new THREE.IcosahedronGeometry(1, 5);
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    side: THREE.FrontSide,
    vertexShader: vsSource,
    fragmentShader: fsSource
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let t = 0;
(function render() {
    mesh.visible = false;
    renderer.setRenderTarget(sceneRT);
    renderer.render(scene, camera);

    mesh.material.uniforms.u_image.value = sceneRT.texture;
    mesh.material.side = THREE.BackSide;
    mesh.visible = true;
    renderer.setRenderTarget(backFaceRT);
    renderer.render(scene, camera);

    mesh.material.uniforms.u_image.value = backFaceRT.texture;
    mesh.material.side = THREE.FrontSide;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    controls.update();
    t++;
    requestAnimationFrame(render);
})()

renderer.setClearColor(0x000000, 1.0);