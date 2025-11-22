import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// Define and export props interface for usage in other files
export interface SceneProps {
  active: boolean;
}

/**
 * Generates geometry data for a spiral galaxy with realistic distribution
 */
const generateGalaxyData = (options: {
  count: number;
  radius: number;
  branches: number;
  spin: number;
  randomness: number;
  randomnessPower: number;
  insideColor: string;
  outsideColor: string;
}) => {
  const { count, radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor } = options;
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  const colorInside = new THREE.Color(insideColor);
  const colorOutside = new THREE.Color(outsideColor);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Radius: Random distribution but we can shape it if needed
    const r = Math.random() * radius;

    // Spin angle: The further out, the more it spins
    const spinAngle = r * spin;

    // Branch angle: Split into n branches around the center
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    // Randomness (Spread)
    // We use randomnessPower to concentrate stars closer to the main spiral arm curves
    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
    const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

    // Calculate final 3D position
    positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[i3 + 1] = randomY; // Keep Y axis flatter for a disc shape
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    // Color mixing based on distance from center
    // Inner stars are warmer/brighter, outer stars are cooler/darker
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, r / radius);

    // Add a tiny bit of random variation to each star's color
    mixedColor.r += (Math.random() - 0.5) * 0.05;
    mixedColor.g += (Math.random() - 0.5) * 0.05;
    mixedColor.b += (Math.random() - 0.5) * 0.05;

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  return { positions, colors };
};

const Galaxy: React.FC<{ active: boolean }> = ({ active }) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Layer 1: The main structural stars (High count, tight definition)
  const mainStars = useMemo(() => generateGalaxyData({
    count: 20000,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030', // Hot Core Orange
    outsideColor: '#1b3984' // Deep Space Blue
  }), []);

  // Layer 2: Surrounding dust/nebula glow (Lower count, larger spread, more transparent)
  const starDust = useMemo(() => generateGalaxyData({
    count: 5000,
    radius: 8,
    branches: 3,
    spin: 1,
    randomness: 0.8, // Much more scattered
    randomnessPower: 2,
    insideColor: '#ff6030',
    outsideColor: '#331b84' // Slightly purple outer
  }), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Base rotation
        // When active (exploring), rotate significantly faster for dramatic effect
        const rotationSpeed = active ? 0.3 : 0.05; 
        // Smoothly accelerate/decelerate would be better, but direct lerp here is simple
        groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={groupRef} dispose={null} rotation={[0.2, 0, 0]}>
      {/* Main Star Layer */}
      <Points positions={mainStars.positions} colors={mainStars.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Glow/Dust Layer */}
      <Points positions={starDust.positions} colors={starDust.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.04} // Larger particles
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4} // More subtle
        />
      </Points>
    </group>
  );
};

/**
 * Handles camera movement logic separated from the render
 */
const CameraRig: React.FC<{ active: boolean }> = ({ active }) => {
    const { camera, mouse } = useThree();
    const targetPosition = new THREE.Vector3();

    useFrame((state, delta) => {
        if (active) {
            // "Warp" mode: Fly closer to the center and slightly up
            targetPosition.set(0, 1.5, 2.5);
            
            // Smoothly interpolate camera position
            camera.position.lerp(targetPosition, 1.5 * delta);
        } else {
            // "Orbit" mode: Further away, influenced by mouse for parallax
            // Mouse x/y are normalized between -1 and 1
            const x = mouse.x * 3;
            const y = mouse.y * 3 + 4; // Elevated view
            
            targetPosition.set(x, y, 9);
            camera.position.lerp(targetPosition, 1 * delta);
        }
        
        // Always look at the galactic center
        camera.lookAt(0, 0, 0);
    });

    return null;
}

export const Scene: React.FC<SceneProps> = ({ active }) => {
  return (
    <Canvas
      camera={{ position: [0, 4, 9], fov: 55 }}
      gl={{ 
        antialias: true,
        powerPreference: "high-performance",
        alpha: false // Black background handled by css or color attach
      }}
      dpr={[1, 2]} // Support high DPI screens for sharper stars
    >
      <color attach="background" args={['#030305']} />
      
      {/* Gentle floating motion for the whole celestial object */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
         <Galaxy active={active} />
      </Float>

      {/* Deep background field of distant stars */}
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      <CameraRig active={active} />
      
      {/* Fog to blend the distant stars into the background color seamlessly */}
      <fog attach="fog" args={['#030305', 10, 25]} />
      
      {/* Post-processing-like effects using lights */}
      <ambientLight intensity={0.5} />
    </Canvas>
  );
};