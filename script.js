const c = document.getElementById("canvas");
const vsSource = document.getElementById("vs").textContent;
const fsSource1 = document.getElementById("fs_1").textContent;
const fsSource2 = document.getElementById("fs_2").textContent;
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
controls.minDistance = 4;
controls.maxDistance = 16;

const uniforms = {
    u_image: { type: "t", value: null },
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

const shader = THREE.ShaderLib.cube;
shader.uniforms.tCube.value = texCube;

const cM = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
});

const cubeM = new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), cM);
scene.add(cubeM);

const geometry = new THREE.IcosahedronGeometry(1, 6);
const material_back = new THREE.ShaderMaterial({
    uniforms: uniforms,
    side: THREE.BackSide,
    vertexShader: vsSource,
    fragmentShader: fsSource1
});
const material_front = new THREE.ShaderMaterial({
    uniforms: uniforms,
    side: THREE.FrontSide,
    vertexShader: vsSource,
    fragmentShader: fsSource2
});
const mesh_back = new THREE.Mesh(geometry, material_back);
scene.add(mesh_back);
const mesh_front = new THREE.Mesh(geometry, material_front);
scene.add(mesh_front);

window.addEventListener("resize", function () {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    camera.aspect = windowWidth / windowHeight;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(windowWidth, windowHeight);
    camera.position.set(0, 0, 8);
    camera.updateProjectionMatrix();
    sceneRT.setSize(c.width, c.height);
    backFaceRT.setSize(c.width, c.height);

    mesh_back.material.uniforms.resolution.value.set(c.width, c.height);
    mesh_front.material.uniforms.resolution.value.set(c.width, c.height);
})

(function render() {
    mesh_front.visible = false;
    renderer.setRenderTarget(sceneRT);
    renderer.render(scene, camera);

    mesh_back.material.uniforms.u_image.value = sceneRT.texture;
    mesh_back.visible = true;
    renderer.setRenderTarget(backFaceRT);
    renderer.render(scene, camera);

    mesh_front.material.uniforms.u_image.value = backFaceRT.texture;
    mesh_back.visible = false;
    mesh_front.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    controls.update();
    requestAnimationFrame(render);
})()

renderer.setClearColor(0x000000, 1.0);
