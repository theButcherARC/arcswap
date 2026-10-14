"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 200;
const CONNECTION_DISTANCE = 4.5;
const MAX_CONNECTIONS = 6000;
const SPHERE_RADIUS = 14;
const COLORS = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#a3a3a3"),
  new THREE.Color("#737373"),
];

export default function HeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animationRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- Particle Data Arrays ---
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colorArray = new Float32Array(PARTICLE_COUNT * 3);
    const sizeArray = new Float32Array(PARTICLE_COUNT);
    const phaseArray = new Float32Array(PARTICLE_COUNT);
    const freqArray = new Float32Array(PARTICLE_COUNT);
    const ampArray = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Distribute particles uniformly inside a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.45) * SPHERE_RADIUS;

      basePositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      basePositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      basePositions[i3 + 2] = r * Math.cos(phi);

      positions[i3] = basePositions[i3];
      positions[i3 + 1] = basePositions[i3 + 1];
      positions[i3 + 2] = basePositions[i3 + 2];

      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      colorArray[i3] = color.r;
      colorArray[i3 + 1] = color.g;
      colorArray[i3 + 2] = color.b;

      sizeArray[i] = Math.random() * 3.5 + 1.2;
      phaseArray[i] = Math.random() * Math.PI * 2;
      freqArray[i] = Math.random() * 0.3 + 0.08;
      ampArray[i] = Math.random() * 0.5 + 0.1;
    }

    // --- Particle Geometry & Material ---
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "aColor",
      new THREE.BufferAttribute(colorArray, 3)
    );
    particleGeometry.setAttribute(
      "aSize",
      new THREE.BufferAttribute(sizeArray, 1)
    );

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float depth = -mvPosition.z;
          gl_PointSize = aSize * (300.0 / max(depth, 0.1));
          gl_PointSize = max(gl_PointSize, 1.0);
          gl_PointSize = min(gl_PointSize, 64.0);
          vAlpha = smoothstep(40.0, 5.0, depth);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 2.2);
          float coreBright = smoothstep(0.2, 0.0, dist) * 0.4;
          vec3 finalColor = vColor + vec3(coreBright);
          gl_FragColor = vec4(finalColor, alpha * vAlpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);

    // --- Line Connection Geometry & Material ---
    const linePositionArray = new Float32Array(MAX_CONNECTIONS * 6);
    const lineColorArray = new Float32Array(MAX_CONNECTIONS * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositionArray, 3)
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColorArray, 3)
    );
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);

    // --- Central Glow Sprite ---
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const glowCtx = glowCanvas.getContext("2d");
    if (glowCtx) {
      const gradient = glowCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.12)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.06)");
      gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.02)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      glowCtx.fillStyle = gradient;
      glowCtx.fillRect(0, 0, 256, 256);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.scale.set(40, 40, 1);

    // --- Group Assembly ---
    const group = new THREE.Group();
    group.add(glowSprite);
    group.add(particles);
    group.add(lines);
    scene.add(group);

    // --- Event Listeners ---
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    const connectionDistSq = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      // Update particle positions with organic floating motion
      const posAttr = particleGeometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const phase = phaseArray[i];
        const freq = freqArray[i];
        const amp = ampArray[i];

        posArr[i3] =
          basePositions[i3] +
          Math.sin(elapsed * freq + phase) * amp +
          Math.sin(elapsed * freq * 0.3 + phase * 2.1) * amp * 0.3;
        posArr[i3 + 1] =
          basePositions[i3 + 1] +
          Math.cos(elapsed * freq * 0.7 + phase) * amp +
          Math.cos(elapsed * freq * 0.4 + phase * 1.7) * amp * 0.2;
        posArr[i3 + 2] =
          basePositions[i3 + 2] +
          Math.sin(elapsed * freq * 0.5 + phase * 1.3) * amp +
          Math.sin(elapsed * freq * 0.2 + phase * 0.8) * amp * 0.25;
      }
      posAttr.needsUpdate = true;

      // Compute and update line connections
      const linePosArr = lineGeometry.getAttribute(
        "position"
      ).array as Float32Array;
      const lineColArr = lineGeometry.getAttribute(
        "color"
      ).array as Float32Array;
      let lineIdx = 0;

      for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i++) {
        const i3 = i * 3;
        const ix = posArr[i3];
        const iy = posArr[i3 + 1];
        const iz = posArr[i3 + 2];

        for (
          let j = i + 1;
          j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS;
          j++
        ) {
          const j3 = j * 3;
          const dx = ix - posArr[j3];
          const dy = iy - posArr[j3 + 1];
          const dz = iz - posArr[j3 + 2];
          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < connectionDistSq) {
            const dist = Math.sqrt(distSq);
            const fade = 1.0 - dist / CONNECTION_DISTANCE;
            const fadeSq = fade * fade;
            const li = lineIdx * 6;

            linePosArr[li] = ix;
            linePosArr[li + 1] = iy;
            linePosArr[li + 2] = iz;
            linePosArr[li + 3] = posArr[j3];
            linePosArr[li + 4] = posArr[j3 + 1];
            linePosArr[li + 5] = posArr[j3 + 2];

            const cr =
              (colorArray[i3] + colorArray[j3]) * 0.5 * fadeSq;
            const cg =
              (colorArray[i3 + 1] + colorArray[j3 + 1]) * 0.5 * fadeSq;
            const cb =
              (colorArray[i3 + 2] + colorArray[j3 + 2]) * 0.5 * fadeSq;

            lineColArr[li] = cr;
            lineColArr[li + 1] = cg;
            lineColArr[li + 2] = cb;
            lineColArr[li + 3] = cr;
            lineColArr[li + 4] = cg;
            lineColArr[li + 5] = cb;

            lineIdx++;
          }
        }
      }

      lineGeometry.setDrawRange(0, lineIdx * 2);
      (
        lineGeometry.getAttribute("position") as THREE.BufferAttribute
      ).needsUpdate = true;
      (
        lineGeometry.getAttribute("color") as THREE.BufferAttribute
      ).needsUpdate = true;

      // Slow continuous rotation of the entire particle field
      group.rotation.y = elapsed * 0.04;
      group.rotation.x = Math.sin(elapsed * 0.025) * 0.12;
      group.rotation.z = Math.cos(elapsed * 0.02) * 0.04;

      // Mouse parallax - shift and tilt the group
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      group.rotation.y += mx * 0.35;
      group.rotation.x += my * 0.25;
      group.position.x += (mx * 2.0 - group.position.x) * 0.05;
      group.position.y += (my * 1.5 - group.position.y) * 0.05;

      // Subtle glow pulse
      const glowScale = 40 + Math.sin(elapsed * 0.5) * 3;
      glowSprite.scale.set(glowScale, glowScale, 1);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      glowTexture.dispose();
      glowMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
