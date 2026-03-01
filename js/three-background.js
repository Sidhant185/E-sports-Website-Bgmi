// Three.js Background Scene
class HalloweenBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.fogLayers = [];
        this.ghostTrails = [];
        this.spiderWebs = [];
        this.webTimer = 0;
        this.webInterval = 8000; // 8 seconds
        this.animationId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMobile = window.innerWidth < 768;
        
        this.init();
    }

    init() {
        const canvas = document.getElementById('three-canvas');
        if (!canvas) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true, 
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Position camera
        this.camera.position.z = 5;
        
        // Create effects
        this.createParticles();
        this.createFogLayers();
        this.createGhostTrails();
        this.createFlickeringLights();
        this.createSpiderWeb();
        
        // Event listeners
        this.addEventListeners();
        
        // Start animation
        this.animate();
    }

    createParticles() {
        const particleCount = this.isMobile ? 200 : 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            // Blood theme colors - only red variations
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                // Bright red
                colors[i3] = 1.0;     // Red
                colors[i3 + 1] = 0.0; // No green
                colors[i3 + 2] = 0.0; // No blue
            } else if (colorChoice < 0.8) {
                // Dark red
                colors[i3] = 0.55;   // Dark red
                colors[i3 + 1] = 0.0;
                colors[i3 + 2] = 0.0;
            } else {
                // Crimson
                colors[i3] = 0.8;   // Crimson red
                colors[i3 + 1] = 0.1;
                colors[i3 + 2] = 0.0;
            }
            
            sizes[i] = Math.random() * 0.6 + 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 customColor;
                uniform float time;
                varying vec3 vColor;
                
                void main() {
                    vColor = customColor;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Floating animation
                    mvPosition.y += sin(time * 0.5 + position.x * 0.1) * 0.5;
                    mvPosition.x += cos(time * 0.3 + position.z * 0.1) * 0.3;
                    
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha * 1.0);
                }
            `,
            transparent: true,
            vertexColors: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createFogLayers() {
        // Create blood mist layers - more intense Halloween effect
        for (let i = 0; i < 5; i++) {
            const fogGeometry = new THREE.PlaneGeometry(40, 40);
            const fogMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    layer: { value: i }
                },
                vertexShader: `
                    uniform float time;
                    uniform float layer;
                    varying vec2 vUv;
                    
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        pos.z += layer * 2.5;
                        pos.y += sin(time * 0.4 + layer) * 1.2;
                        pos.x += cos(time * 0.3 + layer) * 0.8;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform float layer;
                    varying vec2 vUv;
                    
                    void main() {
                        vec2 uv = vUv;
                        
                        // Blood ripple effect - more intense
                        float ripple = sin(length(uv - vec2(0.5, 0.5)) * 20.0 - time * 2.5) * 0.5 + 0.5;
                        float noise = sin(uv.x * 15.0 + time * 0.5) * sin(uv.y * 12.0 + time * 0.4);
                        float finalNoise = (ripple + noise) * 0.5;
                        
                        // Blood red color with variations - more visible
                        vec3 bloodColor = vec3(0.9 - layer * 0.12, 0.0, 0.0);
                        
                        float alpha = finalNoise * 0.25 * (1.0 - layer * 0.15);
                        gl_FragColor = vec4(bloodColor, alpha);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });

            const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
            fogMesh.position.z = -5 + i * 2.5;
            this.fogLayers.push(fogMesh);
            this.scene.add(fogMesh);
        }
    }

    createGhostTrails() {
        // Create spectral trail effects
        for (let i = 0; i < 5; i++) {
            const trailGeometry = new THREE.BufferGeometry();
            const trailPositions = new Float32Array(50 * 3);
            
            for (let j = 0; j < 50; j++) {
                const j3 = j * 3;
                trailPositions[j3] = (Math.random() - 0.5) * 15;
                trailPositions[j3 + 1] = (Math.random() - 0.5) * 15;
                trailPositions[j3 + 2] = (Math.random() - 0.5) * 10;
            }
            
            trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
            
            const trailMaterial = new THREE.LineBasicMaterial({
                color: 0x8b00ff,
                transparent: true,
                opacity: 0.3
            });
            
            const trail = new THREE.Line(trailGeometry, trailMaterial);
            this.ghostTrails.push(trail);
            this.scene.add(trail);
        }
    }

    createFlickeringLights() {
        // Add flickering light sources
        const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 8; i++) {
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            );
            this.scene.add(light);
        }
    }

    createSpiderWeb() {
        // Create animated spider web that appears and disappears
        const webGeometry = new THREE.BufferGeometry();
        const webPoints = [];
        
        // Create web structure - radial lines and concentric circles
        const centerX = (Math.random() - 0.5) * 15;
        const centerY = (Math.random() - 0.5) * 15;
        const centerZ = (Math.random() - 0.5) * 10;
        
        // Radial lines (8 spokes)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            const endX = centerX + Math.cos(angle) * radius;
            const endY = centerY + Math.sin(angle) * radius;
            
            webPoints.push(centerX, centerY, centerZ);
            webPoints.push(endX, endY, centerZ);
        }
        
        // Concentric circles
        for (let r = 1; r <= 3; r++) {
            const segments = 16;
            for (let i = 0; i < segments; i++) {
                const angle1 = (i / segments) * Math.PI * 2;
                const angle2 = ((i + 1) / segments) * Math.PI * 2;
                
                const x1 = centerX + Math.cos(angle1) * r;
                const y1 = centerY + Math.sin(angle1) * r;
                const x2 = centerX + Math.cos(angle2) * r;
                const y2 = centerY + Math.sin(angle2) * r;
                
                webPoints.push(x1, y1, centerZ);
                webPoints.push(x2, y2, centerZ);
            }
        }
        
        webGeometry.setAttribute('position', new THREE.Float32BufferAttribute(webPoints, 3));
        
        const webMaterial = new THREE.LineBasicMaterial({
            color: 0x8b0000, // Blood red
            transparent: true,
            opacity: 0.0,
            linewidth: 1
        });
        
        const spiderWeb = new THREE.LineSegments(webGeometry, webMaterial);
        spiderWeb.userData = {
            opacity: 0,
            targetOpacity: 0,
            fadeSpeed: 0.02,
            lifeTime: 0,
            maxLifeTime: 3000 // 3 seconds
        };
        
        this.spiderWebs.push(spiderWeb);
        this.scene.add(spiderWeb);
    }

    addEventListeners() {
        // Mouse movement for parallax
        window.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Scroll parallax
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            this.camera.position.y = scrollY * 0.01;
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Update particles
        if (this.particles) {
            this.particles.material.uniforms.time.value = time;
            this.particles.rotation.y += 0.001;
        }

        // Update blood fog layers
        this.fogLayers.forEach((fog, index) => {
            fog.material.uniforms.time.value = time;
            fog.rotation.z += 0.001 * (index + 1);
        });

        // Update ghost trails
        this.ghostTrails.forEach((trail, index) => {
            trail.rotation.y += 0.002 * (index + 1);
            trail.material.opacity = 0.2 + Math.sin(time * 2 + index) * 0.1;
        });

        // Update spider webs
        this.webTimer += 16; // Assuming 60fps
        if (this.webTimer >= this.webInterval) {
            this.webTimer = 0;
            this.createSpiderWeb();
        }
        
        this.spiderWebs.forEach((web, index) => {
            const userData = web.userData;
            userData.lifeTime += 16;
            
            // Fade in for first 1 second
            if (userData.lifeTime < 1000) {
                userData.targetOpacity = 0.8;
            }
            // Stay visible for 1 second
            else if (userData.lifeTime < 2000) {
                userData.targetOpacity = 0.8;
            }
            // Fade out for last 1 second
            else if (userData.lifeTime < 3000) {
                userData.targetOpacity = 0.0;
            }
            // Remove web after 3 seconds
            else {
                this.scene.remove(web);
                this.spiderWebs.splice(index, 1);
                return;
            }
            
            // Smooth opacity transition
            userData.opacity += (userData.targetOpacity - userData.opacity) * userData.fadeSpeed;
            web.material.opacity = userData.opacity;
            
            // Slight rotation for effect
            web.rotation.z += 0.001;
        });

        // Mouse parallax effect
        this.camera.position.x += (this.mouseX * 0.5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouseY * 0.5 - this.camera.position.y) * 0.05;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main page, not admin
    if (document.getElementById('three-canvas')) {
        window.halloweenBackground = new HalloweenBackground();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.halloweenBackground) {
        window.halloweenBackground.destroy();
    }
});
