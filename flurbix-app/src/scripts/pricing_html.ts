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

const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement | null;
if (canvas) {
  const ctx = canvas.getContext("2d");
  const footer = document.getElementById("data-cta");

  if (ctx && footer) {
    // --- Config ---
    const DOT_SPACING = 42;
    const DOT_RADIUS = 3;
    const DOT_COLOR = "rgba(255, 255, 255, 0.18)";
    const LINE_WIDTH = 2.5;
    const SNAP_RADIUS = 80;
    const MIN_DISTANCE_BETWEEN_POINTS = 24;
    const MAX_TRAIL_LENGTH = 14;

    let dpr = window.devicePixelRatio || 1;
    let dots: { x: number; y: number }[] = [];
    let trail: { x: number; y: number }[] = []; // Array of snapped dot positions
    let mousePos = { x: -1000, y: -1000 };
    let lastMoveTime = Date.now();
    const IDLE_TIMEOUT = 0; // start fading immediately
    const TOTAL_FADE_TIME = 800; // fully gone in 800ms

    function resize() {
      if (!footer || !canvas || !ctx) return;
      const rect = footer.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots(rect.width, rect.height);
    }

    function buildDots(w: number, h: number) {
      dots = [];
      const offsetX = (w % DOT_SPACING) / 2;
      const offsetY = (h % DOT_SPACING) / 2;
      for (let x = offsetX; x <= w; x += DOT_SPACING) {
        for (let y = offsetY; y <= h; y += DOT_SPACING) {
          dots.push({ x, y });
        }
      }
    }

    function getClosestDot(px: number, py: number) {
      let closest: { x: number; y: number } | null = null;
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

    function addToTrail(dot: { x: number; y: number } | null) {
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
      if (!footer || !ctx) return;
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

      requestAnimationFrame(draw);
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

    footer.addEventListener("mouseleave", () => {
      mousePos.x = -1000;
      mousePos.y = -1000;
    });

    window.addEventListener("resize", resize);

    resize();
    draw();
  }
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
footerLinks.forEach((link: any) => {
  const circ = link.querySelector(".footer_circ");
  const text = link.querySelector(".footer_text");

  gsap.set(circ, { scale: 0, transformOrigin: "center center" });

  let tl = gsap
    .timeline({ paused: true })
    .to(circ, { scale: 1, duration: 0.3, ease: "power2.out" }, 0)
    .to(text, { x: "1rem", duration: 0.3, ease: "power2.out" }, 0);

  link.addEventListener("mouseenter", () => {
    tl.play();
  });

  link.addEventListener("mouseleave", () => {
    tl.reverse();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const isMobile = window.innerWidth <= 991;

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
  });

  const menuButton = document.querySelector(".navbar1_menu-button");
  if (menuButton) {
    menuButton.addEventListener("click", (e: any) => {
      document.body.style.overflow = e.currentTarget.classList.contains("w--open") ? "auto" : "hidden";
    });
  }

  gsap.set(".page-wrapper", { opacity: 1 });

  const h1 = new SplitText("[hero-heading]", {
    type: "words",
    mask: "words",
    wordsClass: "h1",
    autoSplit: true,
  });
  const p1 = new SplitText(".legal_tag", {
    type: "lines",
    mask: "lines",
    autoSplit: true,
  });

  gsap.set(".h1-mask", { paddingBottom: 20, marginBottom: -20 });

  const tl = gsap
    .timeline()
    .from(h1.words, {
      yPercent: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
    })
    .from(
      p1.lines,
      {
        yPercent: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out",
      },
      "<0.2"
    )
    .from(
      ".pricing_toggle-wrap",
      {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      },
      "<0.3"
    )
    .from(
      ".pricing_grid",
      {
        y: 32,
        opacity: 0,
        filter: "blur(5px)",
        duration: 1,
        ease: "power4.out",
      },
      0.5
    )
    .from(
      ".nav_fixed",
      {
        yPercent: -100,
        duration: 1,
        ease: "power4.out",
      },
      0.5
    );

  // Pricing Toggle Logic
  const toggle = document.getElementById("pricing-toggle");
  const monthlyLabel = document.getElementById("pricing-monthly-label");
  const annualLabel = document.getElementById("pricing-annual-label");
  const amounts = document.querySelectorAll(".pricing_card-amount:not(.is-custom)");

  if (toggle) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("is-annual");
      const isAnnual = toggle.classList.contains("is-annual");

      if (isAnnual) {
        if (monthlyLabel) monthlyLabel.style.color = "#6b7280";
        if (annualLabel) annualLabel.style.color = "#111827";
      } else {
        if (monthlyLabel) monthlyLabel.style.color = "#111827";
        if (annualLabel) annualLabel.style.color = "#6b7280";
      }

      amounts.forEach((amount) => {
        if (isAnnual) {
          const annualVal = amount.getAttribute("data-annual");
          if (annualVal) amount.textContent = annualVal;
        } else {
          const monthlyVal = amount.getAttribute("data-monthly");
          if (monthlyVal) amount.textContent = monthlyVal;
        }
      });
    });
  }
});
