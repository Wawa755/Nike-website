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

  // Visual feedback: Add loading class to the input container
  const inputBox = document.querySelector('.ai-input-box');
  if (inputBox) inputBox.classList.add('loading');

  // Update response area with status message
  aiResponse.innerHTML = '<p class="status-msg">CALIBRATING SYSTEM...</p>';

  try {
    const response = await fetch("/api/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();

    // Remove loading state once data is received
    if (inputBox) inputBox.classList.remove('loading');

    // Build the AI Report structure
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

    // Initialize Nested Typewriter Sequence
    typeWriter(data.config, document.getElementById("typed-config"), 20, () => {
      typeWriter(data.analysis, document.getElementById("typed-analysis"), 15, () => {
        typeWriter(data.mantra, document.getElementById("typed-mantra"), 30, () => {
          // Final callback to finalize text without cursor
          document.getElementById("typed-mantra").innerHTML = data.mantra;
        });
      });
    });

  } catch (error) {
    // Cleanup loading state on failure
    if (inputBox) inputBox.classList.remove('loading');
    aiResponse.innerHTML = '<p class="status-msg" style="color:var(--color-accent)">SYSTEM OFFLINE. TRY AGAIN.</p>';
    console.error("AI Lab Error:", error);
  }
}

// 5. EVENT LISTENERS
if (aiBtn) aiBtn.addEventListener("click", getRecommendation);

const extraPrompts = [
    "High-Altitude Trail", 
    "Stadium Floodlights", 
    "Urban Rain Sprint", 
    "Sunrise Cycling", 
    "Coastal Glare Run",
    "Midnight Marathon",
    "Mountain Mist",
    "Heatwave Training"
];

const suggestionsContainer = document.querySelector('.prompt-suggestions');
const seeMoreBtn = document.getElementById('see-more-prompts');

function getRandomAvailablePrompt() {
    const currentPrompts = Array.from(document.querySelectorAll('.suggestion-chip')).map(c => c.innerText.replace('SEE MORE', '').trim());
    const available = extraPrompts.filter(p => !currentPrompts.includes(p));
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

// A. Handle Prompt Selection
suggestionsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.suggestion-chip');
    if (chip && !chip.classList.contains('see-more-chip')) {
        const clickedPrompt = chip.innerText;
        userInput.value = clickedPrompt;

        userInput.style.height = 'auto';
        userInput.style.height = userInput.scrollHeight + "px";

        gsap.to(chip, {
            opacity: 0,
            y: -10,
            duration: 0.3,
            onComplete: () => {
                chip.remove();
                const nextText = getRandomAvailablePrompt();
                if (nextText) {
                    const newBtn = document.createElement('button');
                    newBtn.className = 'suggestion-chip';
                    newBtn.innerText = nextText;
                    newBtn.style.opacity = "0";
                    suggestionsContainer.appendChild(newBtn);
                    gsap.to(newBtn, { opacity: 1, y: 0, duration: 0.4 });
                }
            }
        });

        getRecommendation();
    }
});

// B. Handle "See More" Button
if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', () => {
        const nextText = getRandomAvailablePrompt();
        if (nextText) {
            const newBtn = document.createElement('button');
            newBtn.className = 'suggestion-chip';
            newBtn.innerText = nextText;
            newBtn.style.opacity = "0";
            newBtn.style.transform = "scale(0.8)";
            suggestionsContainer.appendChild(newBtn);
            
            gsap.to(newBtn, { 
                opacity: 1, 
                scale: 1, 
                duration: 0.4, 
                ease: "back.out(1.7)" 
            });

            gsap.fromTo(seeMoreBtn, { scale: 1 }, { scale: 1.05, duration: 0.1, yoyo: true, repeat: 1 });
        }
    });
}

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

// 1. HERO REVEAL: High-Speed Entrance + Delayed Scroll Activation
const heroEntranceElements = ".hero-left h1, .hero-left p, .hero-left .btn-round, .accent-line, .stat-card";

// A. Initial Staggered Entrance (Tightened to prevent clipping)
gsap.from(heroEntranceElements, { 
    y: 40,
    opacity: 0,
    filter: "blur(20px)",
    stagger: 0.08,        // Faster stagger so the button/last card finish sooner
    duration: 1.2, 
    ease: "expo.out",
    // CRITICAL: Clear all properties so ScrollTrigger gets a "Clean" element
    onComplete: () => gsap.set(heroEntranceElements, { clearProps: "all" })
});

