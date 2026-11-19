'use client';

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useDailyAvatar } from "@/app/hooks/useDailyAvatar";

const AVATARS_3D = [
    "/assets/images/avatar/Mmale.glb",
    "/assets/images/avatar/Mfemale.glb",
];

export function Avatar3D() {
    const avatarUrl = useDailyAvatar({
        key: "chatbot-avatar",
        values: AVATARS_3D
    });

    const { scene } = useGLTF(avatarUrl);
    const headMesh = useRef<THREE.Mesh | null>(null);
    const blinkValue = useRef(0);
    const smileValue = useRef(0);

    useEffect(() => {
        scene.traverse((obj: any) => {
            if (obj.isMesh && obj.morphTargetDictionary) {
                headMesh.current = obj;
            }
        });

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        scene.position.y -= center.y - size.y * 0.25;
        scene.position.x -= center.x;
        scene.position.z -= center.z * 0.1;
        scene.scale.set(1.5, 1.5, 1.5);
    }, [scene]);

    useFrame(({ clock, mouse }) => {
        if (!headMesh.current) return;
        const mesh: any = headMesh.current;
        const dict = mesh.morphTargetDictionary;
        const inf = mesh.morphTargetInfluences;
        const t = clock.getElapsedTime();

        const blinkTarget = Math.abs(Math.sin(t * 2.2)) < 0.04 ? 1 : 0;
        blinkValue.current += (blinkTarget - blinkValue.current) * 0.25;

        ["EyeBlinkLeft", "eyeBlink_L"].forEach(k => {
            const i = dict[k];
            if (i !== undefined) inf[i] = blinkValue.current;
        });
        ["EyeBlinkRight", "eyeBlink_R"].forEach(k => {
            const i = dict[k];
            if (i !== undefined) inf[i] = blinkValue.current;
        });

        const smileTarget = (Math.sin(t * 0.5) + 1) / 2;
        smileValue.current += (smileTarget - smileValue.current) * 0.05;

        ["MouthSmileLeft", "mouthSmile_L"].forEach(k => {
            const i = dict[k];
            if (i !== undefined) inf[i] = smileValue.current * 0.6;
        });
        ["MouthSmileRight", "mouthSmile_R"].forEach(k => {
            const i = dict[k];
            if (i !== undefined) inf[i] = smileValue.current * 0.6;
        });

        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, mouse.x * 0.2, 0.08);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, mouse.y * 0.1, 0.08);
    });

    return <primitive object={scene} />;
}
