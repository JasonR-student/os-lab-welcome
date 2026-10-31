import React, { useEffect, useRef } from "react";

const COLORS = ["#F4C67A", "#88D8D1", "#DDEBE5"];
const POINTER_RADIUS = 220;

function createParticle(width, height, index) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    radius: 0.8 + Math.random() * 1.7,
    color: COLORS[index % COLORS.length],
    behavior: Math.random() > 0.68 ? 1 : -1,
    pulse: Math.random() * Math.PI * 2,
  };
}

export default function ParticleField() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const particlesRef = useRef([]);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;

    if (!canvas || !parent) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const updateMotionPreference = () => {
      reducedMotionRef.current = motionQuery.matches;
    };

    const resize = () => {
      const bounds = parent.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = Math.min(72, Math.max(28, Math.floor((width * height) / 23000)));
      particlesRef.current = Array.from({ length: particleCount }, (_, index) =>
        createParticle(width, height, index),
      );
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const pointer = pointerRef.current;
      const shouldAnimate = !reducedMotionRef.current;

      particles.forEach((particle, index) => {
        if (shouldAnimate) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);

          if (pointer.active && distance > 0 && distance < POINTER_RADIUS) {
            const influence = (1 - distance / POINTER_RADIUS) * 0.035;
            const direction = particle.behavior;
            particle.vx += (deltaX / distance) * influence * direction;
            particle.vy += (deltaY / distance) * influence * direction;
          }

          particle.vx += Math.sin(time * 0.0002 + particle.pulse) * 0.0007;
          particle.vy += Math.cos(time * 0.00018 + particle.pulse) * 0.0007;
          particle.vx *= 0.988;
          particle.vy *= 0.988;
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -24) particle.x = width + 24;
          if (particle.x > width + 24) particle.x = -24;
          if (particle.y < -24) particle.y = height + 24;
          if (particle.y > height + 24) particle.y = -24;
        }

        const pulse = reducedMotionRef.current
          ? 1
          : 0.84 + Math.sin(time * 0.001 + particle.pulse) * 0.16;
        context.fillStyle = particle.color;
        context.globalAlpha = 0.34 * pulse;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius * 0.8, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      });

      if (pointer.active) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          118,
        );
        glow.addColorStop(0, "rgba(244, 198, 122, 0.1)");
        glow.addColorStop(1, "rgba(244, 198, 122, 0)");
        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 118, 0, Math.PI * 2);
        context.fill();
      }

      if (shouldAnimate) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    resize();
    updateMotionPreference();
    draw();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-field"
      aria-hidden="true"
      data-testid="particle-canvas"
    />
  );
}
