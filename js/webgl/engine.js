export const WebGLEngine = (() => {
    const heroVert = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
    const heroFrag = `
        uniform sampler2D uTex1;
        uniform sampler2D uTex2;
        uniform float uProgress;
        varying vec2 vUv;

        void main() {
            vec2 p1 = vUv + (vUv - 0.5) * (uProgress * 0.03);
            vec2 p2 = vUv + (vUv - 0.5) * ((1.0 - uProgress) * 0.03);
            
            vec4 c1 = texture2D(uTex1, p1);
            vec4 c2 = texture2D(uTex2, p2);
            
            gl_FragColor = mix(c1, c2, uProgress);
        }
    `;

    let particlesCtx, heroCtx, logoCtx;

    const initParticles = () => {
        const canvas = document.getElementById('webgl-particles');
        if(!canvas || typeof THREE === 'undefined') return;

        particlesCtx = { renderer: new THREE.WebGLRenderer({ canvas, alpha: true }) };
        particlesCtx.renderer.setSize(window.innerWidth, window.innerHeight);
        
        particlesCtx.scene = new THREE.Scene();
        particlesCtx.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        particlesCtx.camera.position.z = 200;

        const circleCanvas = document.createElement('canvas');
        circleCanvas.width = 32; circleCanvas.height = 32;
        const ctx = circleCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient; ctx.fillRect(0,0,32,32);
        const texture = new THREE.CanvasTexture(circleCanvas);

        const count = window.innerWidth > 900 ? 100 : 30; 
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        const palette = [new THREE.Color(0xE58D2E), new THREE.Color(0xF2A65A), new THREE.Color(0x3B2D26), new THREE.Color(0x1F2232)];

        for(let i=0; i<count; i++) {
            positions.push((Math.random() - 0.5) * 800);
            positions.push((Math.random() - 0.5) * 800);
            positions.push((Math.random() - 0.5) * 400);
            const col = palette[Math.floor(Math.random() * palette.length)];
            colors.push(col.r, col.g, col.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        particlesCtx.material = new THREE.PointsMaterial({
            size: 2.5, vertexColors: true, map: texture, transparent: true, opacity: 0.15, depthWrite: false, blending: THREE.AdditiveBlending
        });

        particlesCtx.mesh = new THREE.Points(geometry, particlesCtx.material);
        particlesCtx.scene.add(particlesCtx.mesh);
        
        particlesCtx.mouseX = 0; particlesCtx.mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            particlesCtx.mouseX = (e.clientX - window.innerWidth/2) * 0.01; 
            particlesCtx.mouseY = (e.clientY - window.innerHeight/2) * 0.01;
        });
    };

    const initHero = () => {
        const canvas = document.getElementById('webgl-hero');
        const imgs = document.querySelectorAll('.slide img');
        if(!canvas || imgs.length === 0 || typeof THREE === 'undefined') return;

        heroCtx = { renderer: new THREE.WebGLRenderer({ canvas, alpha: true }) };
        heroCtx.renderer.setSize(window.innerWidth, window.innerHeight);

        heroCtx.scene = new THREE.Scene();
        heroCtx.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');
        heroCtx.textures = Array.from(imgs).map(img => loader.load(img.src));

        heroCtx.material = new THREE.ShaderMaterial({
            uniforms: {
                uTex1: { value: heroCtx.textures[0] },
                uTex2: { value: heroCtx.textures[1] },
                uProgress: { value: 0 }
            },
            vertexShader: heroVert, fragmentShader: heroFrag
        });

        heroCtx.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), heroCtx.material);
        heroCtx.scene.add(heroCtx.mesh);
    };

    const initLogo = () => {
        const canvas = document.getElementById('webgl-logo');
        if(!canvas || typeof THREE === 'undefined') return;

        logoCtx = { renderer: new THREE.WebGLRenderer({ canvas, alpha: true }) };
        logoCtx.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        logoCtx.scene = new THREE.Scene();
        logoCtx.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        logoCtx.material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            uniforms: { uTime: { value: 0 } },
            vertexShader: heroVert,
            fragmentShader: `
                uniform float uTime;
                varying vec2 vUv;
                void main() {
                    float sweep = sin(vUv.x * 2.0 - uTime * 1.5) * 0.5 + 0.5;
                    float glow = exp(-pow(vUv.y - 0.5, 2.0) * 20.0) * exp(-pow(vUv.x - 0.5, 2.0) * 5.0);
                    vec3 color = vec3(0.9, 0.55, 0.18) * sweep * glow * 0.3; 
                    gl_FragColor = vec4(color, color.r);
                }
            `
        });

        logoCtx.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), logoCtx.material);
        logoCtx.scene.add(logoCtx.mesh);
    };

    const playHeroTransition = (oldIdx, newIdx) => {
        if(!heroCtx) return;
        heroCtx.material.uniforms.uTex1.value = heroCtx.textures[oldIdx];
        heroCtx.material.uniforms.uTex2.value = heroCtx.textures[newIdx];
        heroCtx.material.uniforms.uProgress.value = 0;
        
        let start = null;
        const animateT = (time) => {
            if(!start) start = time;
            let p = (time - start) / 500; 
            if(p >= 1) {
                heroCtx.material.uniforms.uProgress.value = 1;
                return;
            }
            heroCtx.material.uniforms.uProgress.value = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            requestAnimationFrame(animateT);
        };
        requestAnimationFrame(animateT);
    };

    const renderLoop = (time) => {
        requestAnimationFrame(renderLoop);
        
        if(particlesCtx) {
            const pos = particlesCtx.mesh.geometry.attributes.position.array;
            for(let i=1; i<pos.length; i+=3) {
                pos[i] += Math.sin(time*0.001 + pos[i-1]) * 0.05 + 0.05;
                if(pos[i] > 400) pos[i] = -400; 
            }
            particlesCtx.mesh.geometry.attributes.position.needsUpdate = true;
            
            particlesCtx.camera.position.x += (particlesCtx.mouseX - particlesCtx.camera.position.x) * 0.05;
            particlesCtx.camera.position.y += (-particlesCtx.mouseY - particlesCtx.camera.position.y) * 0.05;
            particlesCtx.camera.lookAt(particlesCtx.scene.position);
            
            particlesCtx.renderer.render(particlesCtx.scene, particlesCtx.camera);
        }

        if(heroCtx && document.getElementById('inicio').style.display !== 'none') {
            heroCtx.renderer.render(heroCtx.scene, heroCtx.camera);
        }

        if(logoCtx) {
            logoCtx.material.uniforms.uTime.value = time * 0.001;
            logoCtx.renderer.render(logoCtx.scene, logoCtx.camera);
        }
    };

    const resize = () => {
        if(particlesCtx) {
            particlesCtx.camera.aspect = window.innerWidth / window.innerHeight;
            particlesCtx.camera.updateProjectionMatrix();
            particlesCtx.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        if(heroCtx) heroCtx.renderer.setSize(window.innerWidth, window.innerHeight);
        if(logoCtx) {
            const c = document.getElementById('webgl-logo');
            logoCtx.renderer.setSize(c.clientWidth, c.clientHeight);
        }
    };

    return {
        init: () => {
            initParticles(); initHero(); initLogo();
            window.addEventListener('resize', resize);
            requestAnimationFrame(renderLoop);
        },
        playHeroTransition
    };
})();