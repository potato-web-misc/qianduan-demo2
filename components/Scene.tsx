import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Float, Html, Billboard, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export interface SceneProps {
  active: boolean;
}

// Galaxy Generation Parameters
const GALAXY_PARAMS = {
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
};

/**
 * Helper to calculate position on a spiral arm
 */
const getSpiralPosition = (radius: number, branchIndex: number) => {
    const spinAngle = radius * GALAXY_PARAMS.spin;
    const branchAngle = ((branchIndex % GALAXY_PARAMS.branches) / GALAXY_PARAMS.branches) * Math.PI * 2;
    const x = Math.cos(branchAngle + spinAngle) * radius;
    const z = Math.sin(branchAngle + spinAngle) * radius;
    return new THREE.Vector3(x, 0, z);
};

/**
 * Generates geometry data for a spiral galaxy
 */
const generateGalaxyData = (count: number, options = GALAXY_PARAMS) => {
  const { radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor } = options;
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  const colorInside = new THREE.Color(insideColor);
  const colorOutside = new THREE.Color(outsideColor);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const r = Math.random() * radius;
    const spinAngle = r * spin;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
    const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, r / radius);

    mixedColor.r += (Math.random() - 0.5) * 0.05;
    mixedColor.g += (Math.random() - 0.5) * 0.05;
    mixedColor.b += (Math.random() - 0.5) * 0.05;

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  return { positions, colors };
};

const Galaxy: React.FC<{ active: boolean; dimmed: boolean }> = ({ active, dimmed }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const material1Ref = useRef<THREE.PointsMaterial>(null!);
  const material2Ref = useRef<THREE.PointsMaterial>(null!);

  const mainStars = useMemo(() => generateGalaxyData(20000, GALAXY_PARAMS), []);
  const starDust = useMemo(() => generateGalaxyData(5000, { ...GALAXY_PARAMS, randomness: 0.8, radius: 8 }), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        const rotationSpeed = active ? 0.1 : 0.05; 
        groupRef.current.rotation.y += delta * rotationSpeed;
    }

    // Smooth dimming when hovering the special star
    const targetOpacity1 = dimmed ? 0.1 : 1.0;
    const targetOpacity2 = dimmed ? 0.02 : 0.4;
    
    if (material1Ref.current) {
        material1Ref.current.opacity = THREE.MathUtils.lerp(material1Ref.current.opacity, targetOpacity1, delta * 4);
    }
    if (material2Ref.current) {
        material2Ref.current.opacity = THREE.MathUtils.lerp(material2Ref.current.opacity, targetOpacity2, delta * 4);
    }
  });

  return (
    <group ref={groupRef} dispose={null} rotation={[0.2, 0, 0]}>
      <Points positions={mainStars.positions} colors={mainStars.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={material1Ref}
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Points positions={starDust.positions} colors={starDust.colors} stride={3} frustumCulled={false}>
        <PointMaterial
          ref={material2Ref}
          transparent
          vertexColors
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </Points>
    </group>
  );
};

/**
 * A special star system embedded in the galaxy arm
 */
