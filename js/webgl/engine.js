import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export const WebGLEngine = (() => {
    let scene, camera, renderer, instancedMesh;
    let mainLight, fillLight, backLight;
    
    let mouse = new THREE.Vector2(0, 0);
    let targetMouse = new THREE.Vector2(0, 0);
    let clock = new THREE.Clock();
    
    let speedController = { value: 0.05 };
    const dummy = new THREE.Object3D();
    const count = 350; 
    const instanceData = []; 

    const palettes = [
        { main: new THREE.Color("#E58D2E"), fill: new THREE.Color("#1A1107"), fog: 0x070503 },
        { main: new THREE.Color("#FFFFFF"), fill: new THREE.Color("#111116"), fog: 0x050508 },
        { main: new THREE.Color("#B36A22"), fill: new THREE.Color("#201005"), fog: 0x080402 } 
    ];

    const init = () => {
        const canvas = document.getElementById('webgl-hero');
        if (!canvas) return;

        scene = new THREE.Scene();
        // CORRECCIÓN: Fondo sólido idéntico a la niebla para dar profundidad infinita
        scene.background = new THREE.Color(palettes[0].fog);
        scene.fog = new THREE.FogExp2(palettes[0].fog, 0.015);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200);
        camera.position.set(0, 0, 10);

        // Sin alpha:true para máxima performance y profundidad
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); 
        scene.add(ambientLight);

        mainLight = new THREE.PointLight(palettes[0].main, 2, 100);
        mainLight.position.set(5, 5, -20);
        scene.add(mainLight);

        fillLight = new THREE.PointLight(palettes[0].fill, 3, 100);
        fillLight.position.set(-10, -5, -40);
        scene.add(fillLight);

        backLight = new THREE.PointLight(palettes[0].main, 5, 150);
        backLight.position.set(0, 10, -80);
        scene.add(backLight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x050505,       
            metalness: 0.6,        
            roughness: 0.3,        
            clearcoat: 0.1,        
            reflectivity: 0.8
        });

        instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        scene.add(instancedMesh);

        for (let i = 0; i < count; i++) {
            let x = (Math.random() - 0.5) * 60; 
            let y = (Math.random() - 0.5) * 40; 
            let z = (Math.random() - 1.0) * 120; 

            if (Math.abs(x) < 6) x += (x < 0 ? -6 : 6);
            if (Math.abs(y) < 4) y += (y < 0 ? -4 : 4);

            const scaleX = Math.random() * 2 + 0.5;
            const scaleY = Math.random() * 2 + 0.5;
            const scaleZ = Math.random() * 20 + 5; 

            dummy.position.set(x, y, z);
            dummy.scale.set(scaleX, scaleY, scaleZ);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);

            instanceData.push({ x, y, z, scaleX, scaleY, scaleZ });
        }
        instancedMesh.instanceMatrix.needsUpdate = true;

        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', (e) => {
            targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 3;
            targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 3;
        });

        animate();
    };

    const changeScene = (slideIndex) => {
        if(!mainLight) return;
        const target = palettes[slideIndex % palettes.length];
        
        gsap.to(mainLight.color, { r: target.main.r, g: target.main.g, b: target.main.b, duration: 1.5, ease: "power2.inOut" });
        gsap.to(backLight.color, { r: target.main.r, g: target.main.g, b: target.main.b, duration: 1.5, ease: "power2.inOut" });
        gsap.to(fillLight.color, { r: target.fill.r, g: target.fill.g, b: target.fill.b, duration: 1.5, ease: "power2.inOut" });
        
        // Animamos tanto la niebla como el fondo para coherencia absoluta
        gsap.to(scene.fog.color, { r: new THREE.Color(target.fog).r, g: new THREE.Color(target.fog).g, b: new THREE.Color(target.fog).b, duration: 1.5, ease: "power2.inOut" });
        gsap.to(scene.background, { r: new THREE.Color(target.fog).r, g: new THREE.Color(target.fog).g, b: new THREE.Color(target.fog).b, duration: 1.5, ease: "power2.inOut" });

        gsap.to(speedController, {
            value: 0.8, 
            duration: 0.8,
            ease: "power2.in",
            yoyo: true,
            repeat: 1
        });
    };

    const resize = () => {
        if(!renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const data = instanceData[i];
            
            data.z += speedController.value;

            if (data.z > 15) {
                data.z -= 135;
            }

            const floatY = data.y + Math.sin(time * 0.5 + i) * 0.5;

            dummy.position.set(data.x, floatY, data.z);
            dummy.scale.set(data.scaleX, data.scaleY, data.scaleZ);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;

        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;
        
        camera.position.x = mouse.x;
        camera.position.y = mouse.y + 2; 
        camera.lookAt(mouse.x * 0.5, mouse.y * 0.5, -50);

        mainLight.position.x = Math.sin(time * 0.5) * 10;
        fillLight.position.y = Math.cos(time * 0.3) * 10 - 5;

        renderer.render(scene, camera);
    };

    return { init, changeScene };
})();
