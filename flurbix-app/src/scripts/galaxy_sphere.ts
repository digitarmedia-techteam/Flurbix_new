import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function initGalaxySphere(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hiddenTemplates = container.querySelector('.galaxy-hidden-templates');
    if (!hiddenTemplates) return; // Wait for templates

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 0, 950);

    const webglRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    webglRenderer.setSize(width, height);
    webglRenderer.setClearColor(0x000000, 0);
    webglRenderer.domElement.style.position = 'absolute';
    webglRenderer.domElement.style.top = '0';
    webglRenderer.domElement.style.left = '0';
    webglRenderer.domElement.style.pointerEvents = 'none';
    webglRenderer.domElement.style.zIndex = '2';
    webglRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    webglRenderer.toneMappingExposure = 1.2;
    container.appendChild(webglRenderer.domElement);

    const cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    cssRenderer.domElement.style.left = '0';
    cssRenderer.domElement.style.zIndex = '1';
    container.appendChild(cssRenderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    const coreLight = new THREE.PointLight(0xffffff, 100, 800);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const pointLightBlue = new THREE.PointLight(0x00f3ff, 200, 1000);
    pointLightBlue.position.set(-300, 200, 300);
    scene.add(pointLightBlue);

    const pointLightPurple = new THREE.PointLight(0xb026ff, 200, 1000);
    pointLightPurple.position.set(300, -200, 300);
    scene.add(pointLightPurple);

    const globeRadius = 260;
    const ecosystem = new THREE.Group();
    scene.add(ecosystem);

    // Glass Sphere
    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        metalness: 0.2,
        roughness: 0.1,
        transmission: 1.0, 
        ior: 1.5,
        thickness: 2.0,
        transparent: true,
        opacity: 0.25, 
        side: THREE.FrontSide,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    const globe = new THREE.Mesh(sphereGeo, glassMat);
    ecosystem.add(globe);

    const glowGeo = new THREE.SphereGeometry(globeRadius * 0.98, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.03,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const glowGlobe = new THREE.Mesh(glowGeo, glowMat);
    ecosystem.add(glowGlobe);

    // Lat/Lon to Vector3 helper
    function calcPosFromLatLonRad(lat: number, lon: number, radius: number) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    }

    // World Map
    async function loadWorldMap() {
        try {
            const response = await fetch('/countries.geo.json');
            const data = await response.json();
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.35,
                blending: THREE.AdditiveBlending
            });
            
            const mapGroup = new THREE.Group();
            
            function addPolygon(polygon: any[]) {
                const points: THREE.Vector3[] = [];
                polygon.forEach((coord: number[]) => {
                    points.push(calcPosFromLatLonRad(coord[1], coord[0], globeRadius + 1));
                });
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                mapGroup.add(line);
            }

            data.features.forEach((feature: any) => {
                if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates.forEach(addPolygon);
                } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach((poly: any) => poly.forEach(addPolygon));
                }
            });
            ecosystem.add(mapGroup);
        } catch (e) {
            console.error("Failed to load map data", e);
        }
    }
    loadWorldMap();

    // CSS3D Elements array
    const cssElements: { object: CSS3DObject, element: HTMLElement, isCenter: boolean }[] = [];
    const cssGroup = new THREE.Group();
    ecosystem.add(cssGroup);

    // Fixed Logo
    const logoEl = document.getElementById('ecosystem-center-logo');
    if (logoEl) {
        logoEl.style.display = 'flex';
        const logoObj = new CSS3DObject(logoEl);
        logoObj.position.set(0, 0, 0);
        scene.add(logoObj); 
        cssElements.push({ object: logoObj, element: logoEl, isCenter: true });
    }

    // Pinned Client Origins (Invisible, just for routing)
    const clientsData = [
        { id: 'client-zomato', lat: 28, lon: 77 },
        { id: 'client-uber', lat: 37, lon: -122 },
        { id: 'client-zepto', lat: 19, lon: 73 }
    ];
    const clientPositions: Record<string, THREE.Vector3> = {};

    clientsData.forEach(client => {
        clientPositions[client.id] = calcPosFromLatLonRad(client.lat, client.lon, globeRadius + 15);
    });

    // Orbiting Icons & Stats
    const iconsData = [
        { id: 'icon-laptop', theta: 0, phi: Math.PI/2 },
        { id: 'icon-email', theta: Math.PI/3, phi: Math.PI/2 - 0.25 },
        { id: 'icon-android', theta: Math.PI*2/3, phi: Math.PI/2 + 0.25 },
        { id: 'icon-apple', theta: Math.PI, phi: Math.PI/2 },
        { id: 'icon-tower', theta: Math.PI*4/3, phi: Math.PI/2 - 0.25 },
        { id: 'icon-web', theta: Math.PI*5/3, phi: Math.PI/2 + 0.25 },
    ];
    const statsData = [
        { id: 'stat-android', theta: Math.PI/6, phi: Math.PI/3 },
        { id: 'stat-apple', theta: Math.PI/6 + Math.PI, phi: Math.PI/3 },
        { id: 'stat-web', theta: Math.PI/6 + Math.PI/2, phi: Math.PI - Math.PI/3 },
        { id: 'stat-phone', theta: Math.PI/6 + Math.PI*1.5, phi: Math.PI - Math.PI/3 },
    ];

    const targetPositions: Record<string, THREE.Vector3> = {};

    function addFloatingCSSObject(elementId: string, radius: number, theta: number, phi: number) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.style.display = 'block'; 
        
        const cssObj = new CSS3DObject(el);
        cssObj.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cssObj.position.y = radius * Math.cos(phi);
        cssObj.position.z = radius * Math.sin(phi) * Math.sin(theta);
        
        targetPositions[elementId] = cssObj.position.clone();
        
        cssGroup.add(cssObj);
        cssElements.push({ object: cssObj, element: el, isCenter: false });
    }

    iconsData.forEach(data => addFloatingCSSObject(data.id, globeRadius + 15, data.theta, data.phi));
    statsData.forEach(data => addFloatingCSSObject(data.id, globeRadius + 15, data.theta, data.phi));

    // Automation Journey Connecting Lines
    const connections = [
        { from: 'client-zomato', to: 'icon-laptop' },
        { from: 'client-zomato', to: 'icon-email' },
        { from: 'client-uber', to: 'icon-android' },
        { from: 'client-uber', to: 'icon-apple' },
        { from: 'client-zepto', to: 'icon-tower' },
        { from: 'client-zepto', to: 'icon-web' },
        { from: 'client-uber', to: 'icon-web' },
        { from: 'client-uber', to: 'stat-android' },
        { from: 'client-zomato', to: 'stat-apple' },
        { from: 'client-zepto', to: 'stat-phone' }
    ];

    const journeyCurves: THREE.QuadraticBezierCurve3[] = [];
    const pulseParticles: { mesh: THREE.Mesh, curve: THREE.QuadraticBezierCurve3, progress: number, speed: number }[] = [];

    // Setup curves and pulses after a short delay to ensure objects are registered
    setTimeout(() => {
        connections.forEach(conn => {
            const start = clientPositions[conn.from];
            const end = targetPositions[conn.to];
            if (!start || !end) return;

            // Control point for the curve (bowing outward)
            const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            const distance = start.distanceTo(end);
            const normal = midPoint.clone().normalize().multiplyScalar(distance * 0.5);
            const control = new THREE.Vector3().addVectors(midPoint, normal);

            const curve = new THREE.QuadraticBezierCurve3(start, control, end);
            journeyCurves.push(curve);

            // Draw line
            const points = curve.getPoints(50);
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
                color: 0xb026ff,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending
            });
            const curveObject = new THREE.Line(lineGeo, lineMat);
            ecosystem.add(curveObject);

            // Pulse Particle
            const pulseGeo = new THREE.SphereGeometry(3, 16, 16);
            const pulseMat = new THREE.MeshBasicMaterial({
                color: 0x00f3ff,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
            ecosystem.add(pulseMesh);
            
            pulseParticles.push({
                mesh: pulseMesh,
                curve: curve,
                progress: Math.random(), // Random start
                speed: 0.2 + Math.random() * 0.2
            });
        });
    }, 100);

    // Controls
    const controls = new OrbitControls(camera, cssRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8; 

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        controls.update();

        // Floating scene
        const floatY = Math.sin(time * 1.5) * 8;
        ecosystem.position.y = floatY;
        
        const centerLogo = cssElements.find(i => i.isCenter);
        if (centerLogo) {
            centerLogo.object.position.y = floatY;
            centerLogo.object.quaternion.copy(camera.quaternion);
        }

        // Auto rotate ecosystem
        ecosystem.rotation.y -= 0.05 * delta;

        // Billboarding & Fading CSS3D
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);

        cssElements.forEach(item => {
            if (item.isCenter) return; 
            
            const objWorldPos = new THREE.Vector3();
            item.object.getWorldPosition(objWorldPos);
            
            const centerWorldPos = new THREE.Vector3();
            ecosystem.getWorldPosition(centerWorldPos);
            
            const toObject = new THREE.Vector3().subVectors(objWorldPos, centerWorldPos).normalize();
            const dot = toObject.dot(camDir);
            
            let opacity = 0;
            if (dot < -0.1) {
                opacity = 1;
            } else if (dot < 0.3) {
                opacity = 1 - ((dot + 0.1) / 0.4);
            } else {
                opacity = 0;
            }
            
            item.element.style.opacity = opacity.toString();
            item.element.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';

            item.object.quaternion.copy(camera.quaternion);
            
            const scale = 0.85 + (opacity * 0.15);
            item.object.scale.setScalar(scale);
        });

        // Animate pulses along paths
        pulseParticles.forEach(p => {
            p.progress += p.speed * delta;
            if (p.progress > 1) p.progress = 0;
            
            const pt = p.curve.getPointAt(p.progress);
            p.mesh.position.copy(pt);
            
            // Optional: scale pulse to simulate glow
            const pulseScale = 1 + Math.sin(time * 10 + p.progress * 10) * 0.3;
            p.mesh.scale.setScalar(pulseScale);
        });

        webglRenderer.render(scene, camera);
        cssRenderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        webglRenderer.setSize(w, h);
        cssRenderer.setSize(w, h);
    });
}