const WisdomSystem: React.FC<{ active: boolean; onHover: (hovering: boolean) => void; isHovered: boolean }> = ({ active, onHover, isHovered }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const ringsRef = useRef<THREE.Group>(null!);
    const particlesRef = useRef<THREE.Group>(null!); // Ref for the particle cloud
    
    // Calculate a position exactly on the 2nd spiral arm, about halfway out
    const initialPos = useMemo(() => getSpiralPosition(2.5, 1), []);

    // Generate 10000 particles for the local cluster
    const clusterPositions = useMemo(() => {
        const count = 10000;
        const positions = new Float32Array(count * 3);
        const radius = 0.8; 

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            // Generate points in a sphere volume with density falling off from center
            const r = Math.pow(Math.random(), 1.5) * radius; 
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const rotationSpeed = active ? 0.1 : 0.05;
        
        // 1. Orbit Logic: Sync with galaxy rotation
        const angle = delta * rotationSpeed;
        const x = groupRef.current.position.x;
        const z = groupRef.current.position.z;
        groupRef.current.position.x = x * Math.cos(angle) - z * Math.sin(angle);
        groupRef.current.position.z = x * Math.sin(angle) + z * Math.cos(angle);

        // 2. Local Animation: Rotate rings
        if (ringsRef.current) {
            ringsRef.current.rotation.z += delta * 0.2;
            ringsRef.current.rotation.x += delta * 0.1;
        }

        // 3. Particle Swarm Animation (Rotation + Breathing)
        if (particlesRef.current) {
            // Slow rotation of the cloud to simulate orbit/swirl
            particlesRef.current.rotation.y -= delta * 0.08; 
            particlesRef.current.rotation.z += delta * 0.02;

            // "Breathing" effect - subtle expansion and contraction
            const breath = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
            particlesRef.current.scale.setScalar(breath);
        }

        // 4. Entrance/Exit Animation
        const targetScale = active ? 1 : 0.001;
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
        groupRef.current.scale.setScalar(newScale);
    });

    // Set initial position
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.copy(initialPos);
            const tilt = new THREE.Euler(0.2, 0, 0);
            groupRef.current.position.applyEuler(tilt);
        }
    }, [initialPos]);

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        if (!active) return;
        onHover(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        if (!active) return;
        onHover(false);
        document.body.style.cursor = 'auto';
    };

    const starColor = "#40E0D0"; // Turquoise/Cyan
    const glowColor = "#00FFFF"; 

    return (
        <group ref={groupRef} scale={0.001}> 
            <group 
                onPointerOver={handlePointerOver} 
                onPointerOut={handlePointerOut}
                scale={isHovered ? 1.2 : 1}
            >
                {/* --- INVISIBLE HIT BOX --- 
                    Crucial for better UX. A large transparent sphere that captures mouse events.
                */}
                <mesh visible={true}> 
                    <sphereGeometry args={[1.4, 16, 16]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* The Star Core */}
                <mesh>
                    <sphereGeometry args={[0.08, 32, 32]} />
                    <meshBasicMaterial color="#fff" toneMapped={false} />
                </mesh>

                {/* Primary Glow (Inner Halo) */}
                <mesh>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshBasicMaterial 
                        color={starColor} 
                        transparent 
                        opacity={0.8} 
                        blending={THREE.AdditiveBlending} 
                    />
                </mesh>

                {/* Tech Rings */}
                <group ref={ringsRef}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.3, 0.005, 16, 64]} />
                        <meshBasicMaterial color={starColor} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
                    </mesh>
                    <mesh rotation={[0, Math.PI / 4, 0]}>
                        <torusGeometry args={[0.4, 0.005, 16, 64]} />
                        <meshBasicMaterial color={starColor} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
                    </mesh>
                </group>

                {/* Local Cluster Particles (Animated Group) */}
                <group ref={particlesRef}>
                    <Points positions={clusterPositions} stride={3} frustumCulled={false}>
                        <PointMaterial
                            transparent
                            color={starColor}
                            size={0.02}
                            sizeAttenuation={true}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            opacity={0.6}
                        />
                    </Points>
                </group>

  
                {/* Label */}
                <Html 
                    position={[0.2, 0.2, 0]} 
                    center 
                    distanceFactor={8}
                    style={{ 
                        pointerEvents: 'none', 
                        opacity: active ? 1 : 0,
                        transition: 'opacity 0.5s',
                        display: active ? 'block' : 'none'
                    }}
                >
                    <div className={`flex flex-col items-start transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100 opacity-80'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`h-[1px] transition-all duration-300 ${isHovered ? 'w-12 bg-cyan-400' : 'w-8 bg-white/50'}`}></div>
                            <h1 className="text-lg font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(64,224,208,0.8)]">
                                Wisdom<span className="text-cyan-300">SQL</span>
                            </h1>
                        </div>
                        {isHovered && (
                            <p className="text-xs text-cyan-100/90 ml-14 max-w-[180px] leading-tight mt-1 font-light backdrop-blur-md bg-black/40 p-2 rounded border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                                Core Intelligence Node.<br/>Processing logic active.
                            </p>
                        )}
                    </div>
                </Html>
            </group>
        </group>
    );
};

/**
 * A golden star system with orbital rings and planets
 */
const GoldenSystem: React.FC<{ active: boolean; onHover: (hovering: boolean) => void; isHovered: boolean }> = ({ active, onHover, isHovered }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const ringsRef = useRef<THREE.Group>(null!);
    const planetsRef = useRef<THREE.Group>(null!);

    // Calculate position on a different spiral arm
    const initialPos = useMemo(() => getSpiralPosition(3.2, 2), []);

    // Generate orbital planets
    const planetPositions = useMemo(() => {
        const planets = [];
        const numPlanets = 8;

        for (let i = 0; i < numPlanets; i++) {
            const angle = (i / numPlanets) * Math.PI * 2;
            const radius = 0.4 + (i % 3) * 0.15; // Smaller orbital radii
            const speed = 0.5 + (i % 2) * 0.3; // Varying speeds
            const size = 0.008 + Math.random() * 0.006; // Much smaller planet sizes

            planets.push({
                angle,
                radius,
                speed,
                size,
                color: i % 2 === 0 ? '#FFA500' : '#FFD700' // Orange and gold colors
            });
        }

        return planets;
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const rotationSpeed = active ? 0.12 : 0.08;

        // 1. Orbit Logic: Sync with galaxy rotation
        const angle = delta * rotationSpeed;
        const x = groupRef.current.position.x;
        const z = groupRef.current.position.z;
        groupRef.current.position.x = x * Math.cos(angle) - z * Math.sin(angle);
        groupRef.current.position.z = x * Math.sin(angle) + z * Math.cos(angle);

        // 2. Local Animation: Rotate rings
        if (ringsRef.current) {
            ringsRef.current.rotation.y += delta * 0.15;
            ringsRef.current.rotation.z += delta * 0.05;
        }

        // 3. Planetary System Animation
        if (planetsRef.current) {
            const time = state.clock.elapsedTime;

            planetPositions.forEach((planet, i) => {
                const planetMesh = planetsRef.current?.children[i];
                if (planetMesh) {
                    const currentAngle = planet.angle + time * planet.speed;
                    planetMesh.position.x = Math.cos(currentAngle) * planet.radius;
                    planetMesh.position.z = Math.sin(currentAngle) * planet.radius;
                    planetMesh.position.y = Math.sin(currentAngle * 2) * 0.05; // Slight vertical oscillation
                }
            });
        }

        // 4. Entrance/Exit Animation
        const targetScale = active ? 1 : 0.001;
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 3);
        groupRef.current.scale.setScalar(newScale);
    });

    // Set initial position
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.copy(initialPos);
            const tilt = new THREE.Euler(0.15, 0, 0);
            groupRef.current.position.applyEuler(tilt);
        }
    }, [initialPos]);

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        if (!active) return;
        onHover(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        if (!active) return;
        onHover(false);
        document.body.style.cursor = 'auto';
    };

    const starColor = "#FFA500"; // Orange
    const glowColor = "#FFD700"; // Gold

    return (
        <group ref={groupRef} scale={active ? 1 : 0.001}>
            <group
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                scale={isHovered ? 1.3 : 1}
            >
                {/* DEBUG: VISIBLE HIT BOX */}
                <mesh visible={true}>
                    <sphereGeometry args={[0.6, 16, 16]} />
                    <meshBasicMaterial color="#ffff00" transparent opacity={0.1} depthWrite={false} wireframe />
                </mesh>

                {/* The Golden Star Core - Brighter and Bigger */}
                <mesh>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshBasicMaterial color="#fff" toneMapped={false} />
                </mesh>

                {/* Primary Glow (Inner Halo) - Smaller */}
                <mesh>
                    <sphereGeometry args={[0.18, 32, 32]} />
                    <meshBasicMaterial
                        color={starColor}
                        transparent
                        opacity={1.0}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Outer Gold Halo - Very Small */}
                <mesh>
                    <sphereGeometry args={[0.12, 32, 32]} />
                    <meshBasicMaterial
                        color={glowColor}
                        transparent
                        opacity={0.3}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>

                {/* Orbital Ring System - Smaller */}
                <group ref={ringsRef}>
                    <mesh rotation={[Math.PI / 3, 0, 0]}>
                        <torusGeometry args={[0.4, 0.006, 16, 64]} />
                        <meshBasicMaterial color={glowColor} transparent opacity={0.5} blending={THREE.AdditiveBlending} />
                    </mesh>
                    <mesh rotation={[0, Math.PI / 6, 0]}>
                        <torusGeometry args={[0.5, 0.004, 16, 64]} />
                        <meshBasicMaterial color={starColor} transparent opacity={0.4} blending={THREE.AdditiveBlending} />
                    </mesh>
                    <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                        <torusGeometry args={[0.6, 0.003, 16, 64]} />
                        <meshBasicMaterial color={glowColor} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
                    </mesh>
                </group>

                {/* Planetary System */}
                <group ref={planetsRef}>
                    {planetPositions.map((planet, i) => (
                        <mesh key={i}>
                            <sphereGeometry args={[planet.size, 16, 16]} />
                            <meshBasicMaterial
                                color={planet.color}
                                transparent
                                opacity={0.9}
                                toneMapped={false}
                            />
                        </mesh>
                    ))}
                </group>

                {/* Label */}
                <Html
                    position={[0.3, 0.3, 0]}
                    center
                    distanceFactor={10}
                    style={{
                        pointerEvents: 'none',
                        opacity: active ? 1 : 0,
                        transition: 'opacity 0.5s',
                        display: active ? 'block' : 'none'
                    }}
                >
                    <div className={`flex flex-col items-start transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100 opacity-80'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`h-[1px] transition-all duration-300 ${isHovered ? 'w-12 bg-orange-400' : 'w-8 bg-white/50'}`}></div>
                            <h1 className="text-lg font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]">
                                Golden<span className="text-orange-300">System</span>
                            </h1>
                        </div>
                        {isHovered && (
                            <p className="text-xs text-orange-100/90 ml-14 max-w-[180px] leading-tight mt-1 font-light backdrop-blur-md bg-black/40 p-2 rounded border-l-2 border-orange-400 shadow-[0_0_15px_rgba(255,165,0,0.2)]">
                                Planetary system active.<br/>Multiple celestial bodies.
                            </p>
                        )}
                    </div>
                </Html>
            </group>
        </group>
    );
};

