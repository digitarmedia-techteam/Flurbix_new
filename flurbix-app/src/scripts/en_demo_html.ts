declare const ScrollSmoother: any;
declare const ScrollTrigger: any;
declare const Lenis: any;
declare let startPoints: any;
declare const gsap: any;
declare const SplitText: any;
declare const Splide: any;
declare const window: any;
declare const document: any;
declare const google: any;

(function (w, i, g) {
  w[g] = w[g] || [];
  if (typeof w[g].push == "function") w[g].push.apply(w[g], Array.isArray(i) ? i : [i]);
})(window, ["G-3NB4DQHMQZ"], "google_tags_first_party");

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
        type: "lines",
        mask: "lines",
        linesClass: "h1-lines",
      });
      const p1 = new SplitText(".hero_p", {
        type: "lines",
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
        .timeline({ onComplete: sequence })
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
          { promptIn: 0, dataAttr: "data-step1", textAttr: "text2" },
          { promptIn: 1, dataAttr: "data-step2", textAttr: "text3" },
          { promptIn: 2, dataAttr: "data-step3", textAttr: "text1" },
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
            .to(prompt[promptIn], { opacity: 0, duration: 1, ease: "power4.out" }, "<")
            .to(prompt[promptIn + 1], { opacity: 1, duration: 1, ease: "power4.out" }, "<")
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

document.addEventListener("DOMContentLoaded", function () {
  const isMobile = window.innerWidth <= 991;

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true,
  });

  document.querySelector(".navbar1_menu-button").addEventListener("click", (e) => {
    document.body.style.overflow = e.currentTarget.classList.contains("w--open") ? "auto" : "hidden";
  });

  gsap.set(".page-wrapper", { opacity: 1 });
  const h1 = new SplitText("[hero-heading]", {
    type: "words",
    mask: "words",
    wordsClass: "h1",
    autoSplit: true,
  });
  const p1 = new SplitText(".hero_p", {
    type: "lines",
    mask: "lines",
    autoSplit: true,
  });
  gsap.set(".h1-mask", { paddingBottom: 10, marginBottom: -10 });
  const tl = gsap
    .timeline({
      onComplete: () => {
        gsap.set("#line-blue", { opacity: 1 });

        gsap.utils.toArray("#line-blue").forEach((path) => {
          const duration = gsap.utils.random(3, 6);
          const segment = gsap.utils.random(8, 25);
          const startPos = gsap.utils.random(0, 100);

          gsap.fromTo(
            path,
            { drawSVG: `${startPos}% ${startPos + segment}%` },
            {
              drawSVG: `${startPos + 100}% ${startPos + 100 + segment}%`,
              duration: duration,
              ease: "none",
              repeat: -1,
            },
          );
        });
      },
    })
    .from(h1.words, {
      yPercent: 100,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: "power4.out",
    })
    .from(
      ".demo_flurbix .demo_tag",
      {
        y: 32,
        opacity: 0,
        filter: "blur(5px)",
        duration: 1,
        ease: "power4.out",
      },
      "<0.3",
    )
    .from(
      ".demo_bullet",
      {
        y: 32,
        opacity: 0,
        filter: "blur(5px)",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      },
      "<0.3",
    )
    .from(
      ".nav_fixed",
      {
        yPercent: -100,
        duration: 1,
        ease: "power4.out",
      },
      0.5,
    );
  if (!!isMobile) {
    tl.from(
      ".demo_form-wrap",
      {
        y: 32,
        opacity: 0,
        filter: "blur(5px)",
        duration: 1,
        ease: "power4.out",
      },
      0,
    )
      .from(
        ".form_field-wrapper",
        {
          y: 32,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        },
        "<0.3",
      )
      .from(
        ".form_label",
        {
          x: 32,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        },
        "<",
      )
      .from(
        "#line-white",
        {
          drawSVG: 0,
          duration: 5,
          stagger: 0.3,
          ease: "power2.inOut",
        },
        0,
      );
  } else {
    gsap.from(".demo_form-wrap", {
      y: 32,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".demo_form-wrap",
        start: "top 70%",
      },
    });

    gsap.utils.toArray(".form_field-wrapper").forEach((field) => {
      gsap.from(field, {
        y: 10,
        opacity: 0,
        filter: "blur(5px)",
        willChange: "transform, opacity, filter",
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: field,
          start: "bottom 95%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => {
          gsap.set(field, { clearProps: "willChange" });
        },
      });
    });
  }

  gsap.set("#line-blue", { opacity: 0 });

  if (!!isMobile) {
    function updateSliderWidth() {
      const form = document.querySelector(".demo_form-wrap");
      const slider = document.querySelector(".demo_slider-wrap");

      if (!form || !slider) return;

      const leftOffset = form.getBoundingClientRect().left;
      slider.style.width = `${leftOffset}px`;
    }

    updateSliderWidth();
    window.addEventListener("resize", updateSliderWidth);
  }
  gsap.utils.toArray(".heading-style-h2, [fd-h2]").forEach((el) => {
    if (el.hasAttribute("prevent")) return;
    const split = new SplitText(el, {
      type: "words",
      mask: "words",
      wordsClass: "h2",
      autoSplit: true,
    });
    gsap.set(".h2-mask", { paddingBottom: 20, marginBottom: -20 });

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
      type: "lines",
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
});