// B. Smooth Inertial Scroll Blur (on the OUTER wrapper)
gsap.to(".hero-content-wrapper", {
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",      
        end: "bottom 15%",     
        scrub: 1.2,
        // This prevents the ScrollTrigger from "pre-calculating" 
        // the button/card state while they are still blurring in
        immediateRender: false 
    },
    opacity: 0,
    filter: "blur(30px)",
    y: -100,
    ease: "power2.inOut"
});

// 2. Sections - Master Dissolve Loop (EXCLUDING PERFORMANCE DETAILS)
  const animatedSections = [
    // ".performance-details", <--- REMOVE THIS
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

  /// 2.1 PERFORMANCE DETAILS: Header + Opposing Side Slide
  const perfTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".performance-details",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse"
    }
  });

  // First, animate the header title (The missing blur animation)
  perfTl.from(".performance-details .section-title", {
    y: 30,
    opacity: 0,
    filter: "blur(15px)",
    duration: 1,
    ease: "power2.out"
  })
  // Then, trigger the side boxes immediately after (or slightly overlapping)
  .from(".stat-box-black", {
    x: -120,
    y: 40,
    opacity: 0,
    filter: "blur(20px)",
    duration: 1.2,
    ease: "power4.out"
  }, "-=0.6") // Overlaps with the title animation for smoothness
  .from(".technical-content", {
    x: 120,
    y: 40,
    opacity: 0,
    filter: "blur(20px)",
    duration: 1.2,
    ease: "power4.out"
  }, "<") // Syncs with the stat-box
  .from(".feature-item", {
    y: 20,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.6");

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

  /// 3. Standard Staggered Grids (Fixed for Hover Compatibility)
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
      ease: "power2.out",
      // CRITICAL: This removes GSAP's transform after the entrance animation 
      // finishes, allowing your CSS :hover scale to work!
      clearProps: "transform" 
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

// 8. Banner Frame - Interactive Video Reveal
  gsap.from(".banner-frame, .video-controls", {
    scrollTrigger: {
      trigger: ".banner-frame",
      start: "top 85%",
      end: "bottom 15%",
      toggleActions: "play reverse play reverse"
    },
    opacity: 0,
    scale: 0.95,          // Subtle zoom-in effect
    filter: "blur(20px)", // Matches your site's aesthetic
    duration: 1.5,
    ease: "expo.out",
    clearProps: "filter, transform" // Ensures video stays sharp after load
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

// 11. AI BUTTON: Hardware Shine Animation
  
  // Create an infinite shine loop
const shineTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
  
shineTl.to(".btn-shine", {
    left: "150%", // Move across the button
    duration: 1,
    ease: "power2.inOut"
});
  // Keep the sparkle shifting color independently (it looks good with the shine)
gsap.to(".sparkle-icon", {
    filter: "drop-shadow(0 0 10px rgba(255,255,255,1))",
    repeat: -1,
    yoyo: true,
    duration: 1.5,
    ease: "power1.inOut"
});

  // Click Animation: A quick "System Shock"
  aiBtn.addEventListener("click", () => {
      const tl = gsap.timeline();
      tl.to(aiBtn, { 
          scale: 0.9, 
          duration: 0.1,
          borderColor: "rgba(255,255,255,1)" 
      })
      .to(aiBtn, { 
          scale: 1, 
          duration: 0.6, 
          ease: "elastic.out(1, 0.3)",
          borderColor: "rgba(255,255,255,0.2)"
      });
  });

  // 12. INTERACTIVE VIDEO LOGIC
  const bannerVideo = document.getElementById("hero-video");
  const unmuteBtn = document.getElementById("unmute-btn");
  const controlIcon = unmuteBtn.querySelector("i");
  const controlText = unmuteBtn.querySelector(".control-text");

  unmuteBtn.addEventListener("click", () => {
    if (bannerVideo.muted) {
      // Unmute the video
      bannerVideo.muted = false;
      controlIcon.classList.replace("fa-volume-xmark", "fa-volume-high");
      controlText.innerText = "MUTE SOUND";
      
      // Quick Nike pulse effect on click
      gsap.fromTo(unmuteBtn, { scale: 1 }, { scale: 1.1, duration: 0.1, yoyo: true, repeat: 1 });
    } else {
      // Mute the video
      bannerVideo.muted = true;
      controlIcon.classList.replace("fa-volume-high", "fa-volume-xmark");
      controlText.innerText = "UNMUTE FOR SOUND";
    }
  });

  // Optional: Auto-hide controls when user scrolls past
  ScrollTrigger.create({
    trigger: ".banner-frame",
    start: "bottom center",
    onEnter: () => gsap.to(".video-controls", { opacity: 0 }),
    onLeaveBack: () => gsap.to(".video-controls", { opacity: 1 })
  });

});