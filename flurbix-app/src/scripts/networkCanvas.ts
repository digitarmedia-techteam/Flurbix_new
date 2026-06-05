export function initNetworkCanvas() {
    const canvas = document.getElementById('network') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    // Configuration
    const DOT_SPACING = 48;
    const DOT_RADIUS = 1.5;
    const DOT_COLOR = 'rgba(255, 255, 255, 0.12)';
    
    // Grid settings
    let cols = 5;
    let rows = 3;

    // Icons
    type IconType = 'phone' | 'email' | 'globe' | 'apple' | 'network' | 'laptop' | 'android' | 'zomato' | 'uber' | 'zepto';
    const allIconTypes: IconType[] = ['phone', 'email', 'globe', 'apple', 'network', 'laptop', 'android', 'zomato', 'uber', 'zepto'];
    const brandIcons: IconType[] = ['zomato', 'uber', 'zepto'];

    interface GridCell {
        c: number;
        r: number;
        x: number;
        y: number;
        iconType: IconType | null;
        jitterX: number;
        jitterY: number;
        isBrand: boolean;
        
        // Anim state
        opacity: number;
        glowIntensity: number;
        glowColor: string;
        showBadge: boolean;
        badgeOpacity: number;
    }

    let cells: GridCell[] = [];
    let currentBrandIndex = 0;
    let lastBrandSwitchTime = 0;
    const BRAND_SWITCH_INTERVAL = 4000;

    interface Comet {
        source: GridCell;
        target: GridCell;
        progress: number; // 0 to 1
        speed: number;
        cpX: number; // control point X
        cpY: number;
        trail: {x: number, y: number, alpha: number}[];
    }
    let comets: Comet[] = [];
    let lastCometSpawn = 0;

    interface Connection {
        source: GridCell;
        target: GridCell;
        alpha: number; // 1 to 0
        cpX: number;
        cpY: number;
    }
    let connections: Connection[] = [];

    function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        width = rect.width;
        height = rect.height;

        // update grid size
        if (width < 768) {
            cols = 3;
            rows = 2;
        } else {
            cols = 5;
            rows = 3;
        }

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        initGrid();
    }

    function initGrid() {
        cells = [];
        const cellW = width / cols;
        const cellH = height / rows;

        let availableCells: {c: number, r: number}[] = [];
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                availableCells.push({c, r});
            }
        }

        // Shuffle
        availableCells.sort(() => Math.random() - 0.5);

        allIconTypes.forEach((icon, i) => {
            if (i >= availableCells.length) return; // if mobile, some might not fit, but 6 cells < 10 icons. 
            // We'll just take the first 6 icons if mobile, making sure brands are included
        });

        // Ensure brands are always there
        let selectedIcons = [...allIconTypes];
        if (availableCells.length < selectedIcons.length) {
            // prioritize brands
            selectedIcons = selectedIcons.filter(ic => brandIcons.includes(ic));
            const others = allIconTypes.filter(ic => !brandIcons.includes(ic));
            others.sort(() => Math.random() - 0.5);
            selectedIcons.push(...others.slice(0, availableCells.length - selectedIcons.length));
        }

        selectedIcons.forEach((icon, i) => {
            const loc = availableCells[i];
            const jitterPadX = cellW * 0.18;
            const jitterPadY = cellH * 0.18;
            
            cells.push({
                c: loc.c,
                r: loc.r,
                x: loc.c * cellW + cellW / 2,
                y: loc.r * cellH + cellH / 2,
                iconType: icon,
                jitterX: (Math.random() * 2 - 1) * jitterPadX,
                jitterY: (Math.random() * 2 - 1) * jitterPadY,
                isBrand: brandIcons.includes(icon),
                opacity: brandIcons.includes(icon) ? 0 : 1, // brands are 0 initially
                glowIntensity: 0,
                glowColor: 'rgba(255,255,255,0)',
                showBadge: false,
                badgeOpacity: 0
            });
        });

        // Set initial brand
        const brands = cells.filter(c => c.isBrand);
        if(brands.length > 0) {
            brands[0].opacity = 1;
            currentBrandIndex = 0;
        }
    }

    function drawDotGrid() {
        ctx.fillStyle = DOT_COLOR;
        for (let x = (width / 2) % DOT_SPACING; x < width; x += DOT_SPACING) {
            for (let y = (height / 2) % DOT_SPACING; y < height; y += DOT_SPACING) {
                ctx.beginPath();
                ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawIconPath(iconType: string, cx: number, cy: number, size: number) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(size/24, size/24); // scale assuming 24x24 base
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (iconType === 'phone') {
            ctx.rect(-6, -10, 12, 20);
            ctx.moveTo(-2, 7); ctx.lineTo(2, 7);
        } else if (iconType === 'email') {
            ctx.rect(-10, -7, 20, 14);
            ctx.moveTo(-10, -7); ctx.lineTo(0, 2); ctx.lineTo(10, -7);
        } else if (iconType === 'globe') {
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.moveTo(0, -9); ctx.quadraticCurveTo(5, 0, 0, 9);
            ctx.moveTo(0, -9); ctx.quadraticCurveTo(-5, 0, 0, 9);
            ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
        } else if (iconType === 'apple') {
            const apple = new Path2D("M-1,-5 C-3,-5 -5,-4 -6,-2 C-9,3 -7,9 -4,10 C-2,10.5 -1,9.5 0,9.5 C1,9.5 2,10.5 4,10 C7,9 9,3 9,3 C9,3 6,2 6,-1 C6,-4 9,-5 9,-5 C7,-7 4,-7 2,-6 C1,-5.5 0,-5.5 -1,-5 Z M1,-6 C1,-8 3,-10 5,-10 C5,-8 3,-6 1,-6 Z");
            ctx.stroke(apple);
        } else if (iconType === 'network') {
            ctx.arc(0, -5, 3, 0, Math.PI*2);
            ctx.moveTo(-6, 5); ctx.arc(-6, 5, 3, 0, Math.PI*2);
            ctx.moveTo(6, 5); ctx.arc(6, 5, 3, 0, Math.PI*2);
            ctx.moveTo(0,-2); ctx.lineTo(-4,3);
            ctx.moveTo(0,-2); ctx.lineTo(4,3);
        } else if (iconType === 'laptop') {
            ctx.rect(-10, -7, 20, 12);
            ctx.moveTo(-13, 5); ctx.lineTo(13, 5);
        } else if (iconType === 'android') {
            ctx.arc(0, -2, 6, Math.PI, 0);
            ctx.rect(-6, -2, 12, 8);
            ctx.moveTo(-4, -6); ctx.lineTo(-6, -9);
            ctx.moveTo(4, -6); ctx.lineTo(6, -9);
        }
        ctx.stroke();
        ctx.restore();
    }

    function drawBrandIcon(cell: GridCell, cx: number, cy: number, size: number) {
        ctx.save();
        ctx.translate(cx, cy);
        
        const w = size * 2.5;
        const h = size;
        
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, 6);
        
        if (cell.iconType === 'zomato') {
            ctx.fillStyle = 'rgba(226, 55, 68, 0.95)';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'italic bold 14px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('zomato', 0, 1);
        } else if (cell.iconType === 'uber') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Uber', 0, 1);
        } else if (cell.iconType === 'zepto') {
            ctx.fillStyle = 'rgba(62, 10, 114, 0.95)';
            ctx.fill();
            // simple gradient text
            const grad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(1, '#d8b4fe');
            ctx.fillStyle = grad;
            ctx.font = 'bold 15px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('zepto', 0, 1);
        }
        
        ctx.restore();
    }

    function drawBadge(cx: number, cy: number, size: number, opacity: number) {
        ctx.save();
        ctx.translate(cx + size/1.5, cy - size/1.5); // top right
        ctx.globalAlpha = opacity;
        
        // glowing backing
        const grad = ctx.createRadialGradient(0,0, 0, 0,0, 12);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0,0, 12, 0, Math.PI*2);
        ctx.fill();

        // green circle
        ctx.fillStyle = 'rgba(34, 197, 94, 1)';
        ctx.beginPath();
        ctx.arc(0,0, 7, 0, Math.PI*2);
        ctx.fill();

        // tick
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(-2.5, 0);
        ctx.lineTo(-0.5, 2.5);
        ctx.lineTo(3.5, -2.5);
        ctx.stroke();

        ctx.restore();
    }

    function drawGlow(cx: number, cy: number, radius: number, color: string, intensity: number) {
        if (intensity <= 0) return;
        ctx.save();
        ctx.translate(cx, cy);
        
        // Parse color logic. e.g. 'rgba(255,255,255, ' -> add alpha
        // Wait, the prompt says glow color matching brand type
        const grad = ctx.createRadialGradient(0,0,0, 0,0, radius);
        
        // Replace last part of rgba string with intensity
        const baseColor = color.substring(0, color.lastIndexOf(','));
        grad.addColorStop(0, `${baseColor}, ${intensity * 0.4})`);
        grad.addColorStop(0.5, `${baseColor}, ${intensity * 0.1})`);
        grad.addColorStop(1, `${baseColor}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0,0, radius, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
    }

    function spawnComet() {
        const activeBrands = cells.filter(c => c.isBrand && c.opacity > 0.5);
        const standards = cells.filter(c => !c.isBrand);
        
        if (activeBrands.length === 0 || standards.length === 0) return;
        
        let source, target;
        if (Math.random() > 0.5) {
            source = activeBrands[0];
            target = standards[Math.floor(Math.random() * standards.length)];
        } else {
            source = standards[Math.floor(Math.random() * standards.length)];
            target = activeBrands[0];
        }

        const cpX = (source.x + target.x) / 2 + (Math.random() - 0.5) * 150;
        const cpY = (source.y + target.y) / 2 + (Math.random() - 0.5) * 150;

        comets.push({
            source,
            target,
            progress: 0,
            speed: 0.01 + Math.random() * 0.01, // travel speed
            cpX,
            cpY,
            trail: []
        });
    }

    function getBrandColor(type: IconType): string {
        if (type === 'zomato') return 'rgba(226, 55, 68, 1)';
        if (type === 'zepto') return 'rgba(147, 51, 234, 1)';
        if (type === 'uber') return 'rgba(255, 255, 255, 1)';
        return 'rgba(34, 197, 94, 1)'; // fallback green
    }

    function getBezierXY(t: number, sx: number, sy: number, cpX: number, cpY: number, tx: number, ty: number) {
        return {
            x: (1-t)*(1-t)*sx + 2*(1-t)*t*cpX + t*t*tx,
            y: (1-t)*(1-t)*sy + 2*(1-t)*t*cpY + t*t*ty
        };
    }

    function animate(time: number) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        drawDotGrid();

        // Manage brands sequence
        if (time - lastBrandSwitchTime > BRAND_SWITCH_INTERVAL) {
            lastBrandSwitchTime = time;
            const brands = cells.filter(c => c.isBrand);
            if (brands.length > 0) {
                currentBrandIndex = (currentBrandIndex + 1) % brands.length;
            }
        }

        // Update brand opacities
        const brands = cells.filter(c => c.isBrand);
        brands.forEach((c, i) => {
            const targetOpacity = (i === currentBrandIndex) ? 1 : 0;
            c.opacity += (targetOpacity - c.opacity) * 0.05;
        });

        // Comets spawn logic
        if (time - lastCometSpawn > 800) {
            if (Math.random() > 0.3) {
                spawnComet();
            }
            lastCometSpawn = time;
        }

        // Draw connections
        for (let i = connections.length - 1; i >= 0; i--) {
            const conn = connections[i];
            conn.alpha -= 0.01; // fade out over ~1.6s at 60fps
            if (conn.alpha <= 0) {
                connections.splice(i, 1);
                continue;
            }

            const sx = conn.source.x + conn.source.jitterX;
            const sy = conn.source.y + conn.source.jitterY;
            const tx = conn.target.x + conn.target.jitterX;
            const ty = conn.target.y + conn.target.jitterY;

            ctx.save();
            ctx.lineCap = 'round';
            // pass 1
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(conn.cpX, conn.cpY, tx, ty);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * conn.alpha})`;
            ctx.lineWidth = 7;
            ctx.stroke();
            
            // pass 2
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(conn.cpX, conn.cpY, tx, ty);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * conn.alpha})`;
            ctx.lineWidth = 3.5;
            ctx.stroke();
            
            // pass 3
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.quadraticCurveTo(conn.cpX, conn.cpY, tx, ty);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * conn.alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }

        // Update & Draw Comets
        for (let i = comets.length - 1; i >= 0; i--) {
            const c = comets[i];
            c.progress += c.speed;
            
            const sx = c.source.x + c.source.jitterX;
            const sy = c.source.y + c.source.jitterY;
            const tx = c.target.x + c.target.jitterX;
            const ty = c.target.y + c.target.jitterY;
            
            const pos = getBezierXY(c.progress, sx, sy, c.cpX, c.cpY, tx, ty);

            c.trail.unshift({x: pos.x, y: pos.y, alpha: 1});
            if (c.trail.length > 20) c.trail.pop();

            // Draw tail
            if (c.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(c.trail[0].x, c.trail[0].y);
                for(let j=1; j<c.trail.length; j++) {
                    ctx.lineTo(c.trail[j].x, c.trail[j].y);
                }
                const grad = ctx.createLinearGradient(c.trail[0].x, c.trail[0].y, c.trail[c.trail.length-1].x, c.trail[c.trail.length-1].y);
                grad.addColorStop(0, 'rgba(255,255,255,0.6)');
                grad.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Draw head
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.arc(pos.x, pos.y, 8.5, 0, Math.PI*2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI*2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.arc(pos.x, pos.y, 2.6, 0, Math.PI*2);
            ctx.fill();

            if (c.progress >= 1) {
                // Impact!
                c.source.glowIntensity = 1.5;
                c.source.glowColor = getBrandColor(c.source.iconType as IconType);
                c.target.glowIntensity = 1.5;
                c.target.glowColor = getBrandColor(c.target.iconType as IconType);

                c.target.showBadge = true;
                c.target.badgeOpacity = 1;

                connections.push({
                    source: c.source,
                    target: c.target,
                    alpha: 1,
                    cpX: c.cpX,
                    cpY: c.cpY
                });

                comets.splice(i, 1);
            }
        }


        // Draw icons
        cells.forEach(cell => {
            const cx = cell.x + cell.jitterX;
            const cy = cell.y + cell.jitterY;
            const isStandard = !cell.isBrand;

            // Breathing for standard icons
            if (isStandard) {
                const wave = (Math.sin(time * 0.002 + cell.x * 0.01) + 1) / 2; // 0 to 1
                cell.opacity = 0.4 + wave * 0.6; // 0.4 to 1.0
            }

            // Update glow decay
            if (cell.glowIntensity > 0) {
                cell.glowIntensity -= 0.02;
            }

            // Update badge decay
            if (cell.showBadge) {
                cell.badgeOpacity -= 0.005; // stays for a while then fades
                if (cell.badgeOpacity <= 0) {
                    cell.showBadge = false;
                }
            }

            if (cell.opacity <= 0.01) return;

            // Draw Glow
            if (cell.glowIntensity > 0) {
                const radius = (cell.isBrand ? 34 : 25) * 1.8;
                drawGlow(cx, cy, radius, cell.glowColor, cell.glowIntensity);
            }

            ctx.globalAlpha = cell.opacity;
            if (cell.isBrand) {
                drawBrandIcon(cell, cx, cy, 34);
            } else {
                drawIconPath(cell.iconType as string, cx, cy, 25);
            }

            if (cell.showBadge && cell.badgeOpacity > 0) {
                drawBadge(cx, cy, cell.isBrand ? 34 : 25, cell.badgeOpacity);
            }

            ctx.globalAlpha = 1;
        });

        requestAnimationFrame(animate);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    resize();
    requestAnimationFrame(animate);
}
