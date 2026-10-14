(function () {
  // Red de fondo del hero — versión atenuada (rediseño home 2026):
  // · ~30 % de la densidad original de nodos (80 → 24 desktop, 35 → 12 móvil)
  // · Opacidad reducida en nodos, halos y conexiones
  // · SIN interacción con el mouse (ni repulsión ni líneas al cursor)
  // · En móvil (<768 px) la red es ESTÁTICA: se dibuja una vez, sin loop de animación
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PRIMARY = { r: 13, g: 148, b: 136 };
  const ACCENT = { r: 212, g: 136, b: 58 };
  const CONNECTION_DIST = 150;
  const NODE_COUNT_DESKTOP = 24;   // ~30 % de 80
  const NODE_COUNT_MOBILE = 12;    // ~30 % de 35
  const CONNECTION_OPACITY = 0.12; // antes 0.22
  const GLOW_OPACITY = 0.08;       // antes 0.15
  const SPEED = 0.3;               // deriva más calmada (antes 0.4)

  let width, height, nodes, animId;

  function isMobile() {
    return width < 768;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function createNodes() {
    const count = isMobile() ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
    nodes = [];
    for (let i = 0; i < count; i++) {
      const isAccent = Math.random() < 0.15;
      const color = isAccent ? ACCENT : PRIMARY;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 2 + 1,
        color: color,
        alpha: Math.random() * 0.32 + 0.18, // antes 0.3–0.8
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * CONNECTION_OPACITY;
          const c = nodes[i].color;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.pulse += 0.02;
      const pulseAlpha = n.alpha + Math.sin(n.pulse) * 0.12;
      const c = n.color;

      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (pulseAlpha * GLOW_OPACITY) + ')';
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + pulseAlpha + ')';
      ctx.fill();
    }
  }

  function update() {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      // Damping
      n.vx *= 0.999;
      n.vy *= 0.999;

      // Bounce off edges
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    }
  }

  function animate() {
    update();
    draw();
    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    createNodes();
    if (isMobile()) {
      draw(); // móvil: un solo frame estático, sin requestAnimationFrame
    } else {
      animate();
    }
  }

  // Events
  window.addEventListener('resize', function () {
    resize();
    createNodes();
    if (isMobile()) draw(); // redibujar el frame estático tras rotación/resize
  });

  // Pause when tab hidden or canvas outside viewport (solo aplica al loop de escritorio)
  let running = true;
  let inViewport = true;

  function pause() {
    if (running) {
      running = false;
      cancelAnimationFrame(animId);
    }
  }

  function resume() {
    if (!running && !document.hidden && inViewport && !isMobile()) {
      running = true;
      animate();
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
    else resume();
  });

  new IntersectionObserver(function (entries) {
    inViewport = entries[0].isIntersecting;
    if (inViewport) resume();
    else pause();
  }).observe(canvas);

  init();
})();
