declare const ScrollSmoother: any;
declare const ScrollTrigger: any;
declare const Lenis: any;
declare let startPoints: any;
declare const gsap: any;
declare const SplitText: any;
declare const Splide: any;
declare const window: any;
declare const document: any;

(function (w, i, g) {
    w[g] = w[g] || [];
    if (typeof w[g].push == "function") w[g].push.apply(w[g], Array.isArray(i) ? i : [i]);
})(window, ["G-3NB4DQHMQZ"], "google_tags_first_party");

import { initNetworkCanvas } from "./networkCanvas";
initNetworkCanvas();

const canvas = document.getElementById("gridCanvas");
if (canvas) {
    const ctx = canvas.getContext("2d");
    const footer = document.getElementById("data-cta");

    // --- Config ---
    const DOT_SPACING = 42;
    const DOT_RADIUS = 3;
    const DOT_COLOR = "rgba(255, 255, 255, 0.18)";
    const DOT_HOVER_COLOR = "rgba(255, 255, 255, 0.55)";
    const LINE_COLOR_START = "rgba(255, 255, 255, 0.95)";
    const LINE_COLOR_END = "rgba(255, 255, 255, 0)";
    const MAX_TRAIL_LENGTH = 14;
    const SNAP_RADIUS = 80;
    const MIN_DISTANCE_BETWEEN_POINTS = 24;
    const LINE_WIDTH = 2.5;

    let dpr = window.devicePixelRatio || 1;
    let dots = [];
    let trail = []; // Array of {x, y} snapped dot positions
    let mousePos = { x: -1000, y: -1000 };
    let isInFooter = false;
    let animId;
    let lastMoveTime = Date.now();
    const IDLE_TIMEOUT = 0; // start fading immediately
    const TOTAL_FADE_TIME = 800; // fully gone in 800ms

    function resize() {
        const rect = footer.getBoundingClientRect();
        dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildDots(rect.width, rect.height);
    }

    function buildDots(w, h) {
        dots = [];
        const offsetX = (w % DOT_SPACING) / 2;
        const offsetY = (h % DOT_SPACING) / 2;
        for (let x = offsetX; x <= w; x += DOT_SPACING) {
            for (let y = offsetY; y <= h; y += DOT_SPACING) {
                dots.push({ x, y });
            }
        }
    }

    function getClosestDot(px, py) {
        let closest = null;
        let minDist = Infinity;
        for (const dot of dots) {
            const d = Math.hypot(dot.x - px, dot.y - py);
            if (d < minDist && d < SNAP_RADIUS) {
                minDist = d;
                closest = dot;
            }
        }
        return closest;
    }

    function addToTrail(dot) {
        if (!dot) return;
        const last = trail[trail.length - 1];
        if (last && last.x === dot.x && last.y === dot.y) return;
        if (last && Math.hypot(last.x - dot.x, last.y - dot.y) < MIN_DISTANCE_BETWEEN_POINTS) return;

        trail.push({ x: dot.x, y: dot.y });

        if (trail.length > MAX_TRAIL_LENGTH) {
            trail.shift();
        }
    }

    function draw() {
        const rect = footer.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);

        const timeSinceMove = Date.now() - lastMoveTime;
        let trailOpacity = 1;
        if (timeSinceMove > IDLE_TIMEOUT) {
            const fadeElapsed = timeSinceMove - IDLE_TIMEOUT;
            const fadeDuration = TOTAL_FADE_TIME - IDLE_TIMEOUT;
            trailOpacity = Math.max(0, 1 - fadeElapsed / fadeDuration);
        }

        if (trailOpacity <= 0 && trail.length > 0) {
            trail = [];
        }

        // Draw dots
        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = DOT_COLOR;
            ctx.fill();
        }

        // Draw trail line
        if (trail.length >= 2 && trailOpacity > 0) {
            for (let i = 1; i < trail.length; i++) {
                const t = i / (trail.length - 1);
                const alpha = Math.pow(t, 1.5) * 0.9 * trailOpacity;
                const width = LINE_WIDTH * (0.3 + t * 0.7);

                ctx.beginPath();
                ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
                ctx.lineTo(trail[i].x, trail[i].y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = width;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.stroke();
            }

            // Draw dots on trail nodes
            for (let i = 0; i < trail.length; i++) {
                const t = i / (trail.length - 1);
                const alpha = Math.pow(t, 1.5) * 0.85 * trailOpacity;
                const r = 3 + t * 2.5;

                ctx.beginPath();
                ctx.arc(trail[i].x, trail[i].y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
        }

        animId = requestAnimationFrame(draw);
    }

    // --- Events ---
    footer.addEventListener("mousemove", (e) => {
        const rect = footer.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        lastMoveTime = Date.now();

        const closest = getClosestDot(mousePos.x, mousePos.y);
        addToTrail(closest);
    });

    footer.addEventListener("mouseenter", () => {
        isInFooter = true;
    });

    footer.addEventListener("mouseleave", () => {
        isInFooter = false;
        mousePos.x = -1000;
        mousePos.y = -1000;
    });

    window.addEventListener("resize", resize);

    resize();
    draw();
}

if (document.querySelector(".footer_logo-text")) {
    const footerLogoSplit = new SplitText(".footer_logo-text", { type: "chars" });
    gsap
        .timeline({
            scrollTrigger: {
                trigger: ".footer_logo-wrap",
                start: "top 90%",
                toggleActions: "play none none reverse",
            },
        })
        .from(footerLogoSplit.chars, {
            yPercent: -120,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "power4.out",
        });
}

const footerLinks = gsap.utils.toArray(".footer_link");

footerLinks.forEach((link) => {
    const circ = link.querySelector(".footer_circ");
    const text = link.querySelector(".footer_text");

    gsap.set(circ, { scale: 0, transformOrigin: "center center" });

    let tl = gsap
        .timeline({ paused: true })
        .to(
            circ,
            {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
            },
            0,
        )
        .to(
            text,
            {
                x: "1rem",
                duration: 0.3,
                ease: "power2.out",
            },
            0,
        );

    link.addEventListener("mouseenter", () => {
        tl.kill();
        tl = gsap
            .timeline()
            .to(
                circ,
                {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out",
                },
                0,
            )
            .to(
                text,
                {
                    x: "1rem",
                    duration: 0.3,
                    ease: "power2.out",
                },
                0,
            );
    });

    link.addEventListener("mouseleave", () => {
        tl.kill();
        tl = gsap
            .timeline()
            .to(
                circ,
                {
                    scale: 0,
                    duration: 0.3,
                    ease: "power2.out",
                },
                0,
            )
            .to(
                text,
                {
                    x: 0,
                    duration: 0.3,
                    ease: "power2.out",
                },
                0,
            );
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const heroMain = document.querySelector(".hero_main");
    if (heroMain) {
        const isMobile = window.innerWidth <= 991;

        if (isMobile) {
            gsap.utils.toArray(".hero_steps-content").forEach((parent) => {
                const children = parent.children;

                Array.from(children)
                    .slice(1)
                    .forEach((el) => {
                        gsap.set(el, {
                            position: "absolute",
                            top: 0,
                            left: 0,
                        });
                    });
            });
            const h1 = new SplitText(".heading-style-h1", {
                types: "lines",
                mask: "lines",
                linesClass: "h1-lines",
            });
            const p1 = new SplitText(".hero_p", {
                types: "lines",
                mask: "lines",
            });

            gsap.set(".h1-lines-mask", {
                paddingBottom: 10,
                marginBottom: -10,
            });
            gsap.set(".page-wrapper", { opacity: 1 });
            gsap.set(".hero_m-line", { width: "0%" });
            gsap.set(".hero_tag-text-wrap", { width: 0 });
            gsap.set("#hero-m-blue", { drawSVG: 0 });

            const heroMobile = document.querySelector(".hero_mobile");
            const heroSteps = document.querySelectorAll(".hero_m-card-wrap");
            const prompt = document.querySelectorAll(".hero_m-prompt");
            const step1 = heroMobile.querySelector("[step1-wrap]");
            const step2 = heroMobile.querySelector("[step2-wrap]");
            const step3 = heroMobile.querySelector("[step3-wrap]");
            const tags = gsap.utils.toArray(".hero_mobile .hero_tag");
            const tagTexts = gsap.utils.toArray(".hero_mobile .hero_tag-text");

            const CARD_DELAY = 1;
            const PHASE_DELAY = 3;

            gsap.set("[data-step1], [data-step2], [data-step3]", {
                autoAlpha: 0,
            });

            gsap
                .timeline({ onStart: sequence })
                .from(".hero_mobile > *", {
                    y: 32,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power4.out",
                })
                .from(
                    ".navbar1_container",
                    {
                        yPercent: -100,
                        opacity: 0,
                        duration: 1.5,
                        ease: "power4.out",
                    },
                    0.3,
                )
                .from(
                    h1.lines,
                    {
                        y: 32,
                        opacity: 0,
                        rotation: 4,
                        transformOrigin: "left center",
                        duration: 1,
                        stagger: 0.15,
                        ease: "back.out",
                    },
                    0.5,
                )
                .from(
                    p1.lines,
                    {
                        yPercent: 100,
                        opacity: 0,
                        duration: 1,
                        stagger: 0.1,
                        ease: "power4.out",
                    },
                    "<0.3",
                )
                .from(
                    ".hero_main .button-group",
                    {
                        y: 32,
                        filter: "blur(10px)",
                        opacity: 0,
                        duration: 1,
                        ease: "power4.out",
                    },
                    "<0.3",
                );

            function sequence() {
                const tl = gsap.timeline({ repeat: -1 });

                const phases = [
                    { promptIn: 0, dataAttr: "data-step1", textAttr: "text1" },
                ];

                const steps = [step1, step2, step3];
                const lines = ["[m-l3]", "[m-l4]", "[m-l5]"];

                phases.forEach((phase, i) => {
                    addPhase(tl, phase);
                    addReset(tl, phase);
                });

                function addPhase(tl, { dataAttr }) {
                    tl.to("[m-l1]", {
                        width: "100%",
                        duration: 0.5,
                        ease: "power4.out",
                    })
                        .to(".hero_m-avatar", { color: "#0b4fff", duration: 0.5, ease: "power4.out" }, "<50%")
                        .to(".hero_m-prompt-text", { color: "#232323", duration: 0.5, ease: "power4.out" }, "<")
                        .to("#hero-m-blue", { drawSVG: 100, duration: 0.5, ease: "power4.out" }, "-=0.5");

                    steps.forEach((step, i) => {
                        const isFirst = i === 0;

                        if (!isFirst) {
                            tl.to(lines[i - 1], {
                                width: "100%",
                                duration: 1,
                                ease: "power4.out",
                            }).to(heroSteps, { xPercent: -100 * i, duration: 1, ease: "power4.out" }, "<");
                        }

                        tl.to(
                            tags[i],
                            {
                                backgroundColor: "#D8DADE",
                                color: "#0b4fff",
                                duration: 0.5,
                                ease: "power4.out",
                            },
                            isFirst ? "-=0.1" : "<0.5",
                        ).to(
                            tags[i].querySelector(".hero_tag-text-wrap"),
                            {
                                width: "auto",
                                duration: 1,
                                ease: "power4.out",
                            },
                            "<",
                        );

                        if (!isFirst) {
                            tl.to(
                                tags[i - 1].querySelector(".hero_tag-text-wrap"),
                                {
                                    width: 0,
                                    duration: 1,
                                    ease: "power4.out",
                                },
                                "<",
                            );
                        }

                        tl.to(
                            step.querySelector(`[${dataAttr}]`),
                            {
                                autoAlpha: 1,
                                duration: isFirst ? 0.5 : 1,
                                ease: "power4.out",
                            },
                            "<",
                        ).to({}, { duration: CARD_DELAY });
                    });

                    tl.to("[m-l5]", { width: "100%", duration: 1, ease: "power4.out" }, "<").to(
                        {},
                        { duration: PHASE_DELAY },
                    );
                }

                function addReset(tl, { dataAttr, promptIn, textAttr }) {
                    tl.to(".hero_m-line, #hero-m-blue", {
                        opacity: 0,
                        duration: 1,
                        ease: "power4.out",
                    })
                        .to(`[${dataAttr}]`, {
                            opacity: 0,
                            duration: 1,
                            ease: "power4.out",
                        })
                        .to(".hero_tag-text-wrap", { width: 0, duration: 1, ease: "power4.out" }, "<")
                        .to(
                            ".hero_m-avatar, .hero_m-prompt-text",
                            {
                                color: "#c3c2b2",
                                duration: 0.5,
                                ease: "power4.out",
                            },
                            "<",
                        )
                        .to(
                            tags,
                            {
                                backgroundColor: "#f0efe3",
                                color: "#c3c2b2",
                                duration: 0.5,
                                ease: "power4.out",
                            },
                            "<",
                        )
                        .to(heroSteps, { xPercent: 0, duration: 1, ease: "power4.out" }, "<")
                        .call(() => {
                            tagTexts.forEach((el) => (el.textContent = el.getAttribute(textAttr)));
                        })
                        .set(".hero_m-line", { width: "0%" })
                        .set("#hero-m-blue", { drawSVG: 0 })
                        .set(".hero_m-line, #hero-m-blue", { opacity: 1 });
                }
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", (event) => {
    const isMobile = window.innerWidth <= 991;

    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true,
    });

    function scrollToPricing() {
        const pricingSection = document.querySelector("#pricing");
        if (pricingSection) {
            // Adjust offset for navbar if needed (approx 80px)
            const targetOffset = smoother.offset(pricingSection, "top top");
            gsap.to(smoother, {
                scrollTop: targetOffset,
                duration: 0.6,
                ease: "power3.inOut"
            });
        }
    }

    if (window.location.hash === "#pricing") {
        setTimeout(scrollToPricing, 200);
    }

    document.querySelectorAll('a[href="/#pricing"], a[href="#pricing"], a[href="index.html#pricing"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
                e.preventDefault();
                e.stopPropagation();
                history.pushState(null, null, '#pricing');
                scrollToPricing();
            }
        });
    });
    if (!isMobile) {
        const isPotrait = window.innerWidth <= 478;
        const stepLastEls = gsap.utils.toArray("[data-step-last]");

        stepLastEls.forEach((el) => {
            const clone = el.cloneNode(true);

            clone.setAttribute("data-step4", "");

            const innerStep3 = clone.querySelector("[data-step3]");
            if (innerStep3) innerStep3.removeAttribute("data-step3");

            el.parentNode.insertBefore(clone, el.nextSibling);
        });
        const h1 = new SplitText(".heading-style-h1", {
            types: "lines",
            mask: "lines",
            linesClass: "h1-lines",
            autoSplit: true,
        });
        const p1 = new SplitText(".hero_p", {
            types: "lines",
            mask: "lines",
            autoSplit: true,
        });
        gsap.set(".h1-lines-mask", { paddingBottom: 10, marginBottom: -10 });

        gsap.set(".hero_tag", {
            scale: 0,
            opacity: 0,
        });
        const step1 = document.querySelectorAll(".hero_step1");

        const lineATl = gsap
            .timeline({ ease: "power4.out", defaults: { ease: "none" } })
            .from(".hero_lines-left", {
                xPercent: -100,
                duration: 1,
            })
            .from("#hero-lw", {
                drawSVG: 0,
                onStart: () => {
                    gsap.to(".hero_tag", {
                        scale: 1,
                        opacity: 1,
                        duration: 1,
                        delay: 0.6,
                        stagger: 0.3,
                        ease: "power4.out",
                    });
                },
                duration: 1.5,
            })
            .from(
                ".hero_lines-right",
                {
                    clipPath: "inset(0% 100% 0% 0%)",
                    duration: 1,
                },
                "-=0.3",
            );

        gsap.set("#hero-lb", { drawSVG: "0% 0%" });
        gsap.set("[hero-l1]", { xPercent: -100 });
        gsap.set("[hero-l2]", { clipPath: "inset(0% 100% 0% 0%)" });

        function createLineBTl() {
            return gsap
                .timeline({ ease: "power4.out", defaults: { ease: "none" } })
                .set("[hero-l1], [hero-l2], #hero-lb", { opacity: 1 })
                .fromTo(
                    "[hero-l1]",
                    { xPercent: -100 },
                    {
                        xPercent: 0,
                        duration: 1,
                    },
                )
                .fromTo(
                    "#hero-lb",
                    { drawSVG: "0% 0%" },
                    {
                        drawSVG: "0% 100%",
                        duration: 1.5,
                    },
                )
                .fromTo(
                    "[hero-l2]",
                    { clipPath: "inset(0% 100% 0% 0%)" },
                    {
                        clipPath: "inset(0% 0% 0% 0%)",
                        duration: 1,
                    },
                    "-=0.3",
                );
        }

        function createLineBUndraw({ textAttr = "text2" } = {}) {
            return gsap
                .timeline({ defaults: { ease: "none" } })
                .to("[hero-l1]", {
                    xPercent: 100,
                    duration: 1,
                })
                .to("#hero-lb", {
                    drawSVG: "100% 100%",
                    duration: 1.5,
                    onStart: () => {
                        gsap.to(".hero_tag-text-wrap", {
                            width: 0,
                            duration: 1,
                            delay: 0.6,
                            stagger: 0.3,
                            ease: "power4.out",
                        });
                        gsap.to(".hero_tag", {
                            color: "#c3c2b2",
                            backgroundColor: "#f0efe3",
                            borderColor: "#e2e1d3",
                            duration: 1.2,
                            delay: 0.6,
                            stagger: 0.3,
                            ease: "power4.out",
                        });
                    },
                    onComplete: () => {
                        gsap.utils.toArray(".hero_tag-text").forEach((el) => {
                            const newText = el.getAttribute(textAttr);
                            if (newText) el.textContent = newText;
                        });
                    },
                })
                .to(
                    "[hero-l2]",
                    {
                        clipPath: "inset(0% 0% 0% 100%)",
                        duration: 1,
                    },
                    "-=0.3",
                );
        }

        let offerDiscount1;
        let offerDiscount2;
        let offerDiscount3;
        const step1Wrap = document.querySelector("[step1-wrap]");

        if (step1Wrap) {
            const children = step1Wrap.children;

            if (children[0]) {
                const scope = children[0];

                const offerText = scope.querySelector("[hero-offer-text]");
                const content = scope.querySelector(".hero_step2-content");
                const icons = scope.querySelectorAll(".hero_step2-icon, .hero_step2-top");

                const split1 = new SplitText(offerText, {
                    types: "lines",
                    mask: "lines",
                    autoSplit: true,
                });

                offerDiscount1 = gsap.timeline();

                offerDiscount1
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        icons,
                        {
                            y: "1em",
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        split1.lines,
                        {
                            yPercent: 100,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    );
            }

            if (children[1]) {
                const scope = children[1];

                const offerText = scope.querySelector("[hero-offer-text]");
                const content = scope.querySelector(".hero_step2-content");
                const icons = scope.querySelectorAll(".hero_step2-icon, .hero_step2-top");

                const split2 = new SplitText(offerText, {
                    types: "lines",
                    mask: "lines",
                    autoSplit: true,
                });

                offerDiscount2 = gsap.timeline();

                offerDiscount2
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        icons,
                        {
                            y: "1em",
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        split2.lines,
                        {
                            yPercent: 100,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    );
            }

            // STEP 1 CARD 2
            if (children[2]) {
                const scope = children[2];

                const offerText = scope.querySelector("[hero-offer-text]");
                const content = scope.querySelector(".hero_step2-content");
                const icons = scope.querySelectorAll(".hero_step2-icon, .hero_step2-top");

                const split3 = new SplitText(offerText, {
                    types: "lines",
                    mask: "lines",
                    autoSplit: true,
                });

                offerDiscount3 = gsap.timeline();

                offerDiscount3
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        icons,
                        {
                            y: "1em",
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        split3.lines,
                        {
                            yPercent: 100,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    );
            }
        }

        let headlineTl1;
        let headlineTl2;
        let headlineTl3;

        const step2Wrap = document.querySelector("[step2-wrap]");

        if (step2Wrap) {
            const children = step2Wrap.children;

            if (children[0]) {
                const scope = children[0];

                const content = scope.querySelector(".hero_step3-content");
                const img = scope.querySelector(".hero_step3-img");
                const infoItems = scope.querySelectorAll(".hero_step3-content .hero_step3-info > *");

                headlineTl1 = gsap.timeline();

                headlineTl1
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        img,
                        {
                            scale: 1.2,
                            duration: 1.5,
                            ease: "power4.out",
                        },
                        "<",
                    )
                    .from(
                        infoItems,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.3",
                    );
            }

            if (children[1]) {
                const scope = children[1];

                const content = scope.querySelector(".hero_step3-content");
                const img = scope.querySelector(".hero_step3-img");
                const infoItems = scope.querySelectorAll(".hero_step3-content .hero_step3-info > *");

                headlineTl2 = gsap.timeline();

                headlineTl2
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        img,
                        {
                            scale: 1.2,
                            duration: 1.5,
                            ease: "power4.out",
                        },
                        "<",
                    )
                    .from(
                        infoItems,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.3",
                    );
            }

            if (children[2]) {
                const scope = children[2];

                const content = scope.querySelector(".hero_step3-content");
                const img = scope.querySelector(".hero_step3-img");
                const infoItems = scope.querySelectorAll(".hero_step3-content .hero_step3-info > *");

                headlineTl3 = gsap.timeline();

                headlineTl3
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        img,
                        {
                            scale: 1.2,
                            duration: 1.5,
                            ease: "power4.out",
                        },
                        "<",
                    )
                    .from(
                        infoItems,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.3",
                    );
            }
        }

        let conversionTl1;
        let conversionTl2;
        let conversionTl3;

        const step3Wrap = document.querySelector("[step3-wrap]");

        if (step3Wrap) {
            const children = step3Wrap.children;

            // CARD 1
            if (children[0]) {
                const scope = children[0];

                const content = scope.querySelector(".hero_step4-content");
                const heading = scope.querySelector(".hero_step4-content .hero_steps-h");
                const items = scope.querySelectorAll(".hero_step4-item");
                const btn = scope.querySelectorAll(".hero_steps-btn.is-dark");

                conversionTl1 = gsap.timeline();

                conversionTl1
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        heading,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        items,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    )
                    .from(
                        btn,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    );
            }

            // CARD 2
            if (children[1]) {
                const scope = children[1];

                const content = scope.querySelector(".hero_step4-content");
                const heading = scope.querySelector(".hero_step4-content .hero_steps-h");
                const items = scope.querySelectorAll(".hero_step4-item");
                const btn = scope.querySelectorAll(".hero_steps-btn.is-dark");

                conversionTl2 = gsap.timeline();

                conversionTl2
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        heading,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        items,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    )
                    .from(
                        btn,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    );
            }

            // CARD 3
            if (children[2]) {
                const scope = children[2];

                const content = scope.querySelector(".hero_step4-content");
                const heading = scope.querySelector(".hero_step4-content .hero_steps-h");
                const items = scope.querySelectorAll(".hero_step4-item");
                const btn = scope.querySelectorAll(".hero_steps-btn.is-dark");

                conversionTl3 = gsap.timeline();

                conversionTl3
                    .from(content, {
                        autoAlpha: 0,
                        filter: "blur(10px)",
                        duration: 1.5,
                        ease: "power4.out",
                    })
                    .from(
                        heading,
                        {
                            y: 10,
                            opacity: 0,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.2",
                    )
                    .from(
                        items,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            stagger: 0.1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    )
                    .from(
                        btn,
                        {
                            opacity: 0,
                            y: 10,
                            duration: 1,
                            ease: "power4.out",
                        },
                        "<0.1",
                    );
            }
        }

        gsap.set("[data-step4]", { autoAlpha: 0 });
        new SplitText("[data-step4] [hero-offer-text]", {
            types: "lines",
            mask: "lines",
            autoSplit: true,
        });
        gsap.set("[data-bg-text2], [data-bg-text3]", { autoAlpha: 0 });

        const bgText = document.querySelectorAll(".hero_bg-text");
        const preloaderTlA = gsap.timeline().set(".page-wrapper", { opacity: 1 });

        const preloaderTlB = gsap
            .timeline({
                repeat: -1,
                onRepeat: () => {
                    gsap.set("[data-bg-text1]", { autoAlpha: 0 });
                    gsap.set("[data-step4]", {
                        autoAlpha: 1,
                        filter: "blur(0px)",
                        y: 0,
                    });
                    gsap.set(".hero_step1-person, .hero_step1-text", {
                        color: "#c3c2b2",
                    });
                },
            })
            .set("[hero-l1], [hero-l2], #hero-lb", { opacity: 0 })
            .add(createLineBTl())
            .to(
                step1[0].querySelector(".hero_step1-person"),
                {
                    color: "#0b4fff",
                    duration: 1.2,
                    ease: "power4.out",
                },
                "<0.9",
            )
            .to(
                step1[0].querySelector(".hero_step1-text"),
                {
                    color: "#232323",
                    duration: 1,
                    ease: "power4.out",
                },
                "<0.3",
            )
            .from(
                ".hero_tag-text-wrap",
                {
                    width: 0,
                    duration: 1,
                    stagger: 0.3,
                    ease: "power4.out",
                },
                "<0.35",
            )
            .to(
                ".hero_tag",
                {
                    color: "#0b4fff",
                    backgroundColor: "#d8dade",
                    borderColor: "#d8dade",
                    duration: 1.2,
                    stagger: 0.3,
                    ease: "power4.out",
                    onStart: () => {
                        gsap.to("[data-step4]", {
                            autoAlpha: 0,
                            filter: "blur(5px)",
                            y: 32,
                            duration: 1,
                            stagger: 0.2,
                            ease: "power4.out",
                        });
                    },
                },
                "<",
            )
            .add(offerDiscount1, "<0.2")
            .add(headlineTl1, "<0.2")
            .add(conversionTl1, "<0.2")
            .to({}, { duration: 2 })
            .add(createLineBUndraw({ textAttr: "text1" }))
            .set("[hero-l1], [hero-l2], #hero-lb", { opacity: 0 })
            .set("[data-bg-text1]", { autoAlpha: 0 });

        preloaderTlA
            .set("[hero-l1], [hero-l2], #hero-lb", { opacity: 0 })
            .from(
                ".nav_fixed",
                {
                    yPercent: -100,
                    opacity: 0,
                    duration: 1.5,
                    ease: "power4.out",
                },
                0.3,
            )
            .from(
                h1.lines,
                {
                    y: 32,
                    opacity: 0,
                    rotation: 4,
                    transformOrigin: "left center",
                    duration: 1,
                    stagger: 0.15,
                    ease: "back.out",
                },
                0.5,
            )
            .from(
                p1.lines,
                {
                    yPercent: 100,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: "power4.out",
                },
                "<0.3",
            )
            .from(
                ".hero_main .button-group",
                {
                    y: 32,
                    filter: "blur(10px)",
                    opacity: 0,
                    duration: 1,
                    ease: "power4.out",
                },
                "<0.3",
            )
            .add(lineATl, 0)
            .fromTo(
                ".hero_step1",
                { y: 32, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    stagger: 0.3,
                    ease: "power4.out",
                },
                1,
            )
            .from(
                "[data-bg-text1]",
                {
                    y: -32,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.3,
                    ease: "power4.out",
                },
                1.7,
            )
            .from(
                "[data-bg-text1]",
                {
                    height: "0%",
                    duration: 1,
                    stagger: 0.3,
                    ease: "power4.out",
                },
                "<",
            )
            .from(
                "[data-bg-text1] .hero_bg-text",
                {
                    y: -10,
                    opacity: 0,
                    filter: "blur(5px)",
                    duration: 1,
                    stagger: 0.3,
                    ease: "power4.out",
                },
                "<0.3",
            )
            .add(preloaderTlB, 1);
    }
});

