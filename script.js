const canvas = document.querySelector("#fx-canvas");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const petals = [];
const bursts = [];
let width = 0;
let height = 0;
let pixelRatio = 1;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function makePetal(initial = false) {
  return {
    x: random(-80, width + 80),
    y: initial ? random(-height, height) : random(-120, -20),
    size: random(8, 20),
    speed: random(0.4, 1.3),
    drift: random(-0.5, 0.8),
    rotate: random(0, Math.PI * 2),
    spin: random(-0.03, 0.03),
    alpha: random(0.4, 0.85),
    hue: "leaf",
  };
}

function resetPetals() {
  petals.length = 0;
  const amount = Math.min(90, Math.max(38, Math.floor(width / 18)));
  for (let i = 0; i < amount; i += 1) {
    petals.push(makePetal(true));
  }
}

function drawPetal(petal) {
  ctx.save();
  ctx.translate(petal.x, petal.y);
  ctx.rotate(petal.rotate);
  ctx.globalAlpha = petal.alpha;
  
  // Draw realistic leaf
  const leafColors = ["#6ba485", "#7bb896", "#5aa580", "#8fa98f", "#6d9d7a"];
  ctx.fillStyle = leafColors[Math.floor(Math.random() * leafColors.length)];
  
  ctx.beginPath();
  // Create leaf outline with bezier curves
  ctx.moveTo(0, -petal.size);
  ctx.bezierCurveTo(petal.size * 0.35, -petal.size * 0.6, petal.size * 0.5, -petal.size * 0.2, petal.size * 0.45, petal.size * 0.4);
  ctx.bezierCurveTo(petal.size * 0.6, petal.size * 0.6, petal.size * 0.25, petal.size * 0.9, 0, petal.size);
  ctx.bezierCurveTo(-petal.size * 0.25, petal.size * 0.9, -petal.size * 0.6, petal.size * 0.6, -petal.size * 0.45, petal.size * 0.4);
  ctx.bezierCurveTo(-petal.size * 0.5, -petal.size * 0.2, -petal.size * 0.35, -petal.size * 0.6, 0, -petal.size);
  ctx.fill();
  
  // Draw leaf vein
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -petal.size);
  ctx.lineTo(0, petal.size);
  ctx.stroke();
  
  ctx.restore();
}

function makeBurst(x = pointer.x, y = pointer.y, count = 34) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + random(-0.18, 0.18);
    const velocity = random(2.4, 7.2);
    bursts.push({
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: random(48, 86),
      maxLife: 86,
      size: random(2, 5),
      color: ["#8fa98f", "#ffffff", "#6ba485", "#4a7c63"][Math.floor(random(0, 4))],
    });
  }
}

function drawBursts() {
  for (let i = bursts.length - 1; i >= 0; i -= 1) {
    const particle = bursts[i];
    particle.life -= 1;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.035;
    particle.vx *= 0.988;
    particle.vy *= 0.988;

    const opacity = Math.max(particle.life / particle.maxLife, 0);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (particle.life <= 0) {
      bursts.splice(i, 1);
    }
  }
}

