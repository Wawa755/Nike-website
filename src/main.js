document.addEventListener("DOMContentLoaded", () => {
  // 1. SELECT ELEMENTS
  const aiBtn = document.getElementById("ask-ai-btn");
  const aiResponse = document.getElementById("ai-response");
  const userInput = document.getElementById("user-activity");
  const nav = document.querySelector(".navbar");

  // 2. TEXTAREA AUTO-EXPAND LOGIC
  userInput.addEventListener("input", function () {
    this.style.overflow = 'hidden'; 
    this.style.height = 'auto'; 
    this.style.height = this.scrollHeight + "px"; 
  });

  // 3. TYPEWRITER EFFECT
  function typeWriter(text, element, speed = 25, callback) {
    let i = 0;
    element.innerHTML = ""; 
    function type() {
      if (i < text.length) {
        element.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
        i++;
        setTimeout(type, speed);
      } else {
        if (callback) {
          element.innerHTML = text;
          callback();
        } else {
          element.innerHTML = text + '<span class="cursor">|</span>';
        }
      }
    }
    type();
  }

  // 4. AI RECOMMENDATION LOGIC
  async function getRecommendation() {
    const message = userInput.value;
    if (!message) return;
    aiResponse.innerHTML = '<p class="status-msg">CALIBRATING SYSTEM...</p>';
    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      aiResponse.innerHTML = `
        <strong class="ai-headline">${data.headline}</strong>
        <div class="ai-report-section">
          <small class="ai-label">PRO-CONFIG IDENTIFIED</small>
          <p id="typed-config" class="ai-para-bold"></p>
        </div>
        <div class="ai-report-section">
          <small class="ai-label-dim">TECHNICAL ANALYSIS</small>
          <p id="typed-analysis" class="ai-para-light"></p>
        </div>
        <p id="typed-mantra" class="ai-para-italic"></p>
      `;
      typeWriter(data.config, document.getElementById("typed-config"), 20, () => {
         typeWriter(data.analysis, document.getElementById("typed-analysis"), 15, () => {
            typeWriter(data.mantra, document.getElementById("typed-mantra"), 30, () => {
               document.getElementById("typed-mantra").innerHTML = data.mantra;
            });
         });
      });
    } catch (error) {
      aiResponse.innerHTML = '<p class="status-msg" style="color:var(--color-accent)">SYSTEM OFFLINE. TRY AGAIN.</p>';
    }
  }

  // 5. EVENT LISTENERS
  if (aiBtn) aiBtn.addEventListener("click", getRecommendation);

  // 6. NAVBAR SCROLL LOGIC
  let lastScrollY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (lastScrollY < window.scrollY && window.scrollY > 100) {
      nav.classList.add("navbar--hidden");
    } else {
      nav.classList.remove("navbar--hidden");
    }
    nav.classList.toggle("navbar--scrolled", window.scrollY > 50);
    lastScrollY = window.scrollY;
  });

  // ==========================================
  // NIKE LAB - MASTER GSAP SUITE
  // ==========================================
  gsap.registerPlugin(ScrollTrigger);

  // 0. Initial Setup
  gsap.to("body", { opacity: 1, duration: 1.2 });
  gsap.set("header, section, footer", { visibility: "visible" });

// 1. HERO REVEAL: Snappy Unified Entrance (with dissolve blur)
const heroTl = gsap.timeline();

heroTl.from(".hero-left", { 
  x: -60, 
  opacity: 0,
  filter: "blur(15px)",
  duration: 1.2, 
  ease: "expo.out" 
})
.from(".accent-line", { 
  width: 0, 
  filter: "blur(10px)",
  duration: 0.8, 
  ease: "power2.inOut" 
}, "-=0.8")
.from(".stat-card", { 
  x: 100, 
  opacity: 0,
  filter: "blur(15px)",
  stagger: 0.15, 
  duration: 1, 
  ease: "power4.out",
  clearProps: "filter,transform,opacity"
}, "-=0.6");

