export function initNetworkCanvas() {
    const canvas = document.getElementById('network') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Twinkling stars backdrop
    interface Star {
        x: number;
        y: number;
        size: number;
        phase: number;
        speed: number;
    }
    const stars: Star[] = [];

    // Continent Polygons in Lat/Lon coordinates
    const continents: [number, number][][] = [
        // North America (Archipelago, Florida, Gulf, Central America, West Coast)
        [
            [70, -165], [71, -155], [71, -145], [70, -140],
            [69, -135], [69, -120], [70, -110], [65, -100], [60, -95], [55, -90], [55, -80], [62, -80], [63, -75], [60, -65], [55, -60], [58, -60], [60, -64], [63, -64], [60, -55],
            [54, -57], [52, -55], [47, -53], [47, -59], [45, -61],
            [43, -70], [40, -74], [37, -76], [34, -78],
            [30, -81], [25, -80], [25, -82], [28, -83], [30, -85],
            [30, -88], [29, -94], [26, -97], [22, -97],
            [21, -90], [21, -87], [18, -88],
            [16, -92], [15, -90], [12, -86], [9, -83], [8, -79], [8, -77], [9, -79], [10, -83], [13, -87], [14, -91], [16, -95],
            [16, -98], [17, -100], [20, -105], [22, -106], [25, -110], [30, -115], [32, -118], [36, -122], [40, -124], [45, -124], [50, -127], [54, -130], [58, -137], [60, -140], [60, -146], [60, -150], [58, -155], [55, -160], [53, -166], [55, -163], [58, -158], [61, -150], [64, -162]
        ],
        // South America (Colombia, Brazil, East Coast, Tierra del Fuego, Chile, Peru)
        [
            [12, -72], [10, -68], [10, -62], [8, -58], [6, -54], [5, -50], [2, -50], [0, -50],
            [-3, -43], [-5, -37], [-8, -35], [-12, -37], [-16, -39],
            [-20, -40], [-23, -43], [-27, -48], [-33, -51], [-35, -55], [-39, -58], [-43, -64], [-48, -66], [-52, -68], [-54, -67],
            [-55, -67], [-55, -71], [-54, -73], [-50, -75], [-45, -74],
            [-40, -74], [-35, -73], [-30, -71], [-25, -70], [-20, -70], [-15, -75], [-12, -77], [-8, -79], [-5, -81], [-2, -80],
            [1, -79], [4, -77], [7, -78], [9, -76]
        ],
        // Africa (Mediterranean, Suez, Horn, East Coast, Cape, West Coast, Mauritania)
        [
            [36, -5], [35, 2], [37, 10], [36, 12], [34, 14], [32, 15], [32, 20], [31, 25], [31, 30], [31, 32], [30, 32],
            [27, 34], [25, 36], [20, 39], [15, 42], [12, 43],
            [12, 45], [12, 51], [10, 51], [8, 49], [5, 48], [2, 45], [0, 42],
            [-4, 39], [-8, 39], [-12, 40], [-16, 39], [-20, 35], [-25, 33], [-30, 31], [-33, 27],
            [-34, 20], [-33, 18],
            [-30, 15], [-25, 15], [-20, 12], [-15, 12], [-10, 13], [-5, 12], [-2, 10], [0, 9], [4, 9], [6, 3], [5, -3], [5, -7], [8, -13], [12, -16], [15, -17], [17, -16], [20, -17], [23, -16],
            [26, -15], [30, -10], [33, -7], [35, -6]
        ],
        // Eurasia (Spain, Italy, Greece, Middle East, India, Indochina, China, Siberia, Scandinavia)
        [
            [36, -9], [37, -9], [39, -9], [42, -9], [43, -9], [43, -3], [43, -1], [42, 3], [39, 0], [37, -1], [36, -5],
            [44, -1], [46, -2], [48, -5], [48, -2], [50, 1], [51, 3], [54, 8], [54, 11], [58, 11], [58, 15], [54, 15],
            [55, 8], [56, 10], [58, 10], [59, 5], [62, 5], [65, 12], [68, 15], [70, 20], [71, 26], [70, 30], [68, 38], [66, 43], [60, 29], [60, 22], [55, 21], [54, 19],
            [44, 8], [41, 12], [38, 15], [40, 17], [42, 14], [45, 12],
            [45, 15], [42, 19], [40, 19], [38, 20], [36, 23], [38, 24], [40, 23], [41, 26], [41, 29],
            [41, 29], [40, 32], [41, 36], [41, 41], [37, 41], [36, 30],
            [33, 35], [31, 34], [29, 34],
            [25, 38], [20, 40], [15, 42], [13, 43],
            [12, 45], [12, 54], [17, 54], [22, 60], [25, 58], [26, 52], [30, 48],
            [25, 61], [25, 68], [22, 69], [20, 73], [15, 74], [10, 76], [8, 77], [10, 80], [15, 80], [20, 85], [22, 90], [22, 92],
            [20, 93], [15, 96], [10, 99], [5, 100], [1.5, 103], [4, 104], [10, 104], [10, 108], [15, 109], [20, 107], [22, 108],
            [22, 114], [22, 120], [30, 122], [32, 120], [34, 120], [37, 125], [35, 129], [38, 129], [40, 128], [40, 124], [40, 120], [37, 118], [37, 115],
            [40, 130], [43, 132], [45, 137], [50, 141], [55, 143], [60, 150], [60, 160], [60, 170], [65, 180], [68, 175], [70, 170], [73, 140], [75, 120], [75, 100], [75, 80], [72, 60], [70, 50], [68, 45]
        ],
        // Australia (recognisable coastlines, Cape York, Great Bight)
        [
            [-22, 114], [-25, 113], [-30, 115], [-35, 117], [-35, 120], [-33, 125], [-33, 131], [-35, 136], [-38, 140], [-38, 145], [-37, 150], [-32, 152], [-28, 153], [-22, 150], [-15, 145], [-11, 142], [-13, 136], [-15, 136], [-12, 131], [-15, 124], [-16, 121], [-20, 118]
        ],
        // Greenland (proportional shape)
        [
            [60, -45], [60, -50], [65, -52], [70, -55], [75, -73], [78, -73], [82, -60], [83, -40], [82, -30], [80, -20], [75, -20], [70, -22], [65, -35], [60, -43]
        ],
        // Antarctica (proper polar ice cap profile)
        [
            [-65, -64], [-65, -60], [-66, -50], [-66, -40], [-68, -30], [-70, -20], [-70, -10], [-70, 0], [-70, 10], [-69, 30], [-69, 50], [-67, 70], [-67, 90], [-66, 110], [-66, 130], [-67, 140], [-71, 160], [-73, 170], [-75, 180], [-75, -180], [-73, -170], [-71, -160], [-72, -140], [-73, -120], [-73, -100], [-70, -90], [-70, -80], [-68, -75], [-65, -68]
        ],
        // Great Britain
        [
            [50, -5], [52, -5], [55, -6], [58, -5], [59, -3], [57, -2], [54, -0.5], [51, 1.5], [50, -1.5]
        ],
        // Ireland
        [
            [51.5, -10], [53, -10], [54.5, -9], [54, -6], [52, -6], [51.5, -9]
        ],
        // Iceland
        [
            [63.5, -24], [65.5, -24], [66, -22], [66, -15], [64, -14], [63.5, -19]
        ],
        // Madagascar
        [
            [-12, 49], [-16, 50], [-22, 48], [-25, 47], [-25, 44], [-20, 44], [-15, 47]
        ],
        // Japan
        [
            [31, 130], [33, 132], [35, 135], [38, 140], [41, 141], [43, 143], [43, 145], [40, 140], [35, 138], [33, 135]
        ]
    ];

    function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
        );
    }

    function getSmoothContinent(polygon: [number, number][], stepsPerSegment: number = 30): [number, number][] {
        const n = polygon.length;
        const result: [number, number][] = [];
        
        for (let i = 0; i < n; i++) {
            const p0 = polygon[(i - 1 + n) % n];
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % n];
            const p3 = polygon[(i + 2) % n];
            
            let lon0 = p0[1];
            let lon1 = p1[1];
            let lon2 = p2[1];
            let lon3 = p3[1];
            
            // Unify longitudes to prevent wrapping jumps during interpolation
            while (lon0 - lon1 > 180) lon0 -= 360;
            while (lon0 - lon1 < -180) lon0 += 360;
            
            while (lon2 - lon1 > 180) lon2 -= 360;
            while (lon2 - lon1 < -180) lon2 += 360;
            
            while (lon3 - lon2 > 180) lon3 -= 360;
            while (lon3 - lon2 < -180) lon3 += 360;
            
            for (let s = 0; s < stepsPerSegment; s++) {
                const t = s / stepsPerSegment;
                const lat = catmullRom(p0[0], p1[0], p2[0], p3[0], t);
                let lon = catmullRom(lon0, lon1, lon2, lon3, t);
                
                while (lon > 180) lon -= 360;
                while (lon < -180) lon += 360;
                
                result.push([lat, lon]);
            }
        }
        return result;
    }

    const interpolatedContinents = continents.map(c => getSmoothContinent(c, 25));

    // Node specifications
    interface JourneyNode {
        type: 'brand' | 'tower' | 'web' | 'laptop' | 'email' | 'mobile' | 'apple' | 'android' | 'flurbix';
        lat: number;
        lon: number;
        success: boolean;
        glowIntensity: number;
        connected: boolean;
        opacity: number;
        fadeState: 'in' | 'active' | 'out';
        lifetime: number;
        parentId?: number;
    }

    const nodes: JourneyNode[] = [
        // Brand (0) - always active and connected
        { type: 'brand', lat: 12, lon: -35, success: false, glowIntensity: 0, connected: true, opacity: 1, fadeState: 'active', lifetime: 999999 }
    ];

    const types: ('tower' | 'web' | 'laptop' | 'email' | 'apple' | 'android')[] = [
        'tower', 'tower', 'tower',
        'web', 'web', 'web', 'web',
        'laptop', 'laptop', 'laptop',
        'email', 'email', 'email',
        'apple', 'apple', 'apple',
        'android', 'android', 'android'
    ];

    // Helper to assign a parent index hierarchically
    function assignParent(nodeIdx: number) {
        const node = nodes[nodeIdx];
        if (node.type === 'tower') {
            node.parentId = 0; // Brand is always parent of towers
        } else if (node.type === 'web') {
            // Find a random tower (indices 1, 2, 3)
            node.parentId = 1 + Math.floor(Math.random() * 3);
        } else {
            // Endpoints: Find a random web (indices 4, 5, 6, 7)
            node.parentId = 4 + Math.floor(Math.random() * 4);
        }
    }

    // Programmatically populate towers, webs, and endpoints
    types.forEach((type, idx) => {
        const nodeIdx = idx + 1;
        const lat = -50 + Math.random() * 100;
        const lon = -180 + Math.random() * 360;
        
        // Stagger initial phases so they don't fade in/out in unison
        const startActive = Math.random() > 0.4;
        const fadeState = startActive ? 'active' : 'in';
        const opacity = startActive ? 1.0 : Math.random();
        const lifetime = startActive ? 100 + Math.random() * 200 : 0;

        nodes.push({
            type,
            lat,
            lon,
            success: false,
            glowIntensity: 0,
            connected: startActive,
            opacity,
            fadeState,
            lifetime
        });

        assignParent(nodeIdx);
    });

    const brands = ['zomato', 'zepto', 'uber'];
    let currentBrandIndex = 0;
    let lastBrandSwitchTime = 0;

    // Active Comets
    interface Comet {
        sourceIndex: number;
        targetIndex: number;
        progress: number;
        speed: number;
        color: string;
    }
    const comets: Comet[] = [];

    function initStars(w: number, h: number) {
        stars.length = 0;
        const count = 100;
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.5 + 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.007 + Math.random() * 0.015
            });
        }
    }

    let angle = 0;
    let tilt = 0;
    let velocityX = 0.0024; // starting with idle speed Y
    let velocityY = 0;
    let radius = 0;

    let isMouseActive = false;
    let lastMouseMoveTime = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    canvas.addEventListener('mousemove', (e) => {
        isMouseActive = true;
        lastMouseMoveTime = performance.now();

        const dx = e.clientX - lastClientX;
        const dy = e.clientY - lastClientY;

        lastClientX = e.clientX;
        lastClientY = e.clientY;

        // Convert mouse movement to momentum velocity
        velocityX += dx * 0.0006;
        velocityY += dy * 0.0006;
    });

    canvas.addEventListener('mouseenter', (e) => {
        isMouseActive = true;
        lastClientX = e.clientX;
        lastClientY = e.clientY;
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseActive = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        isMouseActive = true;
        lastMouseMoveTime = performance.now();

        // Convert wheel delta to vertical and horizontal velocity
        velocityY += e.deltaY * 0.0004;
        velocityX += e.deltaX * 0.0004;
    }, { passive: false });

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        radius = Math.min(width, height) * 0.42;
        initStars(width, height);
    }

    // 3D Math Vectors
    interface Vector3D {
        x: number;
        y: number;
        z: number;
    }

    function getLatLng3D(lat: number, lon: number, r: number): Vector3D {
        const phi = lat * Math.PI / 180;
        const theta = lon * Math.PI / 180;
        return {
            x: r * Math.cos(phi) * Math.sin(theta),
            y: -r * Math.sin(phi),
            z: r * Math.cos(phi) * Math.cos(theta)
        };
    }

    function getBezierControlPoint(pA: Vector3D, pB: Vector3D, r: number): Vector3D {
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;
        const midZ = (pA.z + pB.z) / 2;
        const dist = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
        const peakRadius = r * (1.18 + (1 - dist / r) * 0.15);
        return {
            x: (midX / dist) * peakRadius,
            y: (midY / dist) * peakRadius,
            z: (midZ / dist) * peakRadius
        };
    }

    function rotateY(p: Vector3D, alpha: number): Vector3D {
        const cos = Math.cos(alpha);
        const sin = Math.sin(alpha);
        return {
            x: p.x * cos + p.z * sin,
            y: p.y,
            z: -p.x * sin + p.z * cos
        };
    }

    function rotateX(p: Vector3D, beta: number): Vector3D {
        const cos = Math.cos(beta);
        const sin = Math.sin(beta);
        return {
            x: p.x,
            y: p.y * cos - p.z * sin,
            z: p.y * sin + p.z * cos
        };
    }

    function rotateGlobe(p: Vector3D, alpha: number, beta: number): Vector3D {
        const p1 = rotateY(p, alpha);
        return rotateX(p1, beta);
    }

    function drawStars() {
        for (const s of stars) {
            s.phase += s.speed;
            const alpha = 0.2 + 0.8 * ((Math.sin(s.phase) + 1) / 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawAtmosphere(cx: number, cy: number, r: number) {
        ctx.save();
        const backGlow = ctx.createRadialGradient(cx, cy, r - 10, cx, cy, r + 40);
        backGlow.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
        backGlow.addColorStop(0.3, 'rgba(6, 182, 212, 0.12)');
        backGlow.addColorStop(0.7, 'rgba(6, 182, 212, 0.04)');
        backGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = backGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawSphereBase(cx: number, cy: number, r: number) {
        ctx.save();
        const shading = ctx.createRadialGradient(
            cx - r * 0.2, cy - r * 0.2, 0,
            cx, cy, r
        );
        shading.addColorStop(0, '#0a1020');
        shading.addColorStop(0.5, '#040710');
        shading.addColorStop(1, '#020306');
        ctx.fillStyle = shading;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    // Custom Icon Drawing Utilities
    function drawTowerIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw top transmitter dot
        ctx.beginPath();
        ctx.arc(0, -2, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();

        // Tower Structure
        ctx.beginPath();
        ctx.moveTo(-4, 10);
        ctx.lineTo(0, -2);
        ctx.lineTo(4, 10);
        ctx.moveTo(-4, 10); ctx.lineTo(4, 10);
        ctx.moveTo(-2.4, 6); ctx.lineTo(2.4, 6);
        ctx.moveTo(-0.8, 2); ctx.lineTo(0.8, 2);

        // X-bracing diagonals
        ctx.moveTo(-4, 10); ctx.lineTo(2.4, 6);
        ctx.moveTo(4, 10); ctx.lineTo(-2.4, 6);
        ctx.moveTo(-2.4, 6); ctx.lineTo(0.8, 2);
        ctx.moveTo(2.4, 6); ctx.lineTo(-0.8, 2);
        ctx.stroke();

        // Left waves
        const waveAngle = 0.7 * Math.PI;
        ctx.beginPath();
        ctx.arc(0, -2, 5, waveAngle, 1.3 * Math.PI);
        ctx.arc(0, -2, 8, waveAngle, 1.3 * Math.PI);
        ctx.stroke();

        // Right waves
        const waveAngleRight = -0.3 * Math.PI;
        ctx.beginPath();
        ctx.arc(0, -2, 5, waveAngleRight, 0.3 * Math.PI);
        ctx.arc(0, -2, 8, waveAngleRight, 0.3 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }

    function drawLaptopIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Screen
        ctx.beginPath();
        ctx.roundRect(-8, -6, 16, 10, 1.5);
        ctx.stroke();

        // Keyboard Base
        ctx.beginPath();
        ctx.moveTo(-11, 4.5);
        ctx.lineTo(11, 4.5);
        ctx.lineTo(9, 7.5);
        ctx.lineTo(-9, 7.5);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    function drawMobileIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer case
        ctx.beginPath();
        ctx.roundRect(-5, -9, 10, 18, 2);
        ctx.stroke();

        // Screen details
        ctx.beginPath();
        ctx.moveTo(-2, -7.5); ctx.lineTo(2, -7.5); // speaker notch
        ctx.moveTo(-1.5, 7.5); ctx.lineTo(1.5, 7.5); // home bar
        ctx.stroke();

        ctx.restore();
    }

    function drawWebIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Holographic browser window / globe mesh representation
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
        ctx.moveTo(0, -9); ctx.lineTo(0, 9);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 9, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawEmailIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Envelope rectangle
        ctx.beginPath();
        ctx.roundRect(-8, -6, 16, 12, 1.5);
        ctx.stroke();

        // Inner flap lines
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(0, 1);
        ctx.lineTo(8, -6);
        ctx.stroke();

        ctx.restore();
    }

    function drawAppleIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        const apple = new Path2D(
            "M-1,-5 C-3,-5 -5,-4 -6,-2 C-9,3 -7,9 -4,10 C-2,10.5 -1,9.5 0,9.5 C1,9.5 2,10.5 4,10 C7,9 9,3 9,3 C9,3 6,2 6,-1 C6,-4 9,-5 9,-5 C7,-7 4,-7 2,-6 C1,-5.5 0,-5.5 -1,-5 Z M1,-6 C1,-8 3,-10 5,-10 C5,-8 3,-6 1,-6 Z"
        );
        ctx.fill(apple);
        ctx.restore();
    }

    function drawAndroidIcon(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Head
        ctx.beginPath();
        ctx.arc(0, -2, 5, Math.PI, 0);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(-2, -4, 0.8, 0, Math.PI * 2);
        ctx.arc(2, -4, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Antennas
        ctx.beginPath();
        ctx.moveTo(-3, -6.5); ctx.lineTo(-4.5, -9);
        ctx.moveTo(3, -6.5); ctx.lineTo(4.5, -9);
        ctx.stroke();

        // Body
        ctx.beginPath();
        ctx.roundRect(-5, -1, 10, 8, [0, 0, 1.5, 1.5]);
        ctx.stroke();

        ctx.restore();
    }

    function drawBrandBadge(brand: string, x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = opacity;

        const w = size * 2.1;
        const h = size * 0.95;

        // Draw pill background
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 6);
        
        if (brand === 'zomato') {
            ctx.fillStyle = 'rgba(226, 55, 68, 0.95)';
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 700 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('zomato', 0, 1);
        } else if (brand === 'uber') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Uber', 0, 1);
        } else if (brand === 'zepto') {
            ctx.fillStyle = 'rgba(62, 10, 114, 0.95)';
            ctx.fill();
            
            const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#e9d5ff');
            ctx.fillStyle = grad;
            ctx.font = '700 14px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('zepto', 0, 1);
        }

        ctx.restore();
    }

    function drawBadgeSuccess(x: number, y: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(x + size / 1.6, y - size / 1.6);
        ctx.globalAlpha = opacity;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 11);
        glowGrad.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        glowGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner solid green badge
        ctx.fillStyle = 'rgba(34, 197, 94, 1)';
        ctx.beginPath();
        ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
        ctx.fill();

        // Checkmark drawing
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-2.2, 0);
        ctx.lineTo(-0.4, 2.2);
        ctx.lineTo(3.2, -2.2);
        ctx.stroke();

        ctx.restore();
    }

    function drawGlow(cx: number, cy: number, radius: number, color: string, intensity: number) {
        if (intensity <= 0) return;
        ctx.save();
        ctx.translate(cx, cy);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        const baseColor = color.substring(0, color.lastIndexOf(','));
        grad.addColorStop(0, `${baseColor}, ${intensity * 0.45})`);
        grad.addColorStop(0.5, `${baseColor}, ${intensity * 0.15})`);
        grad.addColorStop(1, `${baseColor}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function getGlowColor(type: string, activeBrand: string): string {
        if (type === 'brand') {
            if (activeBrand === 'zomato') return 'rgba(226, 55, 68, 1)';
            if (activeBrand === 'zepto') return 'rgba(147, 51, 234, 1)';
            if (activeBrand === 'uber') return 'rgba(255, 255, 255, 1)';
        }
        if (type === 'tower' || type === 'web') {
            return 'rgba(6, 182, 212, 1)'; // teal communication glow
        }
        return 'rgba(34, 197, 94, 1)'; // success green glow
    }

    function drawArcSection(
        pA: Vector3D, pMid: Vector3D, pB: Vector3D,
        tStart: number, tEnd: number,
        color: string, lineWidth: number,
        cx: number, cy: number, r: number
    ) {
        ctx.beginPath();
        let first = true;
        const step = 0.025;

        for (let t = tStart; t <= tEnd + 0.001; t += step) {
            const adjustedT = Math.min(1.0, t);
            const x = (1 - adjustedT) * (1 - adjustedT) * pA.x + 2 * (1 - adjustedT) * adjustedT * pMid.x + adjustedT * adjustedT * pB.x;
            const y = (1 - adjustedT) * (1 - adjustedT) * pA.y + 2 * (1 - adjustedT) * adjustedT * pMid.y + adjustedT * adjustedT * pB.y;
            const z = (1 - adjustedT) * (1 - adjustedT) * pA.z + 2 * (1 - adjustedT) * adjustedT * pMid.z + adjustedT * adjustedT * pB.z;

            const rp = rotateGlobe({ x, y, z }, angle, tilt);
            const depthFade = (rp.z / r) + 0.2;
            const finalAlpha = Math.max(0, Math.min(1, depthFade));
            if (finalAlpha <= 0) continue;

            const sx = cx + rp.x;
            const sy = cy + rp.y;

            if (first) {
                ctx.moveTo(sx, sy);
                first = false;
            } else {
                ctx.lineTo(sx, sy);
            }
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    function drawGridLines(cx: number, cy: number, r: number) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;

        // Longitude rings
        for (let idx = 0; idx < 3; idx++) {
            const rotOffset = (idx * Math.PI) / 3;
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
                const vec3d = {
                    x: r * Math.sin(a) * Math.cos(rotOffset),
                    y: r * Math.cos(a),
                    z: r * Math.sin(a) * Math.sin(rotOffset)
                };
                const rp = rotateGlobe(vec3d, angle, tilt);
                if (rp.z > 0) {
                    const sx = cx + rp.x;
                    const sy = cy + rp.y;
                    if (a === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
            }
            ctx.stroke();
        }

        // Latitude rings
        const latFactors = [-0.5, 0, 0.5];
        for (const lf of latFactors) {
            const latY = r * lf;
            const latRadius = Math.sqrt(r * r - latY * latY);
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
                const vec3d = {
                    x: latRadius * Math.sin(a),
                    y: latY,
                    z: latRadius * Math.cos(a)
                };
                const rp = rotateGlobe(vec3d, angle, tilt);
                if (rp.z > 0) {
                    const sx = cx + rp.x;
                    const sy = cy + rp.y;
                    if (a === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawConnectionPath(
        fromIndex: number, toIndex: number,
        color: string, lineWidth: number,
        cx: number, cy: number, r: number
    ) {
        const fromNode = nodes[fromIndex];
        const toNode = nodes[toIndex];
        const pA = getLatLng3D(fromNode.lat, fromNode.lon, r);
        const pB = getLatLng3D(toNode.lat, toNode.lon, r);
        const pMid = getBezierControlPoint(pA, pB, r);

        drawArcSection(pA, pMid, pB, 0, 1.0, color, lineWidth, cx, cy, r);
    }

    function triggerComet(sourceIndex: number, targetIndex: number, speed: number, color: string) {
        comets.push({
            sourceIndex,
            targetIndex,
            progress: 0,
            speed,
            color
        });
    }

    function animate(time: number) {
        // Clear canvas with black fill
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Damping/friction for natural inertia
        velocityX *= 0.94;
        velocityY *= 0.94;

        // Check for idle transition (800ms)
        const now = performance.now();
        const isIdle = !isMouseActive || (now - lastMouseMoveTime > 800);

        if (isIdle) {
            // Smoothly ease horizontal speed back to slow autonomous spin
            velocityX += (0.0024 - velocityX) * 0.05;
            // Smoothly ease vertical tilt back to upright position
            tilt += (0 - tilt) * 0.05;
        }

        // Apply velocities to rotations
        angle += velocityX;
        tilt += velocityY;

        // Prevent vertical flipping by capping the tilt range (approx +/- 65 degrees)
        const maxTilt = Math.PI * 0.36;
        if (tilt > maxTilt) {
            tilt = maxTilt;
            velocityY = 0;
        } else if (tilt < -maxTilt) {
            tilt = -maxTilt;
            velocityY = 0;
        }

        const cx = width / 2;
        const cy = height / 2;
        const activeBrand = brands[currentBrandIndex];

        // 1. Twinkling stars backdrop
        drawStars();

        // 2. Globe atmospheric glow
        drawAtmosphere(cx, cy, radius);

        // 3. Shaded 3D sphere base
        drawSphereBase(cx, cy, radius);

        // 4. Coordinate grid overlay
        drawGridLines(cx, cy, radius);

        // 5. Render Land Polygons and Outlines
        interpolatedContinents.forEach(pts => {
            let anyVisible = false;
            const projected = pts.map(p => {
                const raw = getLatLng3D(p[0], p[1], radius);
                const rot = rotateGlobe(raw, angle, tilt);
                if (rot.z >= 0) anyVisible = true;
                return rot;
            });

            if (!anyVisible) return;

            // Fill the land area (plain color)
            ctx.save();
            ctx.beginPath();
            projected.forEach((rot, idx) => {
                let sx = rot.x;
                let sy = rot.y;
                if (rot.z < 0) {
                    // Squash to the limb
                    const d = Math.sqrt(sx * sx + sy * sy);
                    if (d > 0) {
                        sx = sx * radius / d;
                        sy = sy * radius / d;
                    }
                }
                if (idx === 0) {
                    ctx.moveTo(cx + sx, cy + sy);
                } else {
                    ctx.lineTo(cx + sx, cy + sy);
                }
            });
            ctx.closePath();
            ctx.fillStyle = 'rgba(6, 182, 212, 0.08)'; // subtle teal solid-like land fill
            ctx.fill();
            ctx.restore();

            // Draw the border outlines using continuous paths and neon double-pass strokes
            ctx.save();
            ctx.beginPath();
            let drawing = false;
            
            for (let i = 0; i <= projected.length; i++) {
                const rot1 = projected[i % projected.length];
                const rot2 = projected[(i + 1) % projected.length];
                
                if (rot1.z >= 0 && rot2.z >= 0) {
                    if (!drawing) {
                        ctx.moveTo(cx + rot1.x, cy + rot1.y);
                        drawing = true;
                    }
                    ctx.lineTo(cx + rot2.x, cy + rot2.y);
                } else if (rot1.z >= 0 && rot2.z < 0) {
                    const t = rot1.z / (rot1.z - rot2.z);
                    let cx_val = rot1.x + t * (rot2.x - rot1.x);
                    let cy_val = rot1.y + t * (rot2.y - rot1.y);
                    const d = Math.sqrt(cx_val * cx_val + cy_val * cy_val);
                    if (d > 0) {
                        cx_val = cx_val * radius / d;
                        cy_val = cy_val * radius / d;
                    }
                    if (!drawing) {
                        ctx.moveTo(cx + rot1.x, cy + rot1.y);
                        drawing = true;
                    }
                    ctx.lineTo(cx + cx_val, cy + cy_val);
                    drawing = false;
                } else if (rot1.z < 0 && rot2.z >= 0) {
                    const t = rot1.z / (rot1.z - rot2.z);
                    let cx_val = rot1.x + t * (rot2.x - rot1.x);
                    let cy_val = rot1.y + t * (rot2.y - rot1.y);
                    const d = Math.sqrt(cx_val * cx_val + cy_val * cy_val);
                    if (d > 0) {
                        cx_val = cx_val * radius / d;
                        cy_val = cy_val * radius / d;
                    }
                    ctx.moveTo(cx + cx_val, cy + cy_val);
                    ctx.lineTo(cx + rot2.x, cy + rot2.y);
                    drawing = true;
                } else {
                    drawing = false;
                }
            }
            
            // Neon Glow Pass
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
            ctx.lineWidth = 3.2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.stroke();

            // Crisp Core Pass
            ctx.strokeStyle = 'rgba(191, 246, 255, 0.85)';
            ctx.lineWidth = 1.1;
            ctx.stroke();
            ctx.restore();
        });

        // 6. Dynamic Node State Updates and Continuous Signaling
        // Alternate active brand every 4.5 seconds
        if (time - lastBrandSwitchTime > 4500) {
            currentBrandIndex = (currentBrandIndex + 1) % brands.length;
            lastBrandSwitchTime = time;
        }

        nodes.forEach((node, idx) => {
            if (idx === 0) {
                // Pulse brand badge glow
                nodes[0].glowIntensity = 0.6 + 0.4 * Math.sin(time * 0.004);
                return;
            }

            if (node.fadeState === 'in') {
                node.opacity += 0.012;
                if (node.opacity >= 1.0) {
                    node.opacity = 1.0;
                    node.fadeState = 'active';
                    node.connected = true;
                    node.lifetime = 180 + Math.random() * 240; // 3 to 7 seconds active lifespan
                    
                    // Trigger a comet immediately along the parent link when it becomes fully active!
                    if (node.parentId !== undefined) {
                        const isEndpoint = node.type !== 'tower' && node.type !== 'web';
                        const color = isEndpoint ? 'rgba(249, 115, 22, 1.0)' : 'rgba(6, 182, 212, 1.0)';
                        const speed = 0.012 + Math.random() * 0.008;
                        triggerComet(node.parentId, idx, speed, color);
                    }
                }
            } else if (node.fadeState === 'active') {
                node.lifetime -= 1;
                if (node.lifetime <= 0) {
                    node.fadeState = 'out';
                }

                // Stochastically trigger random endpoint success checkmarks
                if (node.type !== 'tower' && node.type !== 'web' && Math.random() < 0.0015) {
                    node.success = true;
                    node.glowIntensity = 1.0;
                    setTimeout(() => {
                        node.success = false;
                    }, 1200);
                }
            } else if (node.fadeState === 'out') {
                node.opacity -= 0.012;
                if (node.opacity <= 0.0) {
                    node.opacity = 0.0;
                    node.fadeState = 'in';
                    node.success = false;
                    node.connected = false;
                    
                    // Teleport to a new random location on the globe
                    node.lat = -55 + Math.random() * 110;
                    node.lon = -180 + Math.random() * 360;
                    
                    // Select a new parent dynamically
                    assignParent(idx);
                }
            }
        });

        // Trigger success when comets reach endpoints
        comets.forEach(comet => {
            if (comet.progress >= 0.98) {
                const targetNode = nodes[comet.targetIndex];
                if (targetNode && targetNode.type !== 'tower' && targetNode.type !== 'web') {
                    targetNode.success = true;
                    targetNode.glowIntensity = 1.0;
                    setTimeout(() => {
                        targetNode.success = false;
                    }, 1200);
                }
            }
        });

        // Continuous random comet emissions between active parents and child nodes
        if (Math.random() < 0.045 && comets.length < 12) {
            const activeNodesWithParents = nodes
                .map((n, idx) => ({ n, idx }))
                .filter(({ n, idx }) => idx > 0 && n.fadeState === 'active' && n.parentId !== undefined && nodes[n.parentId].fadeState === 'active');
            
            if (activeNodesWithParents.length > 0) {
                const target = activeNodesWithParents[Math.floor(Math.random() * activeNodesWithParents.length)];
                const from = target.n.parentId!;
                const to = target.idx;
                
                const alreadyFlying = comets.some(c => c.sourceIndex === from && c.targetIndex === to);
                if (!alreadyFlying) {
                    const isEndpoint = target.n.type !== 'tower' && target.n.type !== 'web';
                    const color = isEndpoint ? 'rgba(249, 115, 22, 1.0)' : 'rgba(6, 182, 212, 1.0)';
                    const speed = 0.01 + Math.random() * 0.008;
                    triggerComet(from, to, speed, color);
                }
            }
        }

        // 7. Draw Connection Arcs under comets & nodes
        nodes.forEach((node, idx) => {
            if (idx > 0 && node.parentId !== undefined) {
                const parent = nodes[node.parentId];
                const lineOpacity = Math.min(parent.opacity, node.opacity) * 0.18;
                if (lineOpacity > 0) {
                    const isEndpoint = node.type !== 'tower' && node.type !== 'web';
                    const color = isEndpoint ? `rgba(249, 115, 22, ${lineOpacity})` : `rgba(6, 182, 212, ${lineOpacity})`;
                    drawConnectionPath(node.parentId, idx, color, 1.2, cx, cy, radius);
                }
            }
        });

        // 8. Update & Draw Comets
        for (let i = comets.length - 1; i >= 0; i--) {
            const comet = comets[i];
            comet.progress += comet.speed;

            if (comet.progress >= 1.0) {
                comets.splice(i, 1);
                continue;
            }

            const fromNode = nodes[comet.sourceIndex];
            const toNode = nodes[comet.targetIndex];
            const pA = getLatLng3D(fromNode.lat, fromNode.lon, radius);
            const pB = getLatLng3D(toNode.lat, toNode.lon, radius);
            const pMid = getBezierControlPoint(pA, pB, radius);

            // Tapered trailing line
            const tailLength = 0.18;
            const steps = 6;
            for (let step = 0; step < steps; step++) {
                const segStart = Math.max(0, comet.progress - (step + 1) * (tailLength / steps));
                const segEnd = Math.max(0, comet.progress - step * (tailLength / steps));
                if (segEnd === 0) break;

                const stepFade = 1.0 - (step / steps);
                const trailColor = comet.color.replace("1.0", (0.5 * stepFade).toFixed(2));
                drawArcSection(pA, pMid, pB, segStart, segEnd, trailColor, 2.2 * stepFade, cx, cy, radius);
            }

            // Head particle
            const t = comet.progress;
            const headX = (1 - t) * (1 - t) * pA.x + 2 * (1 - t) * t * pMid.x + t * t * pB.x;
            const headY = (1 - t) * (1 - t) * pA.y + 2 * (1 - t) * t * pMid.y + t * t * pB.y;
            const headZ = (1 - t) * (1 - t) * pA.z + 2 * (1 - t) * t * pMid.z + t * t * pB.z;

            const rotatedHead = rotateGlobe({ x: headX, y: headY, z: headZ }, angle, tilt);
            if (rotatedHead.z > 0) {
                const sx = cx + rotatedHead.x;
                const sy = cy + rotatedHead.y;

                // Comet core and aura
                ctx.fillStyle = comet.color.replace("1.0", "0.22");
                ctx.beginPath();
                ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 9. Draw Nodes and Labels
        nodes.forEach((node) => {
            const rawPos = getLatLng3D(node.lat, node.lon, radius);
            const rotated = rotateGlobe(rawPos, angle, tilt);

            // Backface culled
            if (rotated.z <= 0) return;

            const sx = cx + rotated.x;
            const sy = cy + rotated.y;

            // Edge transparency fading
            const depthFade = Math.max(0, Math.min(1, (rotated.z / radius) + 0.15)) * node.opacity;
            if (depthFade <= 0) return;

            // Node sizing based on depth
            const scaleSize = (node.type === 'brand' ? 32 : 23) * (0.6 + 0.4 * depthFade);

            ctx.save();
            ctx.globalAlpha = depthFade;

            // Draw Node active glow
            let finalGlow = node.glowIntensity;
            if (node.connected) {
                // Pulse glow when connected
                finalGlow = Math.max(finalGlow, 0.45 + 0.25 * Math.sin(time * 0.005));
            }
            if (finalGlow > 0 && node.type !== 'flurbix') {
                const glowColor = getGlowColor(node.type, activeBrand);
                drawGlow(sx, sy, scaleSize * 1.6, glowColor, finalGlow);
                if (node.glowIntensity > 0) {
                    node.glowIntensity -= 0.015; // decay
                }
            }

            // Draw specific node icons
            if (node.type === 'brand') {
                drawBrandBadge(activeBrand, sx, sy, scaleSize, depthFade);
            } else if (node.type === 'tower') {
                drawTowerIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'web') {
                drawWebIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'laptop') {
                drawLaptopIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'email') {
                drawEmailIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'mobile') {
                drawMobileIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'apple') {
                drawAppleIcon(sx, sy, scaleSize, depthFade);
            } else if (node.type === 'android') {
                drawAndroidIcon(sx, sy, scaleSize, depthFade);
            }

            // Draw success checkmarks
            if (node.success) {
                drawBadgeSuccess(sx, sy, scaleSize, depthFade);
            }

            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    // Set resize observer
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    resize();
    requestAnimationFrame(animate);
}
