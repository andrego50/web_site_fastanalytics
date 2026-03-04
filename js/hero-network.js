(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PRIMARY = { r: 0, g: 109, b: 109 };
  const ACCENT = { r: 212, g: 136, b: 58 };
  const CONNECTION_DIST = 150;
  const NODE_COUNT_DESKTOP = 80;
  const NODE_COUNT_MOBILE = 35;
  const MOUSE_RADIUS = 200;

  let width, height, nodes, mouse, animId;

  mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function createNodes() {
    const count = width < 768 ? NODE_COUNT_MOBILE : NODE_COUNT_DESKTOP;
    nodes = [];
    for (let i = 0; i < count; i++) {
      const isAccent = Math.random() < 0.15;
      const color = isAccent ? ACCENT : PRIMARY;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        color: color,
        alpha: Math.random() * 0.5 + 0.3,
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
          const opacity = (1 - dist / CONNECTION_DIST) * 0.15;
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

    // Draw mouse connections
    for (let i = 0; i < nodes.length; i++) {
      const dx = mouse.x - nodes[i].x;
      const dy = mouse.y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS) {
        const opacity = (1 - dist / MOUSE_RADIUS) * 0.3;
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(nodes[i].x, nodes[i].y);
        ctx.strokeStyle = 'rgba(' + ACCENT.r + ',' + ACCENT.g + ',' + ACCENT.b + ',' + opacity + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.pulse += 0.02;
      const pulseAlpha = n.alpha + Math.sin(n.pulse) * 0.15;
      const c = n.color;

      // Glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + (pulseAlpha * 0.15) + ')';
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

      // Mouse repulsion
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }

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
    animate();
  }

  // Events
  window.addEventListener('resize', function () {
    resize();
    createNodes();
  });

  canvas.parentElement.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Pause when not visible
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });

  init();
})();