document.addEventListener("DOMContentLoaded", (event) => {
    const isMobile = window.innerWidth <= 991;

    document.querySelector(".navbar1_menu-button").addEventListener("click", (e) => {
        document.body.style.overflow = e.currentTarget.classList.contains("w--open") ? "auto" : "hidden";
    });

    // DARK
    const PHONE =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f379fafdf222597c9c357_phone%20badge.svg";
    const EMAIL =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f379f8d354d4f979b1315_email%20badge.svg";
    const LAPTOP =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/69aa1107d91189e65af5d2bb_laptop-dark.svg";
    const CROSS =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/69aaed691c6710fc0f9739a0_close-icon.svg";

    const GLOBE = "data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2012C0%205.37258%205.37258%200%2012%200C18.6274%200%2024%205.37258%2024%2012C24%2018.6274%2018.6274%2024%2012%2024C5.37258%2024%200%2018.6274%200%2012Z%22%20fill%3D%22%23232323%22%2F%3E%3Cg%20stroke%3D%22%23F0EFE3%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%227%22%2F%3E%3Cline%20x1%3D%225%22%20y1%3D%2212%22%20x2%3D%2219%22%20y2%3D%2212%22%2F%3E%3Cpath%20d%3D%22M12%205a10%2010%200%200%201%203%207%2010%2010%200%200%201-3%207%2010%2010%200%200%201-3-7%2010%2010%200%200%201%203-7z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    const TOWER = "data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2012C0%205.37258%205.37258%200%2012%200C18.6274%200%2024%205.37258%2024%2012C24%2018.6274%2018.6274%2024%2012%2024C5.37258%2024%200%2018.6274%200%2012Z%22%20fill%3D%22%23232323%22%2F%3E%3Cg%20stroke%3D%22%23F0EFE3%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M7%2019h10%22%2F%3E%3Cpath%20d%3D%22M12%205v14%22%2F%3E%3Cpath%20d%3D%22M9%2019l3-14%203%2014%22%2F%3E%3Cpath%20d%3D%22M15%2011a4%204%200%200%200-6%200%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    const WIFI = "data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2012C0%205.37258%205.37258%200%2012%200C18.6274%200%2024%205.37258%2024%2012C24%2018.6274%2018.6274%2024%2012%2024C5.37258%2024%200%2018.6274%200%2012Z%22%20fill%3D%22%23232323%22%2F%3E%3Cg%20stroke%3D%22%23F0EFE3%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%2010.5a9%209%200%200%201%2012%200%22%2F%3E%3Cpath%20d%3D%22M8.5%2013.5a5%205%200%200%201%207%200%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2216.5%22%20r%3D%221%22%20fill%3D%22%23F0EFE3%22%20stroke%3D%22none%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    const NETWORK = "data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2012C0%205.37258%205.37258%200%2012%200C18.6274%200%2024%205.37258%2024%2012C24%2018.6274%2018.6274%2024%2012%2024C5.37258%2024%200%2018.6274%200%2012Z%22%20fill%3D%22%23232323%22%2F%3E%3Cg%20stroke%3D%22%23F0EFE3%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Crect%20x%3D%2214%22%20y%3D%2214%22%20width%3D%225%22%20height%3D%225%22%20rx%3D%221%22%2F%3E%3Crect%20x%3D%225%22%20y%3D%2214%22%20width%3D%225%22%20height%3D%225%22%20rx%3D%221%22%2F%3E%3Crect%20x%3D%229.5%22%20y%3D%225%22%20width%3D%225%22%20height%3D%225%22%20rx%3D%221%22%2F%3E%3Cpath%20d%3D%22M7.5%2014v-2a1%201%200%200%201%201-1h7a1%201%200%200%201%201%201v2%22%2F%3E%3Cpath%20d%3D%22M12%2011V10%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";
    const DATABASE = "data:image/svg+xml;utf8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%2012C0%205.37258%205.37258%200%2012%200C18.6274%200%2024%205.37258%2024%2012C24%2018.6274%2018.6274%2024%2012%2024C5.37258%2024%200%2018.6274%200%2012Z%22%20fill%3D%22%23232323%22%2F%3E%3Cg%20stroke%3D%22%23F0EFE3%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cellipse%20cx%3D%2212%22%20cy%3D%226%22%20rx%3D%226%22%20ry%3D%223%22%2F%3E%3Cpath%20d%3D%22M6%206v12c0%201.65%202.68%203%206%203s6-1.35%206-3V6%22%2F%3E%3Cpath%20d%3D%22M6%2012c0%201.65%202.68%203%206%203s6-1.35%206-3%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

    function createGridNetwork({ canvasId, rows = 20, baseDotRatio = 0.27, sequences = [] }) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let dpr = window.devicePixelRatio || 1;

        // Apply black background style to parent and canvas as requested
        canvas.style.backgroundColor = "#000000";
        if (canvas.parentElement) {
            canvas.parentElement.style.backgroundColor = "#000000";
        }

        const isMobile = window.innerWidth <= 991;

        // Grid cells config
        const cellCols = isMobile ? 3 : 5;
        const cellRows = isMobile ? 2 : 3;

        // Icons info
        const standardIconTypes = ["phone", "email", "globe", "apple", "network", "laptop", "android"];
        const brandIconTypes = ["zomato", "uber", "zepto"];

        const totalCells = cellCols * cellRows;
        const cellIndices = Array.from({ length: totalCells }, (_, i) => i);

        // Helper to shuffle
        function shuffleArray(arr: number[]) {
            const result = [...arr];
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        }

        const shuffledCells = shuffleArray(cellIndices);
        const standardCount = isMobile ? 3 : 7;

        // Setup standard icons
        interface Icon {
            id: string;
            type: string;
            col: number;
            row: number;
            xOffsetPercent: number;
            yOffsetPercent: number;
            x: number;
            y: number;
            size: number;
            selected: boolean;
            breathSpeed: number;
            breathPhase: number;
            glowIntensity: number;
            index: number;
            hasRelocated: boolean;
            opacity?: number;
        }

        const standardIcons: Icon[] = [];
        for (let i = 0; i < standardCount; i++) {
            const cellIdx = shuffledCells[i];
            const col = cellIdx % cellCols;
            const row = Math.floor(cellIdx / cellCols);
            const xOffsetPercent = 0.18 + Math.random() * 0.64;
            const yOffsetPercent = 0.18 + Math.random() * 0.64;

            // Mark standard icons as selected (3 on desktop, 1 on mobile)
            const selected = i < (isMobile ? 1 : 3);

            standardIcons.push({
                id: `std_${i}`,
                type: standardIconTypes[i % standardIconTypes.length],
                col,
                row,
                xOffsetPercent,
                yOffsetPercent,
                x: 0,
                y: 0,
                size: 25,
                selected,
                breathSpeed: 0.001 + Math.random() * 0.001,
                breathPhase: Math.random() * Math.PI * 2,
                glowIntensity: 0,
                index: i,
                hasRelocated: false
            });
        }

        // Setup brand icons
        const brandIcons: Icon[] = [];
        for (let i = 0; i < 3; i++) {
            const cellIdx = shuffledCells[standardCount + i];
            const col = cellIdx % cellCols;
            const row = Math.floor(cellIdx / cellCols);
            const xOffsetPercent = 0.18 + Math.random() * 0.64;
            const yOffsetPercent = 0.18 + Math.random() * 0.64;

            brandIcons.push({
                id: `brand_${i}`,
                type: brandIconTypes[i],
                col,
                row,
                xOffsetPercent,
                yOffsetPercent,
                x: 0,
                y: 0,
                size: 34,
                selected: false,
                breathSpeed: 0,
                breathPhase: 0,
                glowIntensity: 0,
                index: i,
                hasRelocated: false,
                opacity: 0
            });
        }

        // Fading lines and active comets
        interface Comet {
            source: Icon;
            target: Icon;
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            xc: number;
            yc: number;
            t: number;
            speed: number;
            history: { x: number; y: number }[];
        }

        interface FadingLine {
            source: Icon;
            target: Icon;
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            xc: number;
            yc: number;
            alpha: number;
        }

        const comets: Comet[] = [];
        const fadingLines: FadingLine[] = [];

        // Interactive mouse tracking
        let mouseX = -1000;
        let mouseY = -1000;

        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        canvas.addEventListener("mouseleave", () => {
            mouseX = -1000;
            mouseY = -1000;
        });

        // Click interaction to spawn custom comets
        canvas.addEventListener("click", (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            const currentBrandIndex = Math.floor(lastTimeVal / 3200) % 3;
            const activeBrand = brandIcons[currentBrandIndex];
            const activeTime = lastTimeVal % 3200;
            const brandAlpha = activeTime < 800 ? activeTime / 800 : (activeTime < 2400 ? 1.0 : 1.0 - (activeTime - 2400) / 800);

            const clickableIcons = [...standardIcons];
            if (brandAlpha > 0.15) {
                clickableIcons.push(activeBrand);
            }

            let clicked: Icon | null = null;
            let minDist = 30;
            clickableIcons.forEach(icon => {
                const d = Math.hypot(icon.x - mx, icon.y - my);
                if (d < minDist) {
                    minDist = d;
                    clicked = icon;
                }
            });

            if (clicked) {
                const possibleTargets = clickableIcons.filter(icon => icon.id !== clicked!.id);
                if (possibleTargets.length > 0) {
                    const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                    const dx = target.x - clicked!.x;
                    const dy = target.y - clicked!.y;
                    const dist = Math.hypot(dx, dy);

                    const xc = (clicked!.x + target.x) / 2 + (Math.random() - 0.5) * dist * 0.4;
                    const yc = (clicked!.y + target.y) / 2 + (Math.random() - 0.5) * dist * 0.4;

                    comets.push({
                        source: clicked!,
                        target,
                        x1: clicked!.x,
                        y1: clicked!.y,
                        x2: target.x,
                        y2: target.y,
                        xc,
                        yc,
                        t: 0,
                        speed: 0.01 + Math.random() * 0.008,
                        history: []
                    });
                    clicked!.glowIntensity = 1.5;
                }
            }
        });

        // Sizing & Resize handling
        let width = 0;
        let height = 0;

        function resizeCanvas() {
            const parent = canvas.parentElement;
            if (!parent) return;
            width = parent.clientWidth;
            height = parent.clientHeight || (isMobile ? 280 : 380);
            dpr = window.devicePixelRatio || 1;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            const cellWidth = width / cellCols;
            const cellHeight = height / cellRows;

            standardIcons.forEach(icon => {
                icon.x = icon.col * cellWidth + cellWidth * icon.xOffsetPercent;
                icon.y = icon.row * cellHeight + cellHeight * icon.yOffsetPercent;
            });

            brandIcons.forEach(icon => {
                icon.x = icon.col * cellWidth + cellWidth * icon.xOffsetPercent;
                icon.y = icon.row * cellHeight + cellHeight * icon.yOffsetPercent;
            });

            comets.forEach(comet => {
                comet.x1 = comet.source.x;
                comet.y1 = comet.source.y;
                comet.x2 = comet.target.x;
                comet.y2 = comet.target.y;
                const dx = comet.x2 - comet.x1;
                const dy = comet.y2 - comet.y1;
                const dist = Math.hypot(dx, dy);
                comet.xc = (comet.x1 + comet.x2) / 2 + (Math.random() - 0.5) * dist * 0.45;
                comet.yc = (comet.y1 + comet.y2) / 2 + (Math.random() - 0.5) * dist * 0.45;
            });
        }

        // Custom Vector Path helpers
        function drawRoundedRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
            c.beginPath();
            c.moveTo(x + r, y);
            c.lineTo(x + w - r, y);
            c.quadraticCurveTo(x + w, y, x + w, y + r);
            c.lineTo(x + w, y + h - r);
            c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            c.lineTo(x + r, y + h);
            c.quadraticCurveTo(x, y + h, x, y + h - r);
            c.lineTo(x, y + r);
            c.quadraticCurveTo(x, y, x + r, y);
            c.closePath();
        }

        function drawIconVector(c: CanvasRenderingContext2D, type: string, x: number, y: number, size: number, alpha: number) {
            c.save();
            c.globalAlpha = alpha;

            if (type === "phone") {
                c.strokeStyle = "#ffffff";
                c.lineWidth = 1.8;
                const w = size * 0.55;
                const h = size * 0.9;
                drawRoundedRect(c, x - w / 2, y - h / 2, w, h, 3);
                c.stroke();

                c.beginPath();
                c.moveTo(x - w / 4, y - h / 2 + 2);
                c.lineTo(x + w / 4, y - h / 2 + 2);
                c.lineWidth = 1.2;
                c.stroke();

                c.beginPath();
                c.arc(x, y + h / 2 - 4, 1.2, 0, Math.PI * 2);
                c.fillStyle = "#ffffff";
                c.fill();
            } else if (type === "email") {
                c.strokeStyle = "#ffffff";
                c.lineWidth = 1.8;
                const w = size * 0.8;
                const h = size * 0.55;
                c.strokeRect(x - w / 2, y - h / 2, w, h);

                c.beginPath();
                c.moveTo(x - w / 2, y - h / 2);
                c.lineTo(x, y + h / 6);
                c.lineTo(x + w / 2, y - h / 2);
                c.stroke();
            } else if (type === "globe") {
                c.strokeStyle = "#ffffff";
                c.lineWidth = 1.8;
                const r = size * 0.45;
                c.beginPath();
                c.arc(x, y, r, 0, Math.PI * 2);
                c.stroke();

                c.beginPath();
                c.moveTo(x - r, y);
                c.lineTo(x + r, y);
                c.stroke();

                c.beginPath();
                c.moveTo(x, y - r);
                c.lineTo(x, y + r);
                c.stroke();

                c.beginPath();
                c.ellipse(x, y, r * 0.5, r, 0, 0, Math.PI * 2);
                c.stroke();
            } else if (type === "apple") {
                c.save();
                c.translate(x, y);
                const scale = size / 150;
                c.scale(scale, scale);
                c.translate(-95, -92);
                c.fillStyle = "#ffffff";
                const p = new Path2D("M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.37.13-9.13-1.9-14.27-6.08-3.48-2.82-7.37-7.49-11.69-14-4.85-7.07-8.89-15.91-12.13-26.54-3.24-10.62-4.88-20.91-4.88-30.85 0-14.88 3.73-26.83 11.19-35.88 7.46-9.05 16.59-13.62 27.38-13.74 5.03 0 10.26 1.37 15.7 4.13 5.44 2.76 9.4 4.13 11.9 4.13 2.12 0 5.67-.99 10.66-2.96 5-1.97 9.87-2.9 14.63-2.8 15.14 1.12 26.27 6.94 33.4 17.48-13.06 7.91-19.46 18.44-19.18 31.57.28 10.27 4.12 18.77 11.53 25.5 7.4 6.72 16.14 10.37 26.22 10.94-2.12 6.4-4.7 12.11-7.74 17.15zm-23.77-90.7c0 8.09-2.96 15.63-8.87 21.64-5.92 6-12.98 9.25-21.2 9.75.12-7.85 3.12-15.35 9.02-22.5 5.9-7.16 13.19-11.02 21.87-11.6 0 1.05-.18 2.05-.82 2.71z");
                c.fill(p);
                c.restore();
            } else if (type === "network") {
                c.save();
                c.translate(x, y);
                c.scale(size / 24, size / 24);
                c.strokeStyle = "#ffffff";
                c.lineWidth = 1.5;
                c.lineCap = "round";
                c.lineJoin = "round";

                c.beginPath();
                // Draw top transmitter circle
                c.arc(0, -2, 1.5, 0, Math.PI * 2);
                
                // Tower legs
                c.moveTo(-4, 10);
                c.lineTo(0, -2);
                c.lineTo(4, 10);
                
                // Horizontal crossbars
                c.moveTo(-4, 10); c.lineTo(4, 10);
                c.moveTo(-2.4, 6); c.lineTo(2.4, 6);
                c.moveTo(-0.8, 2); c.lineTo(0.8, 2);
                
                // X-bracing (Diagonals)
                c.moveTo(-4, 10); c.lineTo(2.4, 6);
                c.moveTo(4, 10); c.lineTo(-2.4, 6);
                c.moveTo(-2.4, 6); c.lineTo(0.8, 2);
                c.moveTo(2.4, 6); c.lineTo(-0.8, 2);
                
                // Left transmission waves
                const startAngleLeft = 0.7 * Math.PI;
                const endAngleLeft = 1.3 * Math.PI;
                c.moveTo(5 * Math.cos(startAngleLeft), -2 + 5 * Math.sin(startAngleLeft));
                c.arc(0, -2, 5, startAngleLeft, endAngleLeft);
                c.moveTo(8 * Math.cos(startAngleLeft), -2 + 8 * Math.sin(startAngleLeft));
                c.arc(0, -2, 8, startAngleLeft, endAngleLeft);
                c.moveTo(11 * Math.cos(startAngleLeft), -2 + 11 * Math.sin(startAngleLeft));
                c.arc(0, -2, 11, startAngleLeft, endAngleLeft);
                
                // Right transmission waves
                const startAngleRight = -0.3 * Math.PI;
                const endAngleRight = 0.3 * Math.PI;
                c.moveTo(5 * Math.cos(startAngleRight), -2 + 5 * Math.sin(startAngleRight));
                c.arc(0, -2, 5, startAngleRight, endAngleRight);
                c.moveTo(8 * Math.cos(startAngleRight), -2 + 8 * Math.sin(startAngleRight));
                c.arc(0, -2, 8, startAngleRight, endAngleRight);
                c.moveTo(11 * Math.cos(startAngleRight), -2 + 11 * Math.sin(startAngleRight));
                c.arc(0, -2, 11, startAngleRight, endAngleRight);

                c.stroke();
                c.restore();
            } else if (type === "laptop") {
                c.strokeStyle = "#ffffff";
                c.lineWidth = 1.8;
                const sw = size * 0.7;
                const sh = size * 0.45;
                drawRoundedRect(c, x - sw / 2, y - sh / 2 - 2, sw, sh, 2);
                c.stroke();

                c.beginPath();
                c.moveTo(x - sw / 2 - 3, y + sh / 2);
                c.lineTo(x + sw / 2 + 3, y + sh / 2);
                c.lineTo(x + sw / 2, y + sh / 2 + 4);
                c.lineTo(x - sw / 2, y + sh / 2 + 4);
                c.closePath();
                c.fillStyle = "#ffffff";
                c.fill();
                c.stroke();
            } else if (type === "android") {
                c.fillStyle = "#22c55e";
                const r = size * 0.35;
                c.beginPath();
                c.arc(x, y - 1, r, Math.PI, 0);
                c.fill();

                c.strokeStyle = "#22c55e";
                c.lineWidth = 1.5;
                c.beginPath();
                c.moveTo(x - r * 0.5, y - 1 - r * 0.7);
                c.lineTo(x - r * 0.8, y - 1 - r * 1.2);
                c.moveTo(x + r * 0.5, y - 1 - r * 0.7);
                c.lineTo(x + r * 0.8, y - 1 - r * 1.2);
                c.stroke();

                c.fillStyle = "#ffffff";
                c.beginPath();
                c.arc(x - r * 0.4, y - r * 0.5, r * 0.12, 0, Math.PI * 2);
                c.arc(x + r * 0.4, y - r * 0.5, r * 0.12, 0, Math.PI * 2);
                c.fill();

                c.fillStyle = "#22c55e";
                drawRoundedRect(c, x - r, y + 2, r * 2, r * 0.7, 2);
                c.fill();
            } else if (type === "zomato") {
                c.fillStyle = `rgba(226, 55, 68, 0.95)`;
                drawRoundedRect(c, x - 17, y - 17, 34, 34, 4);
                c.fill();

                c.fillStyle = "#ffffff";
                c.font = "italic bold 8px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText("zomato", x, y);
            } else if (type === "uber") {
                c.fillStyle = `rgba(0, 0, 0, 0.95)`;
                c.strokeStyle = "rgba(255, 255, 255, 0.4)";
                c.lineWidth = 1;
                drawRoundedRect(c, x - 17, y - 17, 34, 34, 4);
                c.fill();
                c.stroke();

                c.fillStyle = "#ffffff";
                c.font = "bold 9px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText("Uber", x, y);
            } else if (type === "zepto") {
                c.fillStyle = `rgba(62, 10, 114, 0.95)`;
                drawRoundedRect(c, x - 17, y - 17, 34, 34, 4);
                c.fill();

                const gradText = c.createLinearGradient(x - 14, 0, x + 14, 0);
                gradText.addColorStop(0, "#FFD700");
                gradText.addColorStop(0.5, "#FF69B4");
                gradText.addColorStop(1, "#DA70D6");
                c.fillStyle = gradText;
                c.font = "bold 9px sans-serif";
                c.textAlign = "center";
                c.textBaseline = "middle";
                c.fillText("zepto", x, y);
            }

            c.restore();
        }

        // Draw radial glows behind icons
        function drawGlowBehind(c: CanvasRenderingContext2D, icon: Icon, alphaMult = 1.0) {
            if (icon.glowIntensity <= 0) return;

            let color = "255, 255, 255";
            if (icon.type === "zomato") {
                color = "226, 55, 68";
            } else if (icon.type === "zepto") {
                color = "147, 51, 234";
            } else if (icon.selected) {
                color = "34, 197, 94";
            }

            const size = icon.size;
            const grad = c.createRadialGradient(icon.x, icon.y, 0, icon.x, icon.y, size * 1.8);
            const alpha = Math.min(1.0, icon.glowIntensity) * 0.45 * alphaMult;

            grad.addColorStop(0, `rgba(${color}, ${alpha})`);
            grad.addColorStop(0.5, `rgba(${color}, ${alpha * 0.3})`);
            grad.addColorStop(1, `rgba(${color}, 0)`);

            c.save();
            c.fillStyle = grad;
            c.beginPath();
            c.arc(icon.x, icon.y, size * 1.8, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }

        // Selected Icon Badges
        function drawCheckmarkBadge(c: CanvasRenderingContext2D, icon: Icon, time: number, opacity: number = 1.0) {
            if (!icon.selected) return;

            const badgeSize = icon.size * 0.38;
            const bx = icon.x + icon.size * 0.45;
            const by = icon.y - icon.size * 0.45;

            // Pulse
            const pulse = 1.0 + 0.15 * Math.sin(time * 0.005 + icon.index);
            const r = badgeSize * pulse;

            // Pulsing green backing
            const grad = c.createRadialGradient(bx, by, 0, bx, by, r * 1.5);
            grad.addColorStop(0, `rgba(34, 197, 94, ${0.9 * opacity})`);
            grad.addColorStop(0.5, `rgba(34, 197, 94, ${0.4 * opacity})`);
            grad.addColorStop(1, "rgba(34, 197, 94, 0)");

            c.save();
            c.fillStyle = grad;
            c.beginPath();
            c.arc(bx, by, r * 1.5, 0, Math.PI * 2);
            c.fill();

            // Solid background
            c.fillStyle = `rgba(0, 0, 0, ${0.85 * opacity})`;
            c.beginPath();
            c.arc(bx, by, r, 0, Math.PI * 2);
            c.fill();

            // Green tick lines
            c.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
            c.lineWidth = 1.8 * (r / 5);
            c.lineCap = "round";
            c.lineJoin = "round";
            c.beginPath();
            c.moveTo(bx - r * 0.4, by);
            c.lineTo(bx - r * 0.1, by + r * 0.3);
            c.lineTo(bx + r * 0.4, by - r * 0.3);
            c.stroke();
            c.restore();
        }

        // Initialize positions
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        let lastTimeVal = 0;
        let lastCometSpawn = 0;
        let lastBrandIndex = -1;

        function isIconInUse(icon: Icon) {
            const inComet = comets.some(comet => comet.source.id === icon.id || comet.target.id === icon.id);
            const inLine = fadingLines.some(line => line.source.id === icon.id || line.target.id === icon.id);
            return inComet || inLine;
        }

        function relocateIcon(icon: Icon) {
            if (isIconInUse(icon)) return false;

            const occupied = new Set<number>();
            standardIcons.forEach(other => {
                if (other.id !== icon.id) {
                    occupied.add(other.row * cellCols + other.col);
                }
            });
            brandIcons.forEach(other => {
                if (other.id !== icon.id) {
                    occupied.add(other.row * cellCols + other.col);
                }
            });

            const unoccupied = [];
            for (let i = 0; i < totalCells; i++) {
                if (!occupied.has(i)) {
                    unoccupied.push(i);
                }
            }

            if (unoccupied.length > 0) {
                const cellIdx = unoccupied[Math.floor(Math.random() * unoccupied.length)];
                icon.col = cellIdx % cellCols;
                icon.row = Math.floor(cellIdx / cellCols);
                icon.xOffsetPercent = 0.18 + Math.random() * 0.64;
                icon.yOffsetPercent = 0.18 + Math.random() * 0.64;

                const cellWidth = width / cellCols;
                const cellHeight = height / cellRows;
                icon.x = icon.col * cellWidth + cellWidth * icon.xOffsetPercent;
                icon.y = icon.row * cellHeight + cellHeight * icon.yOffsetPercent;
                return true;
            }
            return false;
        }

        // Main Animation Loop
        function loop(time: number) {
            if (!lastTimeVal) lastTimeVal = time;
            const dt = time - lastTimeVal;
            lastTimeVal = time;

            // Clear screen
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);

            // 1. Draw Dot Grid
            const dotSpacing = 48;
            const dotRadius = 1.5;
            const offsetX = (width % dotSpacing) / 2;
            const offsetY = (height % dotSpacing) / 2;
            ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
            for (let x = offsetX; x < width; x += dotSpacing) {
                for (let y = offsetY; y < height; y += dotSpacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 2. Sequential brand blinking
            const brandCycleTime = 3200;
            const elapsedCycle = time % brandCycleTime;
            const currentBrandIndex = Math.floor(time / brandCycleTime) % 3;

            if (lastBrandIndex !== currentBrandIndex) {
                const activeBrand = brandIcons[currentBrandIndex];
                relocateIcon(activeBrand);
                lastBrandIndex = currentBrandIndex;
            }

            let brandAlpha = 0;
            if (elapsedCycle < 800) {
                brandAlpha = elapsedCycle / 800;
            } else if (elapsedCycle < 2400) {
                brandAlpha = 1.0;
            } else {
                brandAlpha = 1.0 - (elapsedCycle - 2400) / 800;
            }

            // Interactive Hover effects
            const activeBrand = brandIcons[currentBrandIndex];
            const clickableIcons = [...standardIcons];
            if (brandAlpha > 0.15) {
                clickableIcons.push(activeBrand);
            }

            clickableIcons.forEach(icon => {
                const d = Math.hypot(icon.x - mouseX, icon.y - mouseY);
                if (d < 45) {
                    icon.glowIntensity = Math.max(icon.glowIntensity, (1.0 - d / 45) * 1.2);
                }
            });

            // Decay glows
            standardIcons.forEach(icon => {
                if (icon.glowIntensity > 0) {
                    icon.glowIntensity -= dt * 0.0009;
                    if (icon.glowIntensity < 0) icon.glowIntensity = 0;
                }
            });
            brandIcons.forEach(icon => {
                if (icon.glowIntensity > 0) {
                    icon.glowIntensity -= dt * 0.0009;
                    if (icon.glowIntensity < 0) icon.glowIntensity = 0;
                }
            });

            // 3. Draw Glows (drawn behind icon vectors)
            standardIcons.forEach(icon => {
                let opacity = 0.45 + 0.5 * Math.sin(time * icon.breathSpeed + icon.breathPhase);
                if (opacity < 0) opacity = 0;
                drawGlowBehind(ctx, icon, opacity);
            });
            drawGlowBehind(ctx, activeBrand, brandAlpha);

            // 4. Draw Fading Connecting Lines (faded out more and faster)
            fadingLines.forEach((line, index) => {
                line.alpha -= dt / 700;
                if (line.alpha <= 0) {
                    fadingLines.splice(index, 1);
                    return;
                }

                ctx.save();
                ctx.lineCap = "round";

                // Pass 1: Outer Glow (reduced opacity multiplier from 0.08 to 0.02)
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.quadraticCurveTo(line.xc, line.yc, line.x2, line.y2);
                ctx.lineWidth = 7;
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 * line.alpha})`;
                ctx.stroke();

                // Pass 2: Mid Glow (reduced opacity multiplier from 0.2 to 0.06)
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * line.alpha})`;
                ctx.stroke();

                // Pass 3: Core (reduced opacity multiplier from 0.85 to 0.25)
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * line.alpha})`;
                ctx.stroke();

                ctx.restore();
            });

            // 5. Draw Icon Vectors
            standardIcons.forEach(icon => {
                let opacity = 0.45 + 0.5 * Math.sin(time * icon.breathSpeed + icon.breathPhase);
                if (opacity < 0) opacity = 0;

                // Relocate standard icons when faded out completely
                if (opacity <= 0.05) {
                    if (!icon.hasRelocated) {
                        const success = relocateIcon(icon);
                        if (success) {
                            icon.hasRelocated = true;
                        }
                    }
                } else if (opacity > 0.15) {
                    icon.hasRelocated = false;
                }

                drawIconVector(ctx, icon.type, icon.x, icon.y, icon.size, opacity);
            });
            
            // Draw all brand icons based on their transition opacity to support seamless fade-out during switch
            brandIcons.forEach((icon, i) => {
                const targetOpacity = (i === currentBrandIndex) ? brandAlpha : 0;
                if (icon.opacity === undefined) icon.opacity = 0;
                icon.opacity += (targetOpacity - icon.opacity) * 0.1;
                if (icon.opacity > 0.01) {
                    drawIconVector(ctx, icon.type, icon.x, icon.y, icon.size, icon.opacity);
                }
            });

            // 6. Draw Checkmark Badges
            standardIcons.forEach(icon => {
                let opacity = 0.45 + 0.5 * Math.sin(time * icon.breathSpeed + icon.breathPhase);
                if (opacity < 0) opacity = 0;
                drawCheckmarkBadge(ctx, icon, time, opacity);
            });

            // 7. Spawn comets periodically
            if (time - lastCometSpawn > 700) {
                spawnComet(time);
                lastCometSpawn = time;
            }

            // 8. Update & Draw Comets
            comets.forEach((comet, index) => {
                comet.t += comet.speed * (dt / 16);
                if (comet.t >= 1) {
                    comet.source.glowIntensity = 1.5;
                    comet.target.glowIntensity = 1.5;

                    fadingLines.push({
                        source: comet.source,
                        target: comet.target,
                        x1: comet.x1,
                        y1: comet.y1,
                        x2: comet.x2,
                        y2: comet.y2,
                        xc: comet.xc,
                        yc: comet.yc,
                        alpha: 1.0
                    });

                    comets.splice(index, 1);
                    return;
                }

                const t = comet.t;
                const xt = (1 - t) * (1 - t) * comet.x1 + 2 * (1 - t) * t * comet.xc + t * t * comet.x2;
                const yt = (1 - t) * (1 - t) * comet.y1 + 2 * (1 - t) * t * comet.yc + t * t * comet.y2;

                comet.history.push({ x: xt, y: yt });
                if (comet.history.length > 18) {
                    comet.history.shift();
                }

                ctx.save();
                for (let i = 0; i < comet.history.length; i++) {
                    const alpha = (i / comet.history.length) * 0.55;
                    const r = 0.5 + (i / comet.history.length) * 2.0;
                    ctx.beginPath();
                    ctx.arc(comet.history[i].x, comet.history[i].y, r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fill();
                }

                // Luminous Comet Head
                ctx.beginPath();
                ctx.arc(xt, yt, 8.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(xt, yt, 5.0, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
                ctx.fill();

                ctx.beginPath();
                ctx.arc(xt, yt, 2.6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
                ctx.fill();
                ctx.restore();
            });

            requestAnimationFrame(loop);
        }

        function spawnComet(time: number) {
            const currentBrandIndex = Math.floor(time / 3200) % 3;
            const activeBrand = brandIcons[currentBrandIndex];
            const activeTime = time % 3200;
            const brandAlpha = activeTime < 800 ? activeTime / 800 : (activeTime < 2400 ? 1 : 1 - (activeTime - 2400) / 800);

            const visibleIcons = [...standardIcons];
            if (brandAlpha > 0.15) {
                visibleIcons.push(activeBrand);
            }

            if (visibleIcons.length < 2) return;

            const srcIdx = Math.floor(Math.random() * visibleIcons.length);
            let tgtIdx = Math.floor(Math.random() * visibleIcons.length);
            while (tgtIdx === srcIdx) {
                tgtIdx = Math.floor(Math.random() * visibleIcons.length);
            }

            const source = visibleIcons[srcIdx];
            const target = visibleIcons[tgtIdx];

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.hypot(dx, dy);

            const xc = (source.x + target.x) / 2 + (Math.random() - 0.5) * dist * 0.45;
            const yc = (source.y + target.y) / 2 + (Math.random() - 0.5) * dist * 0.45;

            comets.push({
                source,
                target,
                x1: source.x,
                y1: source.y,
                x2: target.x,
                y2: target.y,
                xc,
                yc,
                t: 0,
                speed: 0.016 + Math.random() * 0.014,
                history: []
            });
        }

        requestAnimationFrame(loop);
    }

    createGridNetwork({
        canvasId: "network",
        rows: 9,
        sequences: [
            {
                icon: PHONE,
                points: [
                    { coord: isMobile ? "A6" : "B5", color: "white" },
                    { coord: isMobile ? "C7" : "D6", color: "white" },
                    { coord: isMobile ? "D5" : "F5", icon: "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg" },
                ],
            },
            {
                icon: GLOBE,
                points: [
                    { coord: isMobile ? "J8" : "AF6", color: "white" },
                    { coord: isMobile ? "H7" : "AD5", color: "white" },
                    { coord: isMobile ? "G8" : "Y5", icon: WIFI },
                ],
            },
            {
                icon: PHONE,
                points: [
                    { coord: isMobile ? "J1" : "AE1", color: "white" },
                    { coord: isMobile ? "H6" : "AB5", color: "white" },
                    { coord: isMobile ? "I8" : "AB8", color: "white" },
                    { coord: isMobile ? "F9" : "W9", color: "white" },
                    { coord: isMobile ? "I2" : "AB2", icon: TOWER },
                ],
            },
            {
                icon: TOWER,
                points: [
                    { coord: isMobile ? "B8" : "D8", color: "white" },
                    { coord: isMobile ? "D9" : "H8", color: "white" },
                    { coord: isMobile ? "E8" : "L8", icon: WIFI },
                ],
            },
            {
                icon: DATABASE,
                points: [
                    { coord: isMobile ? "D1" : "K1", color: "white" },
                    { coord: isMobile ? "E2" : "L3", color: "white" },
                    { coord: isMobile ? "E3" : "O3", icon: "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg" },
                ],
            },
            {
                icon: EMAIL,
                points: [
                    { coord: isMobile ? "A2" : "E2", color: "white" },
                    { coord: isMobile ? "D2" : "I2", color: "white" },
                    { coord: isMobile ? "F4" : "O7", color: "white" },
                    { coord: isMobile ? "G3" : "V3", color: "white" },
                    { coord: isMobile ? "J6" : "Z6", icon: "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg" },
                ],
            },
            {
                icon: EMAIL,
                points: [
                    { coord: isMobile ? "G2" : "S2", color: "white" },
                    { coord: isMobile ? "I4" : "T8", icon: TOWER },
                ],
            },
            {
                icon: LAPTOP,
                points: [
                    { coord: isMobile ? "C1" : "I1", color: "white" },
                    { coord: isMobile ? "F7" : "M7", color: "white" },
                    { coord: isMobile ? "C9" : "K9", color: "white" },
                    { coord: isMobile ? "B5" : "I7", color: "white" },
                    isMobile ? { coord: "F2", icon: "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg" } : { coord: "F8", color: "white" },
                    isMobile ? null : { coord: "M2", icon: "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg" },
                ].filter(Boolean),
            },
        ],
    });

    // BLUE
    const PHONE2 =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e5e7199fd00ab6ffd_phone%20blue.svg";
    const EMAIL2 =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e87333795656729ae_email%20blue.svg";
    const LAPTOP2 =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/69aa10fa2fc64be7bfc9287e_laptop-blue.svg";
    const MESSAGE =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e8f1eb466e9a164b1_message%20blue.svg";
    const PERSON =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7ecefdaad6bd0f8b66_person.svg";
    const CHECKMARK =
        "https://cdn.prod.website-files.com/6998a7a4efcd66d9f2857e79/699f5b7e366b78446268cb7d_checkmark.svg";

    function createOrganizedNetwork({ canvasId, rows = 9, baseDotRatio = 0.27, sequences = [] }) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;

        const imageCache = {};
        sequences.forEach((seq) => {
            seq.points.forEach((p) => {
                if (p.icon && !imageCache[p.icon]) {
                    const img = new Image();
                    img.src = p.icon;
                    imageCache[p.icon] = img;
                }
            });
        });

        const letterToIndex = (str) => str.split("").reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;

        const getMaxCol = () => {
            let max = 0;

            sequences.forEach((seq) => {
                seq.points.forEach((p) => {
                    if (!p || !p.coord) return;

                    const match = p.coord.match(/^([A-Z]+)(\d+)$/);
                    if (!match) return;

                    const col = letterToIndex(match[1]);
                    if (col > max) max = col;
                });
            });

            return max + 1;
        };

        const state = {
            bgDots: [],
            sequences: sequences.map((seq) => ({
                segments: seq.points.slice(1).map(() => ({ progress: 0 })),
                nodes: seq.points.map(() => ({ scale: 0 })),
                overshoot: seq.overshoot ? { progress: 0 } : null,
            })),
        };

        function buildBg() {
            const width = canvas.parentElement.offsetWidth;
            const cols = getMaxCol();
            const gap = width / cols;

            const dots = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    dots.push({ row: r, col: c, scale: 0 });
                }
            }
            return dots;
        }

        function draw() {
            const containerWidth = canvas.parentElement.offsetWidth;
            const cols = getMaxCol();
            const gap = containerWidth / cols;
            const dotSize = gap * baseDotRatio;
            const height = rows * gap;

            canvas.width = containerWidth * dpr;
            canvas.height = height * dpr;
            canvas.style.width = containerWidth + "px";
            canvas.style.height = height + "px";

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const parseCoord = (coord) => {
                const match = coord.match(/^([A-Z]+)(\d+)$/);
                const col = letterToIndex(match[1]);
                const row = parseInt(match[2], 10) - 1;
                return {
                    x: col * gap + gap / 2,
                    y: row * gap + gap / 2,
                };
            };

            const drawDot = (x, y, color, scale = 1) => {
                ctx.beginPath();
                ctx.arc(x, y, (dotSize / 2) * scale, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
            };

            const drawLine = (p1, p2, progress = 1) => {
                const x = p1.x + (p2.x - p1.x) * progress;
                const y = p1.y + (p2.y - p1.y) * progress;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(x, y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#F0EFE3";
                ctx.stroke();
            };

            state.bgDots.forEach((dot) => {
                drawDot(dot.col * gap + gap / 2, dot.row * gap + gap / 2, "rgba(255,255,255,0.1)", dot.scale);
            });

            sequences.forEach((seq, sIndex) => {
                const seqState = state.sequences[sIndex];
                const points = seq.points;

                for (let i = 1; i < points.length; i++) {
                    const prev = parseCoord(points[i - 1].coord);
                    const current = parseCoord(points[i].coord);
                    drawLine(prev, current, seqState.segments[i - 1].progress);
                }

                if (seqState.overshoot) {
                    const last = parseCoord(points[points.length - 1].coord);
                    ctx.beginPath();
                    ctx.moveTo(last.x, last.y);
                    ctx.lineTo(last.x + (containerWidth - last.x) * seqState.overshoot.progress, last.y);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#F0EFE3";
                    ctx.stroke();
                }

                points.forEach((p, i) => {
                    const pos = parseCoord(p.coord);

                    if (p.icon && imageCache[p.icon]?.complete) {
                        const size = gap * 0.9 * seqState.nodes[i].scale;
                        ctx.drawImage(imageCache[p.icon], pos.x - size / 2, pos.y - size / 2, size, size);
                    }

                    if (p.dot) {
                        drawDot(pos.x, pos.y, p.color || "#F0EFE3", seqState.nodes[i].scale);
                    }
                });
            });
        }

        state.bgDots = buildBg();

        const master = gsap.timeline({
            scrollTrigger: {
                trigger: canvas,
                start: "top 80%",
                toggleActions: "play none none none",
            },
        });

        if (isMobile) {
            state.bgDots.forEach((dot) => (dot.scale = 1));
            draw();
        } else {
            master.to(state.bgDots, {
                scale: 1,
                duration: 0.6,
                stagger: {
                    amount: 0.6,
                    from: "start",
                    grid: "[1, 0]",
                },
                ease: "power2.out",
                onUpdate: draw,
            });
        }

        state.sequences.forEach((seqState, index) => {
            const seqTl = gsap.timeline({ onUpdate: draw });

            seqTl.to(seqState.nodes[0], {
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.7)",
            });

            for (let i = 1; i < seqState.nodes.length; i++) {
                seqTl.to(
                    seqState.segments[i - 1],
                    {
                        progress: 1,
                        duration: 0.3,
                        ease: "power2.out",
                    },
                    "-=0.15",
                );

                seqTl.to(
                    seqState.nodes[i],
                    {
                        scale: 1,
                        duration: 0.2,
                        ease: "back.out(1.7)",
                    },
                    "<0.15",
                );
            }

            if (seqState.overshoot) {
                seqTl.to(seqState.overshoot, {
                    progress: 1,
                    duration: 0.3,
                    ease: "power2.out",
                });
            }

            master.add(seqTl, index === 0 ? "<0.2" : "<50%");
        });

        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                state.bgDots = buildBg();
                draw();
            }, 100);
        });

        draw();
    }

    /* createOrganizedNetwork({
        canvasId: "organizedNetwork",
        rows: 9,
        sequences: [
            {
                overshoot: true,
                points: [
                    { coord: isMobile ? "A3" : "A3", icon: PERSON },
                    { coord: isMobile ? "C2" : "E2", icon: PHONE2 },
                    { coord: isMobile ? "D3" : "I2", dot: true },
                    { coord: isMobile ? "E2" : "M1", icon: EMAIL2 },
                    {
                        coord: isMobile ? "G2" : "Q2",
                        dot: isMobile ? false : true,
                        icon: isMobile ? MESSAGE : null,
                    },
                    {
                        coord: isMobile ? "H3" : "U2",
                        dot: isMobile ? true : false,
                        icon: isMobile ? null : MESSAGE,
                    },
                    {
                        coord: isMobile ? "J2" : "Y3",
                        dot: isMobile ? false : true,
                        icon: isMobile ? CHECKMARK : null,
                    },
                    isMobile ? null : { coord: "AC2", icon: CHECKMARK },
                ].filter(Boolean),
            },
            {
                overshoot: true,
                points: [
                    { coord: isMobile ? "A5" : "A5", icon: PERSON },
                    { coord: isMobile ? "C5" : "E5", dot: true },
                    {
                        coord: isMobile ? "D6" : "I5",
                        icon: isMobile ? MESSAGE : PHONE2,
                    },
                    {
                        coord: isMobile ? "F5" : "M6",
                        icon: isMobile ? PHONE2 : MESSAGE,
                    },
                    { coord: isMobile ? "I5" : "Q5", dot: true },
                    {
                        coord: isMobile ? "J5" : "U5",
                        dot: isMobile ? false : true,
                        icon: isMobile ? CHECKMARK : null,
                    },
                    isMobile ? null : { coord: "Y6", dot: true },
                    isMobile ? null : { coord: "AC5", icon: CHECKMARK },
                ].filter(Boolean),
            },
            {
                overshoot: true,
                points: [
                    { coord: isMobile ? "A7" : "A7", icon: PERSON },
                    { coord: isMobile ? "C7" : "E7", icon: LAPTOP2 },
                    { coord: isMobile ? "E7" : "I7", dot: true },
                    { coord: isMobile ? "F8" : "M8", icon: EMAIL2 },
                    {
                        coord: isMobile ? "H7" : "Q7",
                        dot: isMobile ? false : true,
                        icon: isMobile ? EMAIL2 : null,
                    },
                    {
                        coord: isMobile ? "J7" : "U7",
                        dot: isMobile ? false : true,
                        icon: isMobile ? CHECKMARK : null,
                    },
                    isMobile ? null : { coord: "Y7", icon: MESSAGE },
                    isMobile ? null : { coord: "AC7", icon: CHECKMARK },
                ].filter(Boolean),
            },
        ],
    }); */
    let counterObj = { val: 0 };
    const automationsText = new SplitText(".automations_text", {
        types: "chars",
        autoSplit: true,
    });
    gsap
        .timeline({
            scrollTrigger: {
                trigger: ".section_automations",
                start: "top top",
                end: "+=60%",
                pin: true,
                scrub: 1,
            },
        })
        .from(".automations_h", {
            scale: 2,
            yPercent: 50,
            xPercent: -30,
            duration: 0.5,
            opacity: 0,
            filter: "blur(20px)",
            ease: "none",
        })
        .to(
            counterObj,
            {
                val: 5,
                duration: 0.5,
                ease: "none",
                onUpdate: () => {
                    const value = Math.round(counterObj.val);
                    document.querySelector(".automations_counter").textContent = value;
                },
            },
            "<",
        )
        .from(
            automationsText.chars,
            {
                opacity: 0,
                filter: "blur(2px)",
                duration: 0.5,
                stagger: {
                    from: "center",
                    each: 0.01,
                },
            },
            "<50%",
        )
        .to(
            ".automations_behind",
            {
                yPercent: -100,
                y: isMobile ? "100vh" : "100svh",
                duration: 1,
                ease: "none",
            },
            "-=0.5",
        );

    gsap.utils.toArray("[automations-bottom]").forEach((section) => {
        const name = section.querySelector(".automations_name");
        const spacer = section.querySelector(".automations_spacer");
        const tag = section.querySelector(".automations_tag");

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none none",
            },
        });

        tl.from(spacer, {
            scaleX: 0,
            duration: 1.5,
            ease: "power4.out",
        })
            .from(
                name,
                {
                    xPercent: 100,
                    opacity: 0,
                    duration: 1.5,
                    ease: "back.out(0.5)",
                },
                "<",
            )
            .from(
                tag,
                {
                    xPercent: -100,
                    opacity: 0,
                    duration: 1.5,
                    ease: "back.out(0.5)",
                },
                "<",
            );
    });

    gsap.utils.toArray(".heading-style-h2, [fd-h2]").forEach((el) => {
        if (el.hasAttribute("prevent")) return;
        const split = new SplitText(el, {
            types: "words",
            mask: "words",
            wordsClass: "h2",
            autoSplit: true,
        });
        gsap.set(".h2-mask", {
            paddingBottom: 20,
            paddingRight: 20,
            marginRight: -20,
            marginBottom: -20,
        });

        gsap.from(split.words, {
            yPercent: 100,
            opacity: 0,
            duration: 1.2,
            stagger: 0.05,
            ease: "power4.out",
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
            },
        });
    });
    gsap.utils.toArray("[fd-paragraph]").forEach((el) => {
        if (el.closest(".legal_rich")) return;

        const split = new SplitText(el, {
            types: "lines",
            mask: "lines",
            autoSplit: true,
        });

        gsap.from(split.lines, {
            yPercent: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
            scrollTrigger: {
                trigger: el,
                start: "top 80%",
            },
        });
    });

    gsap.utils.toArray("[fd-fade-children]").forEach((el) => {
        gsap.fromTo(
            el.children,
            {
                opacity: 0,
                y: 25,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                stagger: 0.12,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                },
            },
        );
    });

    gsap.utils.toArray("[fd-fade]").forEach((el) => {
        gsap.fromTo(
            el,
            {
                opacity: 0,
                y: 20,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.3,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 80%",
                },
            },
        );
    });

    const splides = document.querySelectorAll(".splide.is-case-studies");

    splides.forEach((el, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        const instance = new Splide(el, {
            type: "loop",
            gap: "8px",
            pagination: false,
            autoWidth: true,
            arrows: false,
            drag: false,
            autoScroll: {
                speed: 1 * direction,
                pauseOnHover: true,
                pauseOnFocus: false,
            },
        }).mount(window.splide.Extensions);
    });

    const processWrap = document.querySelectorAll(".process_wrap");
    const processSteps = document.querySelectorAll(".process_steps");
    const processLinesWrap = document.querySelectorAll(".process_lines-wrap");
    const processCTA = document.querySelectorAll(".process_cta");
    const processP = document.querySelectorAll(".process_text");
    const processVLine = document.querySelectorAll(".process_progress-vertical");
    const tagText = new SplitText(".process_tag-text", {
        types: "chars, words",
        charsClass: "tag-char",
        autoSplit: true,
    });
    gsap
        .timeline({
            scrollTrigger: {
                trigger: ".process_step1",
                start: "top 80%",
                end: "bottom 50%",
                scrub: 1,
            },
            defaults: {
                ease: "none",
            },
        })
        .from(".process_start", { opacity: 0, yPercent: 100 })
        .from(processCTA[0], { opacity: 0, yPercent: 100 }, "<50%")
        .from(".process_progress-horizontal, .process_lines-wrap", {
            opacity: 0,
        })
        .to(
            ".process_step1 .process_progress",
            {
                width: "100%",
                transformOrigin: "left center",
            },
            "<",
        )
        .to(processCTA[0], {
            color: "white",
            backgroundColor: "#0b4fff",
            borderColor: "#0b4fff",
        });

    processSteps.forEach((step) => {
        const cta = step.querySelector(".process_cta");
        const text = step.querySelector(".process_text");
        const sibling = step.querySelector("[data-card]");

        gsap
            .timeline({
                scrollTrigger: {
                    trigger: step,
                    start: "top 80%",
                    end: "top 60%",
                    scrub: 1,
                },
                defaults: {
                    ease: "none",
                },
            })
            .from(cta, { opacity: 0, duration: 0.5 })
            .to({}, { duration: 0.5 })
            .to(cta, {
                color: "white",
                backgroundColor: "#0b4fff",
                borderColor: "#0b4fff",
            })
            .from(text, { y: 32, opacity: 0, filter: "blur(5px)" }, "<0.1")
            .from(sibling, { y: 32, opacity: 0, filter: "blur(5px)" }, "<");
    });

    if (!isMobile) {
        processLinesWrap.forEach((wrap) => {
            const whiteLine = wrap.querySelector("#process-blue");
            const chars = wrap.querySelectorAll(".tag-char");
            const tag = wrap.querySelector(".process_tag");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrap,
                    start: "top 75%",
                    end: "bottom 50%",
                    scrub: 1,
                },
            });

            tl.from(whiteLine, {
                drawSVG: 0,
                ease: "none",
            }).from(
                chars,
                {
                    opacity: 0,
                    filter: "blur(2px)",
                    stagger: {
                        from: "center",
                        each: 0.005,
                    },
                    ease: "none",
                },
                "<35%",
            );
        });
    } else {
        processLinesWrap.forEach((wrap) => {
            const chars = wrap.querySelectorAll(".tag-char");
            const tag = wrap.querySelector(".process_tag");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrap,
                    start: "top 75%",
                    end: "bottom 70%",
                    scrub: 1,
                },
            });

            tl.from(chars, {
                opacity: 0,
                filter: "blur(2px)",
                stagger: {
                    from: "center",
                    each: 0.005,
                },
                ease: "none",
            });
        });
    }
    if (!isMobile) {
        processVLine.forEach((line) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: line.parentElement,
                    start: "top 80%",
                    end: "bottom 60%",
                    scrub: 1,
                },
            });

            tl.to(line.querySelector(".process_progress2"), {
                height: "100%",
                ease: "none",
            });
        });
    } else {
        const lines = gsap.utils.toArray(".process_line-mbl, .process_card2-line");
        lines.forEach((line) => {
            gsap.to(line.querySelector(".process_progress2"), {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: line,
                    start: "top center",
                    end: "bottom 70%",
                    scrub: 1,
                },
            });
        });

        const blueLines = gsap.utils.toArray(".process_lines-mbl");

        blueLines.forEach((line) => {
            const path = line.querySelector("#process-m-blue");
            if (!path) return;

            const inverse = path.hasAttribute("data-inverse");

            gsap.fromTo(
                path,
                { drawSVG: inverse ? "100% 100%" : "0% 0%" },
                {
                    drawSVG: inverse ? "0% 100%" : "0% 100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: line,
                        start: "top 50%",
                        end: "bottom 70%",
                        scrub: 1,
                    },
                },
            );
        });
    }

    const parallaxConfig = [
        { attr: "parallax-large", min: 300, max: 400 },
        { attr: "parallax-medium", min: 150, max: 250 },
        { attr: "parallax-small", min: 5, max: 20 },
    ];

    parallaxConfig.forEach(({ attr, min, max }) => {
        document.querySelectorAll(`[${attr}]`).forEach((card) => {
            const from = gsap.utils.random(min, max);
            const to = gsap.utils.random(min, max);

            gsap
                .timeline({
                    scrollTrigger: {
                        trigger: card.parentElement,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1,
                    },
                })
                .fromTo(card, { yPercent: from }, { yPercent: -to, ease: "none" });
        });
    });

    gsap.from(".process_card3 > *", {
        scrollTrigger: {
            trigger: ".process_card3",
            start: "top center",
            toggleActions: "play none none reverse",
        },
        x: gsap.utils.random(64, -64),
        opacity: 0,
        filter: "blur(10px)",
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
    });

    const projectBrief = document.querySelector("[project-brief]");
    const projectTop = gsap.utils.toArray(projectBrief.querySelectorAll(".process_step2-top"));

    const projectBriefP = new SplitText(projectBrief.querySelector("p"), {
        types: "lines",
        mask: "lines",
        autoSplit: true,
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: projectBrief,
            start: "top center",
            toggleActions: "play none none reverse",
        },
    });

    tl.from(projectBrief.querySelector(".process_h"), {
        yPercent: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
    })
        .from(
            projectBriefP.lines,
            {
                yPercent: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power4.out",
            },
            "<0.2",
        )
        .from(
            projectBrief.querySelectorAll(".process_step2-border"),
            {
                width: "0%",
                duration: 1.2,
                ease: "power1.inOut",
            },
            "<0.1",
        )

        .from(
            projectBrief.querySelectorAll(".process_step2-progress"),
            {
                width: "0%",
                duration: 1.2,
                stagger: 0.1,
                ease: "power1.inOut",
            },
            "<0.2",
        );
    projectTop.forEach((top) => {
        tl.from(
            top.querySelectorAll("*"),
            {
                y: 32,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power4.out",
            },
            "<0.05",
        );
    });

    if (!isMobile) {
        gsap
            .timeline({
                scrollTrigger: {
                    trigger: ".process_card2",
                    start: "top 70%",
                    end: "bottom 80%",
                    scrub: 1,
                },
            })
            .from(".process_step3-card", {
                y: 60,
                opacity: 0,
                duration: 1.2,
                stagger: {
                    from: "center",
                    each: 0.1,
                },
                ease: "back.out(1.7)",
            })
            .from(
                "[step3-l1]",
                {
                    scaleY: 0,
                    transformOrigin: "50% 0%",
                    duration: 1,
                    stagger: {
                        from: "center",
                        each: 0.1,
                    },
                    ease: "power4.out",
                },
                "-=0.2",
            )
            .from(
                ".process_step-card1.is-alt",
                {
                    y: -10,
                    opacity: 0,
                    duration: 1,
                    stagger: {
                        from: "center",
                        each: 0.1,
                    },
                    ease: "power4.out",
                },
                "-=0.1",
            )
            .from(
                ".process_card2 .hero_step3-img",
                {
                    scale: 1.5,
                    opacity: 0,
                    duration: 1,
                    stagger: {
                        from: "center",
                        each: 0.1,
                    },
                    ease: "power4.out",
                },
                "<",
            )
            .from(
                "[step3-l2]",
                {
                    scaleY: 0,
                    transformOrigin: "50% 0%",
                    duration: 2,
                    stagger: {
                        from: "edges",
                        each: 0.2,
                    },
                    ease: "power3.inOut",
                },
                "-=0.2",
            )
            .from(
                ".process_step3-tag",
                {
                    y: (i, el) => {
                        const progress = el.closest(".process_step3-item")?.querySelector(".process_step3-progress");

                        return progress ? -progress.offsetHeight : -100;
                    },
                    scale: 0,
                    opacity: 0,
                    transformOrigin: "50% 0%",
                    duration: 2,
                    stagger: {
                        from: "edges",
                        each: 0.2,
                    },
                    ease: "power3.inOut",
                },
                "<",
            );
    } else {
        gsap.utils.toArray(".process_step3-col").forEach((col) => {
            const card = col.querySelector(".process_step3-card");
            const progress = col.querySelectorAll(".process_step3-progress");
            const card1 = col.querySelector(".process_step-card1");
            const tag = col.querySelector(".process_step3-tag");

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: col,
                    start: "top 70%",
                    end: "bottom 70%",
                    scrub: 1,
                },
            });

            tl.from(card, {
                opacity: 0,
                duration: 0.3,
            });

            tl.fromTo(
                progress[0],
                { clipPath: "inset(0% 0% 100% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4 },
            );

            tl.from(card1, {
                opacity: 0,
                duration: 0.3,
            });

            tl.fromTo(
                progress[1],
                { clipPath: "inset(0% 0% 100% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4 },
            );

            tl.from(tag, {
                opacity: 0,
                scale: 0,
                transformOrigin: "top center",
                duration: 0.3,
            });
        });
    }

    const message = document.querySelectorAll(".process_card4-message");
    message.forEach((msg) => {
        gsap
            .timeline({
                scrollTrigger: {
                    trigger: msg,
                    start: "top 70%",
                    toggleActions: "play none none reverse",
                },
            })
            .from(msg, {
                scale: 0,
                opacity: 0,
                transformOrigin: "right top",
                duration: 0.6,
                ease: "back.inOut(0.5)",
            });
    });
    const card4Wrap = document.querySelectorAll(".process_card4-wrap");
    card4Wrap.forEach((msg) => {
        gsap
            .timeline({
                scrollTrigger: {
                    trigger: msg,
                    start: "top 70%",
                    toggleActions: "play none none reverse",
                },
            })
            .from(msg, {
                scale: 0,
                opacity: 0,
                transformOrigin: "left top",
                duration: 0.6,
                ease: "back.inOut(0.5)",
            });
    });

    gsap
        .timeline({
            scrollTrigger: {
                trigger: card4Wrap[0],
                start: "top 70%",
                toggleActions: "play none none reverse",
            },
        })
        .from(card4Wrap[0].querySelectorAll(".process_card4-topper > *"), {
            y: 20,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
        })
        .from(
            "#msg1-line",
            {
                drawSVG: 0,
                duration: 1.2,
                ease: "power3.out",
            },
            "-=0.5",
        )
        .from(
            "#msg1-grad, #msg1-text",
            {
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
            },
            "<0.3",
        );

    const card4Wrap2 = card4Wrap[1].querySelector(".process_card4-topper");
    gsap
        .timeline({
            scrollTrigger: {
                trigger: card4Wrap[1],
                start: "top 70%",
                toggleActions: "play none none reverse",
            },
        })
        .from(card4Wrap2.children, {
            y: 20,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2,
            ease: "power3.out",
        });

    const projectPlan = document.querySelector("[project-plan]");

    const projectPlanTop = gsap.utils.toArray(projectPlan.querySelectorAll(".process_step2-top"));

    const projectPlanP = new SplitText(projectPlan.querySelector("p"), {
        types: "lines",
        mask: "lines",
        autoSplit: true,
    });

    const projectPlantl = gsap.timeline({
        scrollTrigger: {
            trigger: projectPlan,
            start: "top 70%",
            toggleActions: "play none none reverse",
        },
    });

    projectPlantl
        .from(projectPlan.querySelector(".process_h"), {
            yPercent: 100,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
        })
        .from(
            projectPlanP.lines,
            {
                yPercent: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power4.out",
            },
            "<0.2",
        )
        .from(
            projectPlan.querySelectorAll(".process_step2-border"),
            {
                width: "0%",
                duration: 1.2,
                ease: "power1.inOut",
            },
            "<0.1",
        )
        .from(
            projectPlan.querySelectorAll(".process_step2-progress"),
            {
                width: "0%",
                duration: 1.2,
                stagger: 0.1,
                ease: "power1.inOut",
            },
            "<0.2",
        );

    projectPlanTop.forEach((top) => {
        projectPlantl.from(
            top.querySelectorAll("*"),
            {
                y: 32,
                opacity: 0,
                duration: 1,
                stagger: 0.05,
                ease: "power4.out",
            },
            "<0.05",
        );
    });

    const trustedCards = gsap.utils.toArray(".trusted_card");

    trustedCards.forEach((card, index) => {
        const line = card.querySelector(".trusted_line");
        const icon = card.querySelector(".trusted_icon");
        const heading = card.querySelector(".heading-style-h3");
        const text = card.querySelector(".text-style-supermuted");

        const splitHeading = new SplitText(heading, {
            types: "words",
            autoSplit: true,
        });
        const splitText = new SplitText(text, {
            types: "lines",
            mask: "lines",
            autoSplit: true,
        });

        gsap.set(line, { height: "0%" });
        gsap.set(icon, { opacity: 0, y: 32 });
        gsap.set(splitHeading.words, { yPercent: 100, opacity: 0 });
        gsap.set(splitText.lines, { yPercent: 100, opacity: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: "top 70%",
            },
            delay: index * 0.2,
        });

        tl.to(line, {
            height: "100%",
            duration: 1,
            ease: "power3.out",
        })
            .to(
                icon,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                },
                "<0.2",
            )
            .to(
                splitHeading.words,
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: "power4.out",
                },
                "<0.1",
            )
            .to(
                splitText.lines,
                {
                    yPercent: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.08,
                    ease: "power4.out",
                },
                "<0.2",
            );
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const isMobile = window.innerWidth <= 991;
    new Splide(".splide.is-logos", {
        type: "loop",
        gap: isMobile ? "2rem" : "5rem",
        arrows: false,
        pagination: false,
        drag: false,
        autoWidth: true,
        clones: 12,
        autoScroll: {
            speed: isMobile ? 1 : 0.7,
            pauseOnHover: false,
            pauseOnFocus: false,
        },
    }).mount({ AutoScroll: window.splide.Extensions.AutoScroll });
});

