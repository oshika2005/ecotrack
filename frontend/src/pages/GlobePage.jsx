import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Globe as GlobeIcon } from 'lucide-react';

function EcoPoint({ position, intensity, label }) {
  const meshRef = useRef();
  const color = intensity > 0.7 ? '#10b981' : intensity > 0.4 ? '#f59e0b' : '#ef4444';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
      <pointLight color={color} intensity={0.3} distance={0.5} />
    </group>
  );
}

function Earth() {
  const earthRef = useRef();
  const atmosphereRef = useRef();

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.0008;
    }
  });

  // Generate sample eco-activity points on the sphere
  const points = useMemo(() => {
    const pts = [];
    const locations = [
      { lat: 40.7, lng: -74, intensity: 0.9, label: 'New York' },
      { lat: 51.5, lng: -0.1, intensity: 0.85, label: 'London' },
      { lat: 35.7, lng: 139.7, intensity: 0.8, label: 'Tokyo' },
      { lat: 28.6, lng: 77.2, intensity: 0.6, label: 'Delhi' },
      { lat: -33.9, lng: 151.2, intensity: 0.75, label: 'Sydney' },
      { lat: 48.9, lng: 2.35, intensity: 0.7, label: 'Paris' },
      { lat: -23.5, lng: -46.6, intensity: 0.5, label: 'Sao Paulo' },
      { lat: 55.75, lng: 37.6, intensity: 0.4, label: 'Moscow' },
      { lat: 1.35, lng: 103.8, intensity: 0.8, label: 'Singapore' },
      { lat: 37.6, lng: -122.4, intensity: 0.9, label: 'San Francisco' },
      { lat: 52.5, lng: 13.4, intensity: 0.85, label: 'Berlin' },
      { lat: 19.4, lng: -99.1, intensity: 0.45, label: 'Mexico City' },
    ];

    locations.forEach(({ lat, lng, intensity, label }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 1.02;
      const x = -(r * Math.sin(phi) * Math.cos(theta));
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      pts.push({ position: [x, y, z], intensity, label });
    });
    return pts;
  }, []);

  return (
    <group>
      {/* Earth sphere */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#1a365d"
          roughness={0.8}
          metalness={0.1}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.005, 32, 32]}>
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.06} />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[1.08, 64, 64]}>
        <meshStandardMaterial
          color="#10b981"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Eco activity points */}
      {points.map((p, i) => (
        <EcoPoint key={i} {...p} />
      ))}
    </group>
  );
}

export default function GlobePage() {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>
        <GlobeIcon size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
        3D Earth View
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Global eco-activity density visualization.</p>

      <div className="glass-card" style={{ height: '65vh', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative' }}>
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1} />
          <pointLight position={[-5, -3, -5]} intensity={0.3} color="#06b6d4" />
          <Earth />
          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.3} minDistance={1.8} maxDistance={4} />
        </Canvas>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 20, right: 20, padding: '12px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Activity Density</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />High</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />Medium</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />Low</div>
          </div>
        </div>
      </div>
    </div>
  );
}