const CameraRig: React.FC<{ active: boolean; focusTarget: string }> = ({ active, focusTarget }) => {
    const { camera, mouse } = useThree();
    const targetPos = new THREE.Vector3();
    const lookAtPos = new THREE.Vector3();

    useFrame((state, delta) => {
        if (active) {
            // If hovering any star system, camera drifts slightly closer
            if (focusTarget === 'wisdom') {
                targetPos.set(-1, 1.2, 3.8); // Slightly offset for WisdomSQL
            } else if (focusTarget === 'golden') {
                targetPos.set(1, 1.0, 4.0); // Slightly offset for Golden System
            } else {
                // Normal Explore Mode
                targetPos.set(0, 1.5, 3.5);
            }

            targetPos.x += mouse.x * 0.1; // Reduced mouse influence since we have OrbitControls
            targetPos.y += mouse.y * 0.1;

            camera.position.lerp(targetPos, delta * 0.4); // Slower lerp for smoother experience

            // Smooth look at
            lookAtPos.set(0, 0, 0);
            camera.lookAt(lookAtPos);
        } else {
            // Orbit Mode
            targetPos.set(mouse.x * 5, mouse.y * 2 + 6, 12);
            camera.position.lerp(targetPos, delta * 0.8);
            camera.lookAt(0, 0, 0);
        }
    });

    return null;
}

