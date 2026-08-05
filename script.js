const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null, radius: 120 };

// Settings
const PARTICLE_COUNT = 100;
const CONNECTION_DISTANCE = 130;
const PARTICLE_SPEED = 0.6;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Particle class
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
    this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
    this.size = Math.random() * 2.5 + 1;
    this.color = `hsl(${Math.random() * 60 + 180}, 100%, 70%)`; // cyan-blue range
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Mouse interaction (attraction / repulsion)
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.vx -= Math.cos(angle) * force * 1.5;
        this.vy -= Math.sin(angle) * force * 1.5;
      }
    }

    // Speed limit
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > 2.5) {
      this.vx *= 0.95;
      this.vy *= 0.95;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Create particles
function init() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
}

// Draw connections between nearby particles
function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONNECTION_DISTANCE) {
        const opacity = 1 - distance / CONNECTION_DISTANCE;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 247, 255, ${opacity * 0.35})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

// Explosion on click
function createExplosion(x, y) {
  for (let i = 0; i < 25; i++) {
    const p = new Particle();
    p.x = x;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 8;
    p.vy = (Math.random() - 0.5) * 8;
    p.size = Math.random() * 3 + 1.5;
    p.color = `hsl(${Math.random() * 60 + 160}, 100%, 65%)`;
    particles.push(p);
  }

  // Limit total particles
  if (particles.length > 180) {
    particles.splice(0, 30);
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Soft background gradient
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 1.5
  );
  gradient.addColorStop(0, 'rgba(10, 20, 40, 0.4)');
  gradient.addColorStop(1, 'rgba(5, 5, 16, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  connectParticles();

  requestAnimationFrame(animate);
}

// Mouse events
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

window.addEventListener('click', (e) => {
  createExplosion(e.clientX, e.clientY);
});

// Touch support
window.addEventListener('touchmove', (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});

window.addEventListener('touchstart', (e) => {
  createExplosion(e.touches[0].clientX, e.touches[0].clientY);
});

// Start
init();
animate();