// HERO BLUR OUT ON SCROLL PAST
gsap.to(".hero-main-container", {
  scrollTrigger: {
    trigger: ".hero",
    start: "bottom top",
    end: "bottom top+=200",
    scrub: true
  },
  opacity: 0,
  filter: "blur(20px)",
  ease: "none"
});



  // 2. Sections - Master Dissolve Loop
  const animatedSections = [
    ".performance-details", 
    ".how-it-works", 
    ".designed-motion", 
    ".prototype-section", 
    ".test-athlete", 
    ".ai-lab-section"
  ];

  animatedSections.forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play reverse play reverse"
      },
      opacity: 0,
      y: 50,
      filter: "blur(15px)",
      duration: 1.2,
      ease: "power2.inOut"
    });
  });

  // 2.5 HOW IT WORKS: Alternating Step Slides
  const workSections = gsap.utils.toArray(".working-section");

  workSections.forEach((section, i) => {
    const image = section.querySelector(".image-placeholder-container");
    const details = section.querySelector(".step-details");
    const header = section.querySelector(".step-header");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play reverse play reverse"
      }
    });

    tl.from(header, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    })
    .from(image, {
      x: i % 2 === 0 ? -80 : 80, // Even steps from left, Odd from right
      opacity: 0,
      filter: "blur(10px)",
      duration: 1,
      ease: "power4.out"
    }, "-=0.4")
    .from(details, {
      x: i % 2 === 0 ? 80 : -80, // Details move opposite to the image
      opacity: 0,
      filter: "blur(10px)",
      duration: 1,
      ease: "power4.out"
    }, "<");
  });

  // 3. Standard Staggered Grids
  const gridTargets = [
    { el: ".spec-item", trigger: ".motion-specs-grid" },
    { el: ".proto-spec-item", trigger: ".prototype-specs-grid" },
    { el: ".feature-card", trigger: ".feature-cards-container" },
    { el: ".athlete-stat-item", trigger: ".athlete-stats-grid" },
    { el: ".category-card", trigger: ".motion-categories" }
  ];

  gridTargets.forEach(target => {
    gsap.from(target.el, {
      scrollTrigger: {
        trigger: target.trigger,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play reverse play reverse"
      },
      scale: 0.9,
      opacity: 0,
      filter: "blur(10px)",
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // 4. Athlete Info Boxes
  gsap.from(".info-box", {
    scrollTrigger: {
      trigger: ".athlete-info-grid",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse"
    },
    x: (i) => i === 0 ? -100 : 100,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1,
    ease: "power3.out"
  });

  // 6. AI Lab Boxes
  gsap.from(".ai-input-box, .ai-output-box", {
    scrollTrigger: {
      trigger: ".ai-grid",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse"
    },
    opacity: 0,
    y: 50,
    stagger: 0.2,
    scale: 0.98,
    duration: 1.2,
    ease: "power3.out",
    onEnter: () => document.querySelector(".status-dot").classList.add("active"),
    onLeaveBack: () => document.querySelector(".status-dot").classList.remove("active")
  });

  // 7. Prototype Section
  gsap.from(".prototype-header, .product-placeholder", {
    scrollTrigger: {
      trigger: ".prototype-section",
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play reverse play reverse"
    },
    opacity: 0,
    y: 40,
    stagger: 0.3,
    duration: 1,
    ease: "power2.out"
  });

  // 8. Banner Frame
  gsap.from(".banner-title", {
    scrollTrigger: {
      trigger: ".banner-frame",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse"
    },
    letterSpacing: "40px",
    filter: "blur(20px)",
    opacity: 0,
    duration: 1.5,
    ease: "expo.out"
  });

  // 9. Footer
  gsap.from(".main-footer", {
    scrollTrigger: {
      trigger: ".main-footer",
      start: "top 95%",
      end: "bottom bottom",
      toggleActions: "play reverse play reverse"
    },
    opacity: 0,
    y: 20,
    duration: 1
  });

  // 10. Master Theme Switcher
  ScrollTrigger.create({
    trigger: ".body-frame",
    start: "top center",
    onEnter: () => gsap.to("body", { backgroundColor: "#ffffff", color: "#111111", duration: 0.8 }),
    onLeaveBack: () => gsap.to("body", { backgroundColor: "#111111", color: "#ffffff", duration: 0.8 })
  });

});