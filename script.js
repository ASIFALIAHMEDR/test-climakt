// script.js
// Pure vanilla JS: rotating earth canvas, floating particles, live CO2 counter, and form interaction.

// ---------- Small helpers ----------
const $ = (sel) => document.querySelector(sel);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);

// ---------- Insert current year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- LIVE CO2 counter ----------
(() => {
  const co2El = document.getElementById('co2');
  // start close to your original value
  let co2 = 37000000000;
  const step = () => {
    // random growth per tick
    co2 += Math.random() * 150;
    co2El.textContent = fmt(co2);
  };
  // update visually fairly often, but not too often
  step();
  setInterval(step, 200);
})();

// ---------- particles (floating dots) ----------
(() => {
  const container = document.getElementById('particles');
  const count = 30;
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    const size = 6 + Math.random() * 10;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.background = `linear-gradient(90deg, rgba(104,192,155,0.9), rgba(42,143,103,0.9))`;
    el.style.borderRadius = '50%';
    el.style.position = 'absolute';
    el.style.opacity = `${0.25 + Math.random() * 0.6}`;
    el.style.transform = `translate3d(0,0,0)`;
    el.style.pointerEvents = 'none';
    const dur = 6 + Math.random() * 12;
    const dx = (Math.random() - 0.5) * 40;
    const dy = (Math.random() - 0.5) * 40;
    el.animate([
      { transform: `translate(0px, 0px)` },
      { transform: `translate(${dx}px, ${dy}px)` },
      { transform: `translate(0px, 0px)` }
    ], { duration: dur * 1000, iterations: Infinity, easing: 'ease-in-out', delay: Math.random() * -dur * 1000 });
    container.appendChild(el);
  }
})();

// ---------- Rotating Earth Canvas ----------
(() => {
  const canvas = document.getElementById('earthCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  const width = canvas.width;
  const height = canvas.height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  ctx.scale(DPR, DPR);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.18 * 2.2; // tuned to match previous visual
  let rotation = 0;

  // draw once to warm cache
  function draw() {
    ctx.clearRect(0, 0, width, height);

    // background radial glow
    const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.4);
    glow.addColorStop(0, 'rgba(104,192,155,0.18)');
    glow.addColorStop(1, 'rgba(8,18,14,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Earth sphere gradient
    const g = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 1, centerX, centerY, radius);
    g.addColorStop(0, '#c7f5e6'); // highlight
    g.addColorStop(0.5, '#6bc79b'); // mid
    g.addColorStop(1, '#2a8f67'); // edge

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // continents (stylized)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    ctx.fillStyle = 'rgba(15,56,39,0.9)';
    // africa-ish
    ctx.beginPath();
    ctx.ellipse(12, -22, 26, 34, 0.35, 0, Math.PI * 2);
    ctx.fill();
    // americas-ish
    ctx.beginPath();
    ctx.ellipse(-42, 2, 20, 48, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // asia-ish
    ctx.beginPath();
    ctx.ellipse(52, -8, 30, 36, 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // atmosphere ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(104,192,155,0.22)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  function animate() {
    rotation += 0.004;
    draw();
    requestAnimationFrame(animate);
  }
  draw();
  requestAnimationFrame(animate);
})();

// ---------- Waitlist form handling ----------
(() => {
  const form = document.getElementById('waitlist-form');
  const emailInput = document.getElementById('email');
  const feedback = document.getElementById('form-feedback');
  const btn = document.getElementById('submit-btn');

  function validEmail(e) {
    if (!e) return false;
    // simple regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    feedback.textContent = '';
    const email = emailInput.value || '';
    if (!validEmail(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.style.color = '#ffb4a2';
      emailInput.focus();
      return;
    }

    // simulate submission (no network)
    btn.disabled = true;
    btn.textContent = 'Thank you!';
    feedback.style.color = '#bfeadf';
    feedback.textContent = "We'll be in touch soon with exclusive updates!";

    // simple local storage to prevent immediate re-submit
    try { localStorage.setItem('carbonzero_waitlist', JSON.stringify({ email, at: Date.now() })); } catch (e) { /* ignore */ }

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Join the Waitlist';
      emailInput.value = '';
    }, 3000);
  });
})();

// ---------- Google Sheets Email Collector ----------
const form = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const successMsg = document.getElementById("successMsg");

// YOUR GOOGLE SCRIPT URL (already provided)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw4jYNc9vvgHb5ohKApJQshtjoPHxc_tewwHS-FLFZgAkxCHfB7wk3QlSw9YJb95lfT/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) return;

  // disable button + loading state
  submitBtn.disabled = true;
  submitText.textContent = "Submitting...";

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: new URLSearchParams({ email })
    });

    // success response
    successMsg.classList.remove("hidden");
    successMsg.textContent = "You're added to the waitlist!";
    emailInput.value = "";

    setTimeout(() => {
      successMsg.classList.add("hidden");
      submitBtn.disabled = false;
      submitText.textContent = "Join the Waitlist";
    }, 3000);

  } catch (err) {
    successMsg.classList.remove("hidden");
    successMsg.textContent = "Something went wrong. Try again.";
    
    setTimeout(() => {
      successMsg.classList.add("hidden");
      submitBtn.disabled = false;
      submitText.textContent = "Join the Waitlist";
    }, 3000);
  }
});
