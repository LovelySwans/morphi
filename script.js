const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
    window.innerWidth / -2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    window.innerHeight / -2,
    1,
    1000
);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#meshingCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const textureLoader = new THREE.TextureLoader();
const images = ['./images/1.jpeg', './images/2.jpeg', './images/3.jpeg', './images/4.jpeg', './images/5.jpeg', './images/6.jpeg'];

let textures = [];
let texturesLoaded = false;

Promise.all(images.map(image => {
    return new Promise((resolve, reject) => {
        textureLoader.load(image, resolve, undefined, reject);
    });
})).then(loadedTextures => {
    textures = loadedTextures;
    texturesLoaded = true;
    console.log("All textures loaded");
    animate();
}).catch(err => {
    console.error("Error loading textures:", err);
});

const material = new THREE.ShaderMaterial({
    uniforms: {
        texture1: { value: null },
        texture2: { value: null },
        progress: { value: 0 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D texture1;
        uniform sampler2D texture2;
        uniform float progress;

        void main() {
            vec4 tex1 = texture2D(texture1, vUv);
            vec4 tex2 = texture2D(texture2, vUv);
            gl_FragColor = mix(tex1, tex2, progress);
        }
    `,
    transparent: true,
});

const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let progress = 0;
let currentIndex = 0;

function animate() {
    if (!texturesLoaded) return;
    requestAnimationFrame(animate);

    progress += 0.01;
    if (progress > 1) {
        progress = 0;
        currentIndex = (currentIndex + 1) % textures.length;
        material.uniforms.texture1.value = textures[currentIndex];
        material.uniforms.texture2.value = textures[(currentIndex + 1) % textures.length];
    }

    material.uniforms.progress.value = progress;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();
});
