import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const GhostViewer = ({ ghostData }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(null);
    const ghostRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create ghost
        createGhost(scene);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            if (ghostRef.current) {
                ghostRef.current.rotation.y += 0.01;
                ghostRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
            }
            
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // Update ghost appearance based on data
    useEffect(() => {
        if (ghostData && ghostRef.current) {
            updateGhostAppearance(ghostData);
        }
    }, [ghostData]);

    const createGhost = (scene) => {
        const ghostGroup = new THREE.Group();

        // Ghost body (sphere)
        const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7,
            emissive: 0x00ff00,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        ghostGroup.add(body);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.3, 0.8);
        ghostGroup.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.3, 0.8);
        ghostGroup.add(rightEye);

        // Particle system for effects
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 50;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 3;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00ff00,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        ghostGroup.add(particles);

        scene.add(ghostGroup);
        ghostRef.current = ghostGroup;
    };

    const updateGhostAppearance = (data) => {
        if (!ghostRef.current) return;

        const body = ghostRef.current.children[0];
        const particles = ghostRef.current.children[3];

        const health = parseInt(data.health) || 50;
        const isHappy = data.mood === 'Happy';

        // Color interpolation based on health
        const color = new THREE.Color();
        if (isHappy) {
            // Green to bright green
            color.setRGB(0, health / 100, 0);
            body.material.emissive.setRGB(0, health / 100, 0);
            particles.material.color.setRGB(0, 1, 0);
        } else {
            // Dark grey to brown (smoggy)
            color.setRGB(0.3, 0.2, 0.1);
            body.material.emissive.setRGB(0.2, 0.1, 0);
            particles.material.color.setRGB(0.4, 0.3, 0.2);
        }

        body.material.color.copy(color);
        body.material.opacity = 0.5 + (health / 200);
        particles.material.opacity = isHappy ? 0.6 : 0.3;
    };

    return <div ref={mountRef} />;
};

export default GhostViewer;
