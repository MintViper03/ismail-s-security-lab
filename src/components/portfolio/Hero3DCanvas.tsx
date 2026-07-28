import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type Mode = "attack" | "defend";

const ATTACK_COLOR = new THREE.Color("#ff5f3c");
const DEFEND_COLOR = new THREE.Color("#00d4c8");

// ---- geometry generation (runs once) -----------------------------------

function generateNodes(count: number) {
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
        // distribute inside a flattened ellipsoid so it reads as a wide
        // "network" rather than a perfect sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.4 + Math.random() * 1.4;
        const x = r * Math.sin(phi) * Math.cos(theta) * 1.5;
        const y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
        const z = r * Math.cos(phi) * 1.1;
        nodes.push(new THREE.Vector3(x, y, z));
    }
    return nodes;
}

function buildConnections(nodes: THREE.Vector3[], maxDist: number, maxLinks: number) {
    const positions: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const dists: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            const d = nodes[i].distanceTo(nodes[j]);
            if (d < maxDist) dists.push({ j, d });
        }
        dists.sort((a, b) => a.d - b.d);
        for (const { j } of dists.slice(0, maxLinks)) {
            if (j > i) {
                positions.push(nodes[i].x, nodes[i].y, nodes[i].z);
                positions.push(nodes[j].x, nodes[j].y, nodes[j].z);
            }
        }
    }
    return new Float32Array(positions);
}

// ---- scene contents -----------------------------------------------------

function NetworkScene({ mode, reducedMotion }: { mode: Mode; reducedMotion: boolean }) {
    const { size } = useThree();
    const isSmall = size.width < 720;
    const nodeCount = isSmall ? 34 : 64;

    const nodes = useMemo(() => generateNodes(nodeCount), [nodeCount]);
    const linePositions = useMemo(
        () => buildConnections(nodes, isSmall ? 2.0 : 2.3, 2),
        [nodes, isSmall]
    );

    const groupRef = useRef<THREE.Group>(null);
    const nodeMeshRef = useRef<THREE.InstancedMesh>(null);
    const lineMatRef = useRef<THREE.LineBasicMaterial>(null);
    const nodeMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const currentColor = useRef(DEFEND_COLOR.clone());
    const targetColor = useRef(DEFEND_COLOR.clone());
    const mouse = useRef({ x: 0, y: 0 });
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const scanZ = useRef(-3.5);

    useEffect(() => {
        targetColor.current = mode === "attack" ? ATTACK_COLOR : DEFEND_COLOR;
    }, [mode]);

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    useFrame((_, delta) => {
        // smooth color transition between attack/defend palettes
        currentColor.current.lerp(targetColor.current, Math.min(delta * 3, 1));
        lineMatRef.current?.color.copy(currentColor.current);
        nodeMatRef.current?.color.copy(currentColor.current);

        if (groupRef.current) {
            if (!reducedMotion) {
                groupRef.current.rotation.y += delta * 0.06;
            }
            // gentle parallax toward mouse position
            const targetRotX = mouse.current.y * 0.15;
            const targetRotZ = -mouse.current.x * 0.1;
            groupRef.current.rotation.x +=
                (targetRotX - groupRef.current.rotation.x) * 0.03;
            groupRef.current.rotation.z +=
                (targetRotZ - groupRef.current.rotation.z) * 0.03;
        }

        // per-node subtle pulse via instance scale
        if (nodeMeshRef.current && !reducedMotion) {
            const t = performance.now() / 1000;
            for (let i = 0; i < nodes.length; i++) {
                const p = nodes[i];
                const s = 1 + Math.sin(t * 1.4 + i) * 0.18;
                dummy.position.copy(p);
                dummy.scale.setScalar(0.045 * s);
                dummy.updateMatrix();
                nodeMeshRef.current.setMatrixAt(i, dummy.matrix);
            }
            nodeMeshRef.current.instanceMatrix.needsUpdate = true;
        }

        // scanning sweep, representing a recon/port-scan pass through the graph
        if (!reducedMotion) {
            scanZ.current += delta * 1.6;
            if (scanZ.current > 3.5) scanZ.current = -3.5;
        }
    });

    return (
        <group ref={groupRef}>
            <lineSegments>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[linePositions, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    ref={lineMatRef}
                    transparent
                    opacity={0.28}
                    color={currentColor.current}
                />
            </lineSegments>

            <instancedMesh ref={nodeMeshRef} args={[undefined, undefined, nodes.length]}>
                <sphereGeometry args={[1, 8, 8]} />
                <meshBasicMaterial
                    ref={nodeMatRef}
                    color={currentColor.current}
                    transparent
                    opacity={0.85}
                />
            </instancedMesh>
        </group>
    );
}

function WebGLCanvas({ mode }: { mode: Mode }) {
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(mq.matches);
    }, []);

    return (
        <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 7], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ position: "absolute", inset: 0 }}
        >
            <Suspense fallback={null}>
                <NetworkScene mode={mode} reducedMotion={reducedMotion} />
            </Suspense>
        </Canvas>
    );
}

/**
 * Heavy implementation module: pulls in three.js + @react-three/fiber.
 * This file is only ever loaded via a dynamic import() from Hero3D.tsx,
 * triggered client-side after mount — it must never be statically
 * imported, or its ~400kb+ weight leaks into the SSR server bundle.
 */
export function Hero3DCanvasImpl({ mode }: { mode: Mode }) {
    return <WebGLCanvas mode={mode} />;
}
