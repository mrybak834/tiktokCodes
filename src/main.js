// src/main.js

import * as THREE from 'three';
import Scene from './components/Scene';

const scene = new Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function animate() {
    requestAnimationFrame(animate);
    scene.update();
    renderer.render(scene.getScene(), scene.getCamera());
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    scene.getCamera().aspect = width / height;
    scene.getCamera().updateProjectionMatrix();
});

animate();