function animateCanvas() {
  ctx.clearRect(0, 0, width, height);

  const pointerPullX = (pointer.x - width / 2) * 0.0008;
  const pointerPullY = (pointer.y - height / 2) * 0.0004;

  petals.forEach((petal) => {
    petal.y += petal.speed + pointerPullY;
    petal.x += Math.sin(petal.y * 0.01) + petal.drift + pointerPullX;
    petal.rotate += petal.spin;

    if (petal.y > height + 80 || petal.x < -120 || petal.x > width + 120) {
      Object.assign(petal, makePetal());
    }

    drawPetal(petal);
  });

  drawBursts();
  requestAnimationFrame(animateCanvas);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 70, 360)}ms`;
    observer.observe(element);
  });
}

function setupTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupMagnets() {
  document.querySelectorAll(".magnet").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.11}px, ${y * 0.18}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function setupCountdown() {
  const countdown = document.querySelector(".countdown");
  const target = new Date(countdown.dataset.date).getTime();
  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;
  const fields = {
    days: document.querySelector("#days"),
    hours: document.querySelector("#hours"),
    minutes: document.querySelector("#minutes"),
    seconds: document.querySelector("#seconds"),
  };

  function setText(element, value, length = 2) {
    element.textContent = String(Math.max(0, value)).padStart(length, "0");
  }

  function tick() {
    const distance = Math.max(0, target - Date.now());
    setText(fields.days, Math.floor(distance / day), 3);
    setText(fields.hours, Math.floor((distance % day) / hour));
    setText(fields.minutes, Math.floor((distance % hour) / minute));
    setText(fields.seconds, Math.floor((distance % minute) / 1000));
  }

  tick();
  setInterval(tick, 1000);
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".site-nav a");

  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

function setupRsvp() {
  const form = document.querySelector(".rsvp-form");
  const note = document.querySelector(".form-note");
  const storageKey = "weddingRsvps";

  if (!form || !note) {
    return;
  }

  function readRsvps() {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  function writeRsvps(rsvps) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(rsvps));
    } catch {
      // ignore storage failures
    }
  }

  const rsvps = readRsvps();

  function updateRsvpNote(message) {
    note.textContent = message || "Your RSVP is ready to submit.";
  }

  updateRsvpNote();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "Guest").trim() || "Guest";
    const attendance = String(data.get("attendance") || "");
    const guests = Number(data.get("guests") || 1);
    const message = String(data.get("message") || "").trim();

    rsvps.push({
      name,
      attendance,
      guests,
      message,
      submittedAt: new Date().toISOString(),
    });

    writeRsvps(rsvps);
    updateRsvpNote(`Thank you, ${name}. Your RSVP has been captured.`);
    form.reset();
    makeBurst(window.innerWidth / 2, window.innerHeight * 0.72, 42);
  });
}

function setupHeaderParallax() {
  window.addEventListener(
    "scroll",
    () => {
      const scrolled = window.scrollY;
      document.documentElement.style.setProperty("--scroll", scrolled.toFixed(0));
      document.documentElement.style.setProperty("--orbit-parallax", `${scrolled * 0.08}px`);
    },
    { passive: true },
  );
}

function setupPointer() {
  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    },
    { passive: true },
  );
}

function setupInvitationCover() {
  const cover = document.querySelector(".invite-cover");
  const button = document.querySelector(".invite-open-btn");
  const title = document.querySelector("#invite-title");
  const bgMusic = document.querySelector("#bgMusic");

  if (!cover || !button || !bgMusic) {
    return;
  }

  bgMusic.setAttribute("playsinline", "");
  bgMusic.setAttribute("webkit-playsinline", "");
  bgMusic.volume = 1;
  bgMusic.muted = false;

  function openInvitation(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    bgMusic.play()
      .then(() => {
        console.log("Music started");

        cover.classList.add("is-opening");
        button.disabled = true;

        setTimeout(() => {
          document.body.classList.add("invitation-opened");
          cover.setAttribute("aria-hidden", "true");

          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth"
          });

          cover.classList.remove("is-opening");
        }, 820);
      })
      .catch((err) => {
        console.error("Audio failed:", err);

        cover.classList.add("is-opening");

        setTimeout(() => {
          document.body.classList.add("invitation-opened");
          cover.setAttribute("aria-hidden", "true");
          cover.classList.remove("is-opening");
        }, 820);
      });
  }

  button.addEventListener("touchend", openInvitation);
  button.addEventListener("click", openInvitation);

  if (title) {
    title.style.cursor = "pointer";

    title.addEventListener("touchend", openInvitation);
    title.addEventListener("click", openInvitation);

    title.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        openInvitation(event);
      }
    });
  }
}

function setupMomentGallery() {
  const stage = document.querySelector(".moments-stage");
  const feature = document.querySelector(".moment-feature");
  const hero = document.querySelector("#moment-hero");
  const kicker = document.querySelector("#moment-kicker");
  const title = document.querySelector("#moment-title");
  const thumbs = [...document.querySelectorAll(".moment-thumb")];
  let activeIndex = 0;
  let autoTimer;

  if (!stage || !feature || !hero || thumbs.length === 0) {
    return;
  }

  document.documentElement.dataset.momentGallery = "ready";

  function activate(index, burst = false) {
    const thumb = thumbs[index];
    if (!thumb || index === activeIndex) {
      return;
    }

    activeIndex = index;
    thumbs.forEach((item) => item.classList.toggle("is-active", item === thumb));
    feature.classList.add("is-swapping");

    window.setTimeout(() => {
      hero.src = thumb.dataset.image;
      hero.alt = thumb.dataset.alt;
      kicker.textContent = thumb.dataset.kicker;
      title.textContent = thumb.dataset.title;
      feature.classList.remove("is-swapping");

      if (burst && !reduceMotion) {
        const rect = feature.getBoundingClientRect();
        makeBurst(rect.left + rect.width * 0.5, rect.top + rect.height * 0.42, 22);
      }
    }, 180);
  }

  function restartAuto() {
    if (reduceMotion) {
      return;
    }

    window.clearInterval(autoTimer);
    autoTimer = window.setInterval(() => {
      activate((activeIndex + 1) % thumbs.length);
    }, 5200);
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      activate(index, true);
      restartAuto();
    });
  });

  stage.addEventListener("click", (event) => {
    const thumb = event.target.closest(".moment-thumb");
    if (!thumb || !stage.contains(thumb)) {
      return;
    }

    activate(thumbs.indexOf(thumb), true);
    restartAuto();
  });

  stage.addEventListener(
    "pointermove",
    (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      stage.style.setProperty("--gallery-x", `${x.toFixed(1)}%`);
      stage.style.setProperty("--gallery-y", `${y.toFixed(1)}%`);
    },
    { passive: true },
  );

  restartAuto();
}

function setupCelebration() {
  document.querySelector(".celebrate-button").addEventListener("click", () => {
    makeBurst(width * 0.28, height * 0.42, 46);
    makeBurst(width * 0.72, height * 0.38, 46);
  });
}

function setupDateScratch() {
  const scratchCanvas = document.querySelector("#date-scratch-canvas");
  const dateCard = document.querySelector(".date-card");
  
  if (!scratchCanvas || !dateCard) {
    return;
  }

  const ctx = scratchCanvas.getContext("2d");
  let isDrawing = false;
  let scratchAmount = 0;
  let animationTime = 0;
  let animationFrameId = null;
  const leaves = [];
  const leafColors = ["#6ba485", "#7bb896", "#5aa580", "#8fa98f", "#6d9d7a"];

  function resizeScratchCanvas() {
    const rect = scratchCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    scratchCanvas.width = rect.width * dpr;
    scratchCanvas.height = rect.height * dpr;
    scratchCanvas.style.width = `${rect.width}px`;
    scratchCanvas.style.height = `${rect.height}px`;
    
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Reset leaves array
    leaves.length = 0;
    const rect2 = scratchCanvas.getBoundingClientRect();
    for (let i = 0; i < 15; i++) {
      leaves.push({
        x: Math.random() * rect2.width,
        y: Math.random() * rect2.height,
        size: 15 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        swayAmount: Math.random() * 0.3,
        swaySpeed: 0.02 + Math.random() * 0.03,
        rotationSpeed: -0.02 + Math.random() * 0.04,
        opacityPhase: Math.random() * Math.PI * 2,
      });
    }
    drawScratchSurface();
  }

  function drawLeaf(x, y, size, rotation, color, opacity = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    // Main leaf shape with realistic bezier curves
    ctx.fillStyle = color;
    ctx.beginPath();
    
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.4, -size * 0.7, size * 0.6, -size * 0.3, size * 0.5, size * 0.3);
    ctx.bezierCurveTo(size * 0.7, size * 0.5, size * 0.3, size * 0.8, 0, size);
    ctx.bezierCurveTo(-size * 0.3, size * 0.8, -size * 0.7, size * 0.5, -size * 0.5, size * 0.3);
    ctx.bezierCurveTo(-size * 0.6, -size * 0.3, -size * 0.4, -size * 0.7, 0, -size);
    ctx.fill();
    
    // Leaf vein (main midrib)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    // Side veins for more detail
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 0.8;
    
    for (let i = -4; i <= 4; i += 2) {
      const posY = -size + (size * 2) * ((i + 4) / 8);
      const veinLength = size * 0.35 * Math.cos(posY / size);
      ctx.beginPath();
      ctx.moveTo(0, posY);
      ctx.lineTo(veinLength, posY - size * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, posY);
      ctx.lineTo(-veinLength, posY - size * 0.1);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  function drawScratchSurface() {
    const rect = scratchCanvas.getBoundingClientRect();
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#4a7c63");
    gradient.addColorStop(0.5, "#5a9173");
    gradient.addColorStop(1, "#3a6b52");
    
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Update and draw animated leaves
    ctx.save();
    leaves.forEach(leaf => {
      // Update leaf animation
      leaf.rotation += leaf.rotationSpeed;
      
      // Sway effect
      const sway = Math.sin(animationTime * leaf.swaySpeed) * leaf.swayAmount;
      const swayX = leaf.x + sway;
      
      // Opacity pulse
      const opacity = 0.7 + Math.sin(animationTime * 0.02 + leaf.opacityPhase) * 0.25;
      
      drawLeaf(swayX, leaf.y, leaf.size, leaf.rotation, leaf.color, opacity);
    });
    
    ctx.restore();
  }

  function updateScratchAmount() {
    const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const data = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparent++;
    }
    
    scratchAmount = transparent / (data.length / 4);
    
    if (scratchAmount > 0.5) {
      dateCard.classList.add("is-revealed");
      if (!reduceMotion) {
        const rect = dateCard.getBoundingClientRect();
        makeBurst(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5, 28);
      }
    }
  }

  function scratch(clientX, clientY) {
    if (dateCard.classList.contains("is-revealed")) return;
    const rect = scratchCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const radius = 32;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    updateScratchAmount();
  }

  function animate() {
    if (!dateCard.classList.contains("is-revealed")) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  scratchCanvas.addEventListener("mousedown", (event) => {
    if (dateCard.classList.contains("is-revealed")) return;
    isDrawing = true;
    scratch(event.clientX, event.clientY);
  });

  scratchCanvas.addEventListener("mousemove", (event) => {
    if (!isDrawing || dateCard.classList.contains("is-revealed")) return;
    scratch(event.clientX, event.clientY);
  });

  scratchCanvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  scratchCanvas.addEventListener("mouseleave", () => {
    isDrawing = false;
  });

  // Touch support
  scratchCanvas.addEventListener("touchstart", (event) => {
    if (dateCard.classList.contains("is-revealed")) return;
    event.preventDefault();
    isDrawing = true;
    const touch = event.touches[0];
    scratch(touch.clientX, touch.clientY);
  });

  scratchCanvas.addEventListener("touchmove", (event) => {
    if (!isDrawing || dateCard.classList.contains("is-revealed")) return;
    event.preventDefault();
    const touch = event.touches[0];
    scratch(touch.clientX, touch.clientY);
  });

  scratchCanvas.addEventListener("touchend", () => {
    isDrawing = false;
  });

  resizeScratchCanvas();
  animate();
  
  window.addEventListener("resize", resizeScratchCanvas);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  resetPetals();
});

resizeCanvas();
resetPetals();
setupReveal();
setupTilt();
setupMagnets();
setupCountdown();
setupNavigation();
setupRsvp();
setupPointer();
setupInvitationCover();
setupMomentGallery();
setupCelebration();
setupDateScratch();

if (!reduceMotion) {
  setupHeaderParallax();
  animateCanvas();
  window.setTimeout(() => makeBurst(width / 2, height * 0.38, 36), 900);
}
