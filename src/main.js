document.addEventListener("DOMContentLoaded", () => {
  const aiBtn = document.getElementById("ask-ai-btn");
  const aiResponse = document.getElementById("ai-response");
  const userInput = document.getElementById("user-activity");
  const nav = document.querySelector(".navbar");

  /**
   * Typewriter function with an optional callback to remove cursor
   */
  function typeWriter(text, element, speed = 25, callback) {
    let i = 0;
    element.innerHTML = ""; 
    
    function type() {
      if (i < text.length) {
        element.innerHTML = text.substring(0, i + 1) + '<span class="cursor">|</span>';
        i++;
        setTimeout(type, speed);
      } else {
        // If it's the last section, we can remove the cursor or stop the blink
        if (callback) {
          element.innerHTML = text; // Final text without cursor
          callback();
        } else {
          element.innerHTML = text + '<span class="cursor">|</span>';
        }
      }
    }
    type();
  }

  async function getRecommendation() {
    const message = userInput.value;
    if (!message) return;

    // Reset UI - anchored top-left
    aiResponse.innerHTML = '<p class="status-msg">CALIBRATING SYSTEM...</p>';

    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      
      // Structured layout with minimal margins
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

      // Chain typewriter effects
      typeWriter(data.config, document.getElementById("typed-config"), 20, () => {
         typeWriter(data.analysis, document.getElementById("typed-analysis"), 15, () => {
            typeWriter(data.mantra, document.getElementById("typed-mantra"), 30, () => {
               // Remove cursor from last element when totally finished
               document.getElementById("typed-mantra").innerHTML = data.mantra;
            });
         });
      });

    } catch (error) {
      aiResponse.innerHTML = '<p class="status-msg" style="color:var(--color-accent)">SYSTEM OFFLINE. TRY AGAIN.</p>';
    }
  }

  if (aiBtn) aiBtn.addEventListener("click", getRecommendation);

  // Nav Scroll Logic
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
});