document.addEventListener("DOMContentLoaded", function () {
  const isMobile = window.innerWidth <= 991;
  if (document.querySelector(".splide.is-logos")) {
    new Splide(".splide.is-logos", {
      type: "loop",
      gap: isMobile ? "2rem" : "5rem",
      arrows: false,
      pagination: false,
      drag: false,
      clones: 12,
      autoWidth: true,
      autoScroll: {
        speed: isMobile ? 1 : 0.7,
        pauseOnHover: false,
        pauseOnFocus: false,
      },
    }).mount({ AutoScroll: window.splide.Extensions.AutoScroll });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("email-form") as HTMLFormElement;
  if (!form) return;

  const submitBtn = document.getElementById("submit-btn") as HTMLInputElement;

  // Validation Patterns
  const nameRegex = /^[a-zA-Z\s\-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9\+\s]{10,15}$/;
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

  const validateField = (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, regex?: RegExp, required: boolean = true, showErrors: boolean = true) => {
    let isValid = true;
    let errorMsg = "";
    const val = field.value.trim();

    if (required && val.length === 0) {
      isValid = false;
      errorMsg = "This field is required.";
    } else if (val.length > 0) {
      if (field.id === "firstname" || field.id === "lastname") {
        if (val.length < 2) {
          isValid = false;
          errorMsg = "Minimum 2 characters required.";
        }
      } else if (field.id === "Email") {
        if (!emailRegex.test(val)) {
          isValid = false;
          errorMsg = "Please enter a valid email.";
        } else {
          const domain = val.split("@")[1]?.toLowerCase();
          const freeDomains = [
            "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
            "aol.com", "icloud.com", "mail.com", "zoho.com", "protonmail.com",
            "proton.me", "yandex.com", "gmx.com", "mail.ru", "msn.com",
            "comcast.net", "sbcglobal.net", "bellsouth.net", "verizon.net"
          ];
          if (freeDomains.includes(domain)) {
            isValid = false;
            errorMsg = "Please enter a work email (e.g. name@company.com).";
          }
        }
      } else if (regex && !regex.test(val)) {
        isValid = false;
        if (field.type === "email") errorMsg = "Please enter a valid email.";
        else if (field.type === "tel" || field.id === "Phone") errorMsg = "Please enter a valid phone number (10-15 digits).";
        else if (field.id === "website") errorMsg = "Please enter a valid website URL.";
        else if (field.id === "linkedin") errorMsg = "Please enter a valid LinkedIn URL.";
        else errorMsg = "Invalid format.";
      }
    } else if (!required && val.length === 0) {
      isValid = true;
    }

    const errorContainer = document.getElementById(`${field.id}-error`);
    if (isValid) {
      field.classList.remove("is-invalid");
      if (val.length > 0) field.classList.add("is-valid");
      else field.classList.remove("is-valid");

      if (errorContainer) {
        errorContainer.classList.remove("is-visible");
        errorContainer.textContent = "";
      }
    } else {
      field.classList.remove("is-valid");
      if (showErrors || field.classList.contains("is-invalid")) {
        field.classList.add("is-invalid");
        if (errorContainer) {
          errorContainer.textContent = errorMsg;
          errorContainer.classList.add("is-visible");
        }
      }
    }

    return isValid;
  };

  const checkFormValidity = () => {
    const isFirstNameValid = validateField(document.getElementById("firstname") as HTMLInputElement, undefined, true, false);
    const isLastNameValid = validateField(document.getElementById("lastname") as HTMLInputElement, undefined, true, false);
    const isEmailValid = validateField(document.getElementById("Email") as HTMLInputElement, emailRegex, true, false);
    const isCompanyValid = validateField(document.getElementById("company") as HTMLInputElement, undefined, true, false);

    const phoneInput = document.getElementById("Phone") as HTMLInputElement;
    const isPhoneValid = validateField(phoneInput, phoneRegex, true, false);

    const websiteInput = document.getElementById("website") as HTMLInputElement;
    const isWebsiteValid = validateField(websiteInput, urlRegex, true, false);

    const linkedinInput = document.getElementById("linkedin") as HTMLInputElement;
    const isLinkedinValid = validateField(linkedinInput, urlRegex, false, false);

    const challengeSelect = document.getElementById("challenge") as HTMLSelectElement;
    const isChallengeValid = validateField(challengeSelect, undefined, true, false);

    let isOtherChallengeValid = true;
    const otherChallengeInput = document.getElementById("other_challenge") as HTMLInputElement;
    if (challengeSelect.value === "Others") {
      isOtherChallengeValid = validateField(otherChallengeInput, undefined, true, false);
    } else {
      otherChallengeInput.classList.remove("is-invalid");
      const otherError = document.getElementById("other_challenge-error");
      if (otherError) {
        otherError.classList.remove("is-visible");
        otherError.textContent = "";
      }
    }

    if (isFirstNameValid && isLastNameValid && isEmailValid && isCompanyValid && isPhoneValid && isWebsiteValid && isLinkedinValid && isChallengeValid && isOtherChallengeValid) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  };

  // Textarea Counters
  const setupCounter = (textareaId: string, maxLen: number) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    const counter = document.getElementById(`${textareaId}-counter`);

    if (textarea && counter) {
      const updateCounter = () => {
        let len = textarea.value.length;
        if (len > maxLen) {
          textarea.value = textarea.value.substring(0, maxLen);
          len = maxLen;
        }
        counter.textContent = `${len}/${maxLen}`;

        counter.classList.remove("is-near-limit", "is-at-limit");
        if (len === maxLen) {
          counter.classList.add("is-at-limit");
        } else if (len >= maxLen * 0.9) {
          counter.classList.add("is-near-limit");
        }
      };

      textarea.addEventListener("input", () => {
        updateCounter();
        validateField(textarea, undefined, textarea.required);
        checkFormValidity();
      });
      updateCounter();
    }
  };

  setupCounter("Details", 300);

  const challengeSelect = document.getElementById("challenge") as HTMLSelectElement;
  const otherChallengeWrapper = document.getElementById("other-challenge-wrapper") as HTMLDivElement;
  if (challengeSelect && otherChallengeWrapper) {
    challengeSelect.addEventListener("change", () => {
      if (challengeSelect.value === "Others") {
        otherChallengeWrapper.style.display = "block";
        (document.getElementById("other_challenge") as HTMLInputElement).required = true;
      } else {
        otherChallengeWrapper.style.display = "none";
        (document.getElementById("other_challenge") as HTMLInputElement).required = false;
        (document.getElementById("other_challenge") as HTMLInputElement).value = "";
      }
      checkFormValidity();
    });
  }

  // Attach Input & Blur Events
  const allFields = form.querySelectorAll(".form_input");
  allFields.forEach((field) => {
    field.addEventListener("input", () => {
      checkFormValidity();
    });
    field.addEventListener("blur", () => {
      let regex;
      let required = (field as HTMLInputElement).required;
      if (field.id === "Email") regex = emailRegex;
      if (field.id === "Phone") regex = phoneRegex;
      if (field.id === "website" || field.id === "linkedin") regex = urlRegex;
      validateField(field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, regex, required, true);
      checkFormValidity();
    });
  });

  // Submit Handler: opens calendar modal instead of submitting directly
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Enforce visual validation on all fields
    const isFirstNameValid = validateField(document.getElementById("firstname") as HTMLInputElement, undefined, true, true);
    const isLastNameValid = validateField(document.getElementById("lastname") as HTMLInputElement, undefined, true, true);
    const isEmailValid = validateField(document.getElementById("Email") as HTMLInputElement, emailRegex, true, true);
    const isCompanyValid = validateField(document.getElementById("company") as HTMLInputElement, undefined, true, true);

    const phoneInput = document.getElementById("Phone") as HTMLInputElement;
    const isPhoneValid = validateField(phoneInput, phoneRegex, true, true);

    const websiteInput = document.getElementById("website") as HTMLInputElement;
    const isWebsiteValid = validateField(websiteInput, urlRegex, true, true);

    const linkedinInput = document.getElementById("linkedin") as HTMLInputElement;
    const isLinkedinValid = validateField(linkedinInput, urlRegex, false, true);

    const challengeSelect = document.getElementById("challenge") as HTMLSelectElement;
    const isChallengeValid = validateField(challengeSelect, undefined, true, true);

    let isOtherChallengeValid = true;
    const otherChallengeInput = document.getElementById("other_challenge") as HTMLInputElement;
    if (challengeSelect.value === "Others") {
      isOtherChallengeValid = validateField(otherChallengeInput, undefined, true, true);
    }

    if (!(isFirstNameValid && isLastNameValid && isEmailValid && isCompanyValid && isPhoneValid && isWebsiteValid && isLinkedinValid && isChallengeValid && isOtherChallengeValid)) {
      submitBtn.disabled = true;
      return;
    }

    // Form is valid! Open the calendar modal.
    openCalendarModal();
  });

  // --- Calendar Booking Implementation ---
  // --- Google Calendar API Configuration ---
  const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "317932010265-j54r2uhl121kjgrvm744foua38l4o3kv.apps.googleusercontent.com";
  const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
  let tokenClient: any = null;

  // Initialize GIS client
  const initGoogleClient = () => {
    if (typeof google !== "undefined" && google.accounts && google.accounts.oauth2) {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: CALENDAR_SCOPE,
        callback: "", // callback will be defined dynamically at request time
      });
    }
  };

  // Try to initialize immediately or check back later
  if (typeof google !== "undefined") {
    initGoogleClient();
  } else {
    window.addEventListener("load", initGoogleClient);
  }

  const requestGoogleAccessToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        initGoogleClient();
      }
      if (!tokenClient) {
        reject(new Error("Google Identity Services SDK is not loaded."));
        return;
      }

      tokenClient.callback = (response: any) => {
        if (response.error !== undefined) {
          reject(response);
        } else {
          resolve(response.access_token);
        }
      };

      tokenClient.requestAccessToken({ prompt: "consent" });
    });
  };

  const createGoogleCalendarEvent = async (
    accessToken: string,
    data: any,
    startDateTime: Date,
    endDateTime: Date
  ): Promise<any> => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const event = {
      summary: "Flurbix Demo Meeting",
      description: `Demo session with Flurbix.\n\nContact Details:\n- Name: ${data.firstName} ${data.lastName}\n- Company: ${data.company}\n- Email: ${data.email}\n- Phone: ${data.phone}\n- Challenge: ${data.challenge}\n- Details: ${data.details}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timeZone,
      },
      attendees: [
        { email: data.email, responseStatus: "accepted" },
        { email: "sales@flurbix.com" }
      ],
      conferenceData: {
        createRequest: {
          requestId: "flurbix-demo-" + Date.now(),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    };

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      }
    );

    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message || "Failed to create Google Calendar event");
    }
    return result;
  };

  const calendarModal = document.getElementById("calendar-modal") as HTMLDivElement;
  const calendarModalClose = document.getElementById("calendar-modal-close") as HTMLButtonElement;
  const calendarCancel = document.getElementById("calendar-cancel") as HTMLButtonElement;
  const prevMonthBtn = document.getElementById("prev-month") as HTMLButtonElement;
  const nextMonthBtn = document.getElementById("next-month") as HTMLButtonElement;
  const calendarMonthYear = document.getElementById("calendar-month-year") as HTMLSpanElement;
  const calendarDaysContainer = document.getElementById("calendar-days") as HTMLDivElement;
  const calendarSlotsDateLabel = document.getElementById("calendar-slots-date") as HTMLDivElement;
  const calendarSlotsContainer = document.getElementById("calendar-slots") as HTMLDivElement;
  const confirmBookingBtn = document.getElementById("confirm-booking-btn") as HTMLButtonElement;

  let currentDateObj = new Date();
  let selectedDateObj: Date | null = null;
  let selectedTimeSlot: string | null = null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:30 PM", "02:30 PM", "03:30 PM", "04:30 PM"];

  // Return pre-seeded booked slots for a given date deterministically
  const getPreseededBookedSlots = (date: Date): string[] => {
    return [];
  };

  const getUserBookedSlots = (): { dateStr: string; slot: string }[] => {
    try {
      const raw = localStorage.getItem("flurbix_user_booked_slots");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const saveUserBookedSlot = (dateStr: string, slot: string) => {
    try {
      const booked = getUserBookedSlots();
      booked.push({ dateStr, slot });
      localStorage.setItem("flurbix_user_booked_slots", JSON.stringify(booked));
    } catch (e) {
      console.error(e);
    }
  };

  const isSlotBooked = (dateStr: string, slot: string, dateObj: Date): boolean => {
    const preseeded = getPreseededBookedSlots(dateObj);
    if (preseeded.includes(slot)) return true;

    const userBooked = getUserBookedSlots();
    return userBooked.some(b => b.dateStr === dateStr && b.slot === slot);
  };

  const renderCalendar = () => {
    const year = currentDateObj.getFullYear();
    const month = currentDateObj.getMonth();

    calendarMonthYear.textContent = `${months[month]} ${year}`;
    calendarDaysContainer.innerHTML = "";

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement("div");
      calendarDaysContainer.appendChild(emptyDiv);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day-cell";
      btn.textContent = String(day);

      const dayOfWeek = cellDate.getDay();
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

      if (cellDate.getTime() === today.getTime()) {
        btn.classList.add("is-today");
      }

      if (selectedDateObj &&
        selectedDateObj.getFullYear() === year &&
        selectedDateObj.getMonth() === month &&
        selectedDateObj.getDate() === day) {
        btn.classList.add("is-selected");
      }

      if (cellDate < today || isWeekend) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          selectedDateObj = cellDate;
          selectedTimeSlot = null; // reset slot selection
          confirmBookingBtn.disabled = true;

          renderCalendar();
          renderSlotsForDate(cellDate, cellDateString);
        });
      }

      calendarDaysContainer.appendChild(btn);
    }

    const currentYearMonth = new Date();
    currentYearMonth.setDate(1);
    currentYearMonth.setHours(0, 0, 0, 0);
    const viewingYearMonth = new Date(year, month, 1);
    prevMonthBtn.disabled = (viewingYearMonth <= currentYearMonth);
  };

  const renderSlotsForDate = (dateObj: Date, dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    calendarSlotsDateLabel.textContent = dateObj.toLocaleDateString('en-US', options);
    calendarSlotsContainer.innerHTML = "";

    timeSlots.forEach(slot => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot-button";
      btn.textContent = slot;

      const booked = isSlotBooked(dateStr, slot, dateObj);
      if (booked) {
        btn.classList.add("is-booked");
        btn.disabled = true;
      } else {
        if (selectedTimeSlot === slot) {
          btn.classList.add("is-selected");
        }

        btn.addEventListener("click", () => {
          const prevSelected = calendarSlotsContainer.querySelector(".slot-button.is-selected");
          if (prevSelected) prevSelected.classList.remove("is-selected");

          selectedTimeSlot = slot;
          btn.classList.add("is-selected");
          confirmBookingBtn.disabled = false;
        });
      }

      calendarSlotsContainer.appendChild(btn);
    });
  };

  prevMonthBtn.addEventListener("click", () => {
    currentDateObj.setMonth(currentDateObj.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDateObj.setMonth(currentDateObj.getMonth() + 1);
    renderCalendar();
  });

  const openCalendarModal = () => {
    calendarModal.classList.add("is-open");
    currentDateObj = selectedDateObj || new Date();
    renderCalendar();

    if (selectedDateObj) {
      const year = selectedDateObj.getFullYear();
      const month = selectedDateObj.getMonth();
      const day = selectedDateObj.getDate();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      renderSlotsForDate(selectedDateObj, dateStr);
    } else {
      calendarSlotsDateLabel.textContent = "Select a date to view available times";
      calendarSlotsContainer.innerHTML = "";
      confirmBookingBtn.disabled = true;
    }
  };

  const closeCalendarModal = () => {
    calendarModal.classList.remove("is-open");
  };

  calendarModalClose.addEventListener("click", closeCalendarModal);
  calendarCancel.addEventListener("click", closeCalendarModal);

  confirmBookingBtn.addEventListener("click", async () => {
    if (!selectedDateObj || !selectedTimeSlot) return;

    if (!tokenClient) {
      initGoogleClient();
    }
    if (!tokenClient) {
      alert("Google Identity Services SDK is not loaded. Please try again.");
      return;
    }

    // 1. Request access token FIRST synchronously/directly in the user click interaction
    let googleAccessToken = "";
    try {
      googleAccessToken = await requestGoogleAccessToken();
    } catch (authError: any) {
      console.warn("Google Calendar save failed or cancelled.", authError);

      // Check if user dismissed the popup
      if (authError && authError.error === "dismissed") {
        alert("Booking cancelled: Google sign-in was closed before completion.");
      } else {
        alert("Booking cancelled: Google Calendar authorization was denied or failed. Please try again.");
      }
      return; // Stop execution early
    }

    // 2. Only disable button and update text AFTER successful authorization
    confirmBookingBtn.disabled = true;
    const originalConfirmText = confirmBookingBtn.textContent;
    confirmBookingBtn.textContent = "Scheduling...";

    // Collect form data
    const data = {
      firstName: (document.getElementById("firstname") as HTMLInputElement).value.trim(),
      lastName: (document.getElementById("lastname") as HTMLInputElement).value.trim(),
      email: (document.getElementById("Email") as HTMLInputElement).value.trim(),
      company: (document.getElementById("company") as HTMLInputElement).value.trim(),
      website: (document.getElementById("website") as HTMLInputElement).value.trim(),
      linkedin: (document.getElementById("linkedin") as HTMLInputElement).value.trim(),
      phone: (document.getElementById("Phone") as HTMLInputElement).value.trim(),
      challenge: (document.getElementById("challenge") as HTMLSelectElement).value.trim(),
      otherChallenge: (document.getElementById("other_challenge") as HTMLInputElement).value.trim(),
      details: (document.getElementById("Details") as HTMLTextAreaElement).value.trim()
    };

    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth();
    const day = selectedDateObj.getDate();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const meetingTimeStr = selectedTimeSlot;

    let hour = parseInt(meetingTimeStr.split(":")[0]);
    const minute = parseInt(meetingTimeStr.split(":")[1].split(" ")[0]);
    const isPm = meetingTimeStr.includes("PM");
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;

    const startDateTime = new Date(year, month, day, hour, minute);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 mins

    const formatDateICS = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const readableDate = selectedDateObj.toLocaleDateString('en-US', dateOptions);
    const fullMeetingDetails = `${readableDate} at ${meetingTimeStr} (30 mins)`;

    let googleCalendarSaved = false;
    let hangoutMeetUrl = "";

    // 3. Create Google Calendar Event
    try {
      const calendarResult = await createGoogleCalendarEvent(googleAccessToken, data, startDateTime, endDateTime);
      googleCalendarSaved = true;
      if (calendarResult && calendarResult.hangoutLink) {
        hangoutMeetUrl = calendarResult.hangoutLink;
      }
    } catch (calendarError: any) {
      console.warn("Google Calendar event creation failed.", calendarError);
      confirmBookingBtn.textContent = originalConfirmText;
      confirmBookingBtn.disabled = false;
      alert("Booking failed: Failed to schedule calendar event. Please try again.");
      return; // Stop execution: do not send email or show success screen
    }

    // Google Calendar Link
    const googleCalUrl = `https://calendar.google.com/render?action=TEMPLATE&text=Flurbix+Demo+Meeting&dates=${formatDateICS(startDateTime)}/${formatDateICS(endDateTime)}&details=Demo+session+with+Flurbix.+Thank+you+for+booking!&location=${hangoutMeetUrl ? encodeURIComponent(hangoutMeetUrl) : 'Online+Meeting'}&sf=true&output=xml`;

    // Outlook Calendar Link
    const outlookCalUrl = `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=Flurbix+Demo+Meeting&startdt=${startDateTime.toISOString()}&enddt=${endDateTime.toISOString()}&body=Demo+session+with+Flurbix.+Thank+you+for+booking!${hangoutMeetUrl ? '+Join+Meet:+' + encodeURIComponent(hangoutMeetUrl) : ''}&location=${hangoutMeetUrl ? encodeURIComponent(hangoutMeetUrl) : 'Online+Meeting'}`;

    const getICSContent = () => {
      return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Flurbix//Demo Booking//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@flurbix.com`,
        `DTSTAMP:${formatDateICS(new Date())}`,
        `DTSTART:${formatDateICS(startDateTime)}`,
        `DTEND:${formatDateICS(endDateTime)}`,
        "SUMMARY:Flurbix Demo Meeting",
        `DESCRIPTION:Demo session with Flurbix. Contact: ${data.email}. Thank you for booking!${hangoutMeetUrl ? '\\nJoin Google Meet: ' + hangoutMeetUrl : ''}`,
        `LOCATION:${hangoutMeetUrl ? hangoutMeetUrl : 'Google Meet / Online'}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
    };

    const triggerICSDownload = () => {
      const ics = getICSContent();
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "flurbix_demo_meeting.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Prepare Email HTML Template
    const bodyHtml = `
<div style="font-family: 'Inter', Arial, sans-serif; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
  <div style="background-color: #0b4fff; padding: 24px; text-align: center;">
    <img src="${window.location.origin}/logo.png" alt="Flurbix Logo" style="max-height: 48px; filter: brightness(0) invert(1);" />
  </div>
  <div style="padding: 32px; background-color: #ffffff;">
    <h2 style="color: #0b4fff; margin-top: 0; font-size: 24px; font-weight: 700;">New Demo Booking & Session Scheduled</h2>
    <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">A new demo has been booked and scheduled in the calendar. Here are the session details:</p>
    
    <div style="margin: 20px 0; padding: 16px; background-color: #EFF6FF; border-left: 4px solid #0b4fff; border-radius: 4px;">
      <strong style="font-size: 16px; color: #1e3a8a;">📅 Scheduled Time:</strong>
      <span style="font-size: 16px; color: #111827; display: block; margin-top: 4px;">${fullMeetingDetails}</span>
      ${hangoutMeetUrl ? `
      <strong style="font-size: 16px; color: #1e3a8a; display: block; margin-top: 12px;">🎥 Google Meet:</strong>
      <a href="${hangoutMeetUrl}" target="_blank" style="font-size: 16px; color: #0b4fff; display: block; margin-top: 4px; text-decoration: underline;">${hangoutMeetUrl}</a>
      ` : ''}
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 15px;">
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; width: 160px; color: #374151;">Name</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; color: #111827;">${data.firstName} ${data.lastName}</td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">Work Email</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6;"><a href="mailto:${data.email}" style="color: #0b4fff; text-decoration: none;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">Company</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; color: #111827;">${data.company || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">Company Website</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6;">
          ${data.website ? `<a href="${data.website.startsWith('http') ? data.website : 'https://' + data.website}" target="_blank" style="color: #0b4fff; text-decoration: none;">${data.website}</a>` : 'N/A'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">LinkedIn Profile</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6;">
          ${data.linkedin ? `<a href="${data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin}" target="_blank" style="color: #0b4fff; text-decoration: none;">${data.linkedin}</a>` : 'N/A'}
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">Phone Number</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; color: #111827;">${data.phone || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; font-weight: 600; color: #374151;">Challenge</td>
        <td style="padding: 14px 10px; border-bottom: 1px solid #F3F4F6; color: #111827; line-height: 1.5;">${data.challenge === 'Others' ? 'Others: ' + data.otherChallenge : data.challenge}</td>
      </tr>
      <tr>
        <td style="padding: 14px 10px; font-weight: 600; color: #374151; vertical-align: top;">How Can We Help?</td>
        <td style="padding: 14px 10px; color: #111827; line-height: 1.5;">${data.details || "N/A"}</td>
      </tr>
    </table>
    
    <div style="margin-top: 32px; text-align: center;">
      <a href="${googleCalUrl}" target="_blank" style="display: inline-block; background-color: #0b4fff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Add to Google Calendar</a>
    </div>
  </div>
  <div style="background-color: #F9FAFB; padding: 20px; text-align: center; font-size: 13px; color: #6B7280; border-top: 1px solid #E5E7EB;">
    This is an automated message from the Flurbix Demo Booking System.
  </div>
</div>`;

    const userBodyHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Demo Booking Confirmed - Flurbix</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        box-shadow: none !important;
      }
      .header-col-left {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        padding: 20px 20px 10px 20px !important;
      }
      .header-col-right {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        padding: 10px 20px 20px 20px !important;
      }
      .header-col-right a {
        margin: 0 16px !important;
        display: inline-block !important;
      }
      .body-container {
        padding: 32px 20px !important;
      }
      .footer-container {
        padding: 32px 20px 24px !important;
      }
      .footer-col {
        display: block !important;
        width: 100% !important;
        padding: 0 !important;
        margin-top: 0 !important;
        margin-bottom: 32px !important;
        text-align: center !important;
      }
      .footer-col-right {
        text-align: center !important;
        margin-bottom: 0 !important;
      }
      .footer-text-left {
        max-width: 100% !important;
        text-align: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f9fafb; font-family: 'Inter', Arial, sans-serif;">
  <div class="email-container" style="font-family: 'Inter', Arial, sans-serif; color: #111827; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background-color: #ffffff; border-bottom: 1px solid #E5E7EB;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="header-col-left" align="left" valign="middle" style="padding: 16px 24px;">
            <a href="https://flurbix.com" style="text-decoration: none; display: inline-block;">
              <img src="${window.location.origin}/logo.png" alt="Flurbix Logo" style="height: 32px; vertical-align: middle; border: 0;" />
            </a>
          </td>
          <td class="header-col-right" align="right" valign="middle" style="padding: 16px 24px; font-family: 'Inter', Arial, sans-serif; font-size: 14px;">
            <a href="https://flurbix.com/about-us.html" style="color: #111827; text-decoration: none; margin-right: 24px; font-weight: 500;">About</a>
            <a href="https://flurbix.com/pricing.html" style="color: #111827; text-decoration: none; font-weight: 500;">Pricing</a>
          </td>
        </tr>
      </table>
    </div>
    
    <div class="body-container" style="padding: 40px 32px; background-color: #ffffff;">
      <h2 style="color: #111827; margin-top: 0; font-size: 24px; font-weight: 700;">Your Demo is Confirmed!</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">Hi ${data.firstName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">We are excited to schedule our personalized demo session with you. Here are your meeting details:</p>
      
      <div style="margin: 24px 0; padding: 16px; background-color: #EFF6FF; border-left: 4px solid #0b4fff; border-radius: 4px; font-family: 'Inter', Arial, sans-serif;">
        <strong style="font-size: 15px; color: #1e3a8a; display: block; margin-bottom: 4px;">📅 Date & Time:</strong>
        <span style="font-size: 16px; color: #111827; font-weight: 600;">${fullMeetingDetails}</span>
        ${hangoutMeetUrl ? `
        <strong style="font-size: 15px; color: #1e3a8a; display: block; margin-top: 12px; margin-bottom: 4px;">🎥 Google Meet:</strong>
        <a href="${hangoutMeetUrl}" target="_blank" style="font-size: 16px; color: #0b4fff; font-weight: 600; text-decoration: underline;">Join Google Meet</a>
        ` : `<span style="font-size: 14px; color: #4B5563; display: block; margin-top: 6px;">Location: Online (Google Meet link will be in your calendar invite)</span>`}
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">${googleCalendarSaved ? 'This session has been saved automatically in your Google Calendar.' : 'An iCalendar invite file (.ics) has been downloaded automatically. You can also manually add it to your calendar by clicking one of the options below:'}</p>
      
      <div style="margin: 24px 0; text-align: center;">
        <a href="${googleCalUrl}" target="_blank" style="display: inline-block; background-color: #0b4fff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px; margin-bottom: 12px;">Add to Google Calendar</a>
        <a href="${outlookCalUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; border: 1px solid #D1D5DB; color: #374151; padding: 11px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-bottom: 12px;">Add to Outlook</a>
      </div>

      <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin-bottom: 32px;">If you need to make any changes to this schedule, please reply to this email.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 0;">Best regards,<br><strong style="color: #111827;">The Flurbix Team</strong></p>
    </div>
    
    <!-- Footer -->
    <div class="footer-container" style="background-color: #0b4fff; padding: 48px 32px 32px; text-align: center; font-family: 'Inter', Arial, sans-serif;">
      <div style="margin-bottom: 48px;">
        <span style="font-size: 48px; font-weight: 500; letter-spacing: -0.04em; color: #FFFFFF; line-height: 1;">Flurbi<span style="color: #000000;">x</span></span>
      </div>
      
      <div style="height: 1px; background-color: rgba(240, 239, 227, 0.2); margin-bottom: 32px;"></div>
      
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 1.6; text-align: left;">
        <tr>
          <td class="footer-col" valign="top" width="33%">
            <div class="footer-text-left" style="max-width: 200px; margin-bottom: 24px;">
              Building digital experiences that empower businesses worldwide.
            </div>
          </td>
          
          <td class="footer-col" valign="top" width="34%" style="padding: 0 16px;">
            <div style="margin-bottom: 16px;">
              30 N Gould St Ste R<br>Sheridan, Wyoming 82801<br>USA
            </div>
            <div style="margin-bottom: 16px;">
              <a href="mailto:info@flurbix.com" style="color: rgba(255, 255, 255, 0.6); text-decoration: none;">info@flurbix.com</a>
            </div>
            <div>
              +1 (917) 967 1694
            </div>
          </td>
          
          <td class="footer-col footer-col-right" valign="top" width="33%" align="right">
            <div style="margin-bottom: 16px;">
              <a href="https://flurbix.com/terms.html" style="color: rgba(255, 255, 255, 0.6); text-decoration: none;">Terms & Conditions</a>
            </div>
            <div>
              <a href="https://flurbix.com/privacy-policy.html" style="color: rgba(255, 255, 255, 0.6); text-decoration: none;">Privacy Policy</a>
            </div>
          </td>
        </tr>
      </table>
      
      <div style="height: 1px; background-color: rgba(240, 239, 227, 0.2); margin-top: 32px; margin-bottom: 32px;"></div>
      
      <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
        © 2026 Flurbix. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;

    // --- RATE LIMITING CHECK START ---
    let ipLimitKey = "";
    let deviceLimitKey = "";
    try {
      const MAX_EMAILS_PER_HOUR = 5;
      const COOLDOWN_MS = 60 * 60 * 1000;

      let deviceId = localStorage.getItem("flurbix_device_id");
      if (!deviceId) {
        deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem("flurbix_device_id", deviceId);
      }

      let clientIp = "unknown_ip";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        clientIp = ipData.ip;
      } catch (e) {
        console.warn("Could not fetch IP for rate limiting");
      }

      const checkLimit = (storageKey: string) => {
        const recordStr = localStorage.getItem(storageKey);
        let record = recordStr ? JSON.parse(recordStr) : { count: 0, timestamp: Date.now() };
        if (Date.now() - record.timestamp > COOLDOWN_MS) {
          record = { count: 0, timestamp: Date.now() };
        }
        if (record.count >= MAX_EMAILS_PER_HOUR) {
          return false;
        }
        return true;
      };

      ipLimitKey = `flurbix_limit_ip_${clientIp}`;
      deviceLimitKey = `flurbix_limit_dev_${deviceId}`;

      if (!checkLimit(ipLimitKey) || !checkLimit(deviceLimitKey)) {
        alert("Rate limit exceeded. You have reached the maximum number of requests (5 per hour). To prevent spam, please try again later.");
        confirmBookingBtn.textContent = originalConfirmText;
        confirmBookingBtn.disabled = false;
        closeCalendarModal();
        return;
      }
    } catch (err) {
      console.error("Error during rate limit check", err);
    }
    // --- RATE LIMITING CHECK END ---

    try {
      const apikey = (import.meta as any).env?.VITE_ELASTIC_EMAIL_API_KEY || (window as any).process?.env?.ELASTIC_EMAIL_API_KEY;

      if (!apikey) {
        console.error("Elastic Email API Key is missing. Simulating booking success.");
      } else {
        // Send email to Sales
        const payload: any = {
          from: "noreply@flurbix.com",
          fromName: "Flurbix Demo Booking",
          to: "sales@flurbix.com",
          subject: `Demo Scheduled: ${data.company} on ${readableDate} at ${meetingTimeStr}`,
          bodyHtml: bodyHtml,
          isTransactional: "true",
          charset: "utf-8",
          encodingType: "4",
          apikey: apikey,
        };

        const response = await fetch("https://api.elasticemail.com/v2/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(payload).toString(),
        });

        const result = await response.json();
        if (result.success === false) {
          throw new Error(result.error);
        }

        // Send email to User
        const userPayload: any = {
          from: "noreply@flurbix.com",
          fromName: "Flurbix",
          to: data.email,
          subject: `Confirmed: Flurbix Demo on ${readableDate} at ${meetingTimeStr}`,
          bodyHtml: userBodyHtml,
          isTransactional: "true",
          charset: "utf-8",
          encodingType: "4",
          apikey: apikey,
        };

        const userResponse = await fetch("https://api.elasticemail.com/v2/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams(userPayload).toString(),
        });

        const userResult = await userResponse.json();
        if (userResult.success === false) {
          console.error("Failed to send user confirmation email:", userResult.error);
        }
      }

      // --- Success Execution ---
      // 1. Close Modal
      closeCalendarModal();

      // 2. Save booking in localStorage so it appears "Already Booked"
      saveUserBookedSlot(dateStr, meetingTimeStr);

      // 3. Trigger automatic download of .ics calendar file (only if NOT saved directly in Google Calendar)
      if (!googleCalendarSaved) {
        triggerICSDownload();
      }

      // 4. Update and display success state
      const formWrap = document.querySelector(".demo_form-wrap");
      if (formWrap) {
        form.style.display = "none";

        const detailsBox = document.getElementById("booking-details-box") as HTMLDivElement;
        const detailsTime = document.getElementById("booking-details-time") as HTMLElement;
        const googleCalLink = document.getElementById("google-cal-link") as HTMLAnchorElement;
        const outlookCalLink = document.getElementById("outlook-cal-link") as HTMLAnchorElement;
        const redownloadBtn = document.getElementById("redownload-ics-btn") as HTMLAnchorElement;

        let confirmedDetails = fullMeetingDetails;
        if (hangoutMeetUrl) {
          confirmedDetails += `\n🎥 Google Meet Link: ${hangoutMeetUrl}`;
        }
        if (detailsTime) {
          detailsTime.innerHTML = confirmedDetails.replace(/\n/g, "<br>");
        }

        if (googleCalLink) googleCalLink.href = googleCalUrl;
        if (outlookCalLink) outlookCalLink.href = outlookCalUrl;

        if (redownloadBtn) {
          redownloadBtn.replaceWith(redownloadBtn.cloneNode(true));
          const newRedownloadBtn = document.getElementById("redownload-ics-btn") as HTMLAnchorElement;
          newRedownloadBtn.addEventListener("click", (evt) => {
            evt.preventDefault();
            triggerICSDownload();
          });
          if (googleCalendarSaved) {
            newRedownloadBtn.querySelector("span")!.textContent = "📥 Export to .ics";
          }
        }

        if (detailsBox) detailsBox.style.display = "block";

        const successMsg = formWrap.querySelector(".w-form-done") as HTMLElement;
        if (successMsg) successMsg.style.display = "block";
      }

      // --- RATE LIMITING INCREMENT ---
      try {
        const incrementLimit = (storageKey: string) => {
          if (!storageKey) return;
          const recordStr = localStorage.getItem(storageKey);
          let record = recordStr ? JSON.parse(recordStr) : { count: 0, timestamp: Date.now() };
          if (Date.now() - record.timestamp > 60 * 60 * 1000) {
            record = { count: 0, timestamp: Date.now() };
          }
          record.count += 1;
          localStorage.setItem(storageKey, JSON.stringify(record));
        };
        incrementLimit(ipLimitKey);
        incrementLimit(deviceLimitKey);
      } catch (e) {
        console.error(e);
      }

    } catch (error: any) {
      console.error("Booking Failed:", error);
      alert("Failed to confirm booking. Please try again later.");
    } finally {
      confirmBookingBtn.textContent = originalConfirmText;
      confirmBookingBtn.disabled = false;
    }
  });
});

