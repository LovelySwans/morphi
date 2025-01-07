// Налаштування сцени, камери та рендерера
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

// Завантаження текстур
const textureLoader = new THREE.TextureLoader();
const images = ['1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg'];
let textures = images.map(image => {
    const texture = textureLoader.load(image, () => {
        console.log(`Loaded texture: ${image}`);
    }, undefined, (err) => {
        console.error(`Error loading texture: ${image}`, err);
    });
    return texture;
});
let currentIndex = 0;

// Створення матеріалу
const material = new THREE.ShaderMaterial({
    uniforms: {
        texture1: { value: textures[0] },
        texture2: { value: textures[1] },
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

// Анімація змішування
let progress = 0;
function animate() {
    requestAnimationFrame(animate);

    progress += 0.01; // Швидкість переходу
    if (progress > 1) {
        progress = 0;
        currentIndex = (currentIndex + 1) % textures.length;
        material.uniforms.texture1.value = textures[currentIndex];
        material.uniforms.texture2.value = textures[(currentIndex + 1) % textures.length];
    }

    material.uniforms.progress.value = progress;
    renderer.render(scene, camera);
}

animate();

// Автоматичне оновлення розмірів вікна
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.updateProjectionMatrix();
});

// Add GSAP to your project
import { gsap } from "gsap";

// Example animation using GSAP
gsap.to(mesh.rotation, { duration: 2, x: Math.PI, y: Math.PI });

// Apply uniform size settings dynamically to all images
document.querySelectorAll('img').forEach(img => {
  img.style.width = '100px';
  img.style.height = '100px';
  img.style.objectFit = 'cover';
});
