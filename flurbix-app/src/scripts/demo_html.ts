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
          types: "words",
          mask: "words",
          wordsClass: "h1",
          autoSplit: true,
        });
        const p1 = new SplitText(".hero_p", {
          types: "lines",
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
            ".demo_brands .demo_tag",
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
            ".demo_slider-wrap",
            {
              y: 32,
              opacity: 0,
              filter: "blur(5px)",
              duration: 1,
              ease: "power4.out",
            },
            "<0.2",
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
          tl.fromTo(
            ".demo_brands",
            { y: 32, opacity: 0, filter: "blur(5px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              stagger: 0.1,
              ease: "power4.out",
            },
            "<0.3",
          );

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
            types: "words",
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