export const Scene: React.FC<SceneProps> = ({ active }) => {
  const [hoveringWisdom, setHoveringWisdom] = useState(false);
  const [hoveringGolden, setHoveringGolden] = useState(false);

  const getCurrentFocus = () => {
    if (hoveringWisdom) return 'wisdom';
    if (hoveringGolden) return 'golden';
    return '';
  };

  return (
    <Canvas
      camera={{ position: [0, 6, 12], fov: 50 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 2]}
      frameloop="always"
    >
      <color attach="background" args={['#030305']} />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
         {/* Pass hover state to Galaxy to trigger dimming */}
         <Galaxy active={active} dimmed={hoveringWisdom || hoveringGolden} />

         {/* The Special Embedded Star System */}
         <WisdomSystem active={active} onHover={setHoveringWisdom} isHovered={hoveringWisdom} />

         {/* The New Golden Star System */}
         <GoldenSystem active={active} onHover={setHoveringGolden} isHovered={hoveringGolden} />
      </Float>

      {/* Background stars also fade when focusing on WisdomSQL */}
      <group>
         <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      </group>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />

      <CameraRig active={active} focusTarget={getCurrentFocus()} />
      
      <fog attach="fog" args={['#030305', 8, 30]} />
      <ambientLight intensity={0.5} />
      
      {/* Dynamic lighting for WisdomSQL when active */}
      <pointLight
        position={[2, 1, 2]}
        color="#40E0D0"
        intensity={active && hoveringWisdom ? 3 : 0}
        distance={8}
        decay={2}
      />

      {/* Dynamic lighting for Golden System when active */}
      <pointLight
        position={[-2, 1.5, 1]}
        color="#FFA500"
        intensity={active && hoveringGolden ? 4 : 0}
        distance={10}
        decay={2}
      />
    </Canvas>
  );
};
