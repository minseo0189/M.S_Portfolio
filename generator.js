export class CodeGenerator {
    generate(state) {
        const { introTitle, introBtnText, color, shape, blocks } = state;
        
        const geometryCode = this.getGeometryCode(shape);
        const mainHtml = this.generateMainHtml(blocks, color);
        
        return this.buildFullHtml(introTitle, introBtnText, color, geometryCode, mainHtml);
    }

    getGeometryCode(shape) {
        const geometries = {
            'TorusGeometry': 'new THREE.TorusGeometry(1, 0.4, 16, 100)',
            'BoxGeometry': 'new THREE.BoxGeometry(1.5, 1.5, 1.5)',
            'IcosahedronGeometry': 'new THREE.IcosahedronGeometry(1, 0)',
            'TorusKnotGeometry': 'new THREE.TorusKnotGeometry(0.8, 0.3, 100, 16)'
        };
        return geometries[shape] || geometries['TorusGeometry'];
    }

    formatText(text) {
        return text ? text.replace(/\n/g, '<br>') : '';
    }

    generateMainHtml(blocks, color) {
        let html = '';
        
        blocks.forEach(block => {
            const { type, title, desc, name, github, blog, email, imgData } = block;
            
            switch (type) {
                case 'profile':
                    html += this.generateProfile(imgData, name, desc);
                    break;
                case 'text':
                    html += this.generateText(title, desc, color);
                    break;
                case 'image_card':
                    html += this.generateImageCard(imgData, title, desc);
                    break;
                case 'video_file':
                    html += this.generateVideo(title, imgData);
                    break;
                case 'sns':
                    html += this.generateSNS(github, blog, email, color);
                    break;
            }
        });
        
        return html;
    }

    generateProfile(imgData, name, desc) {
        return `<div class="profile-section">
            <img src="${imgData || 'https://via.placeholder.com/150'}" class="profile-img">
            <h2>${name || ''}</h2>
            <p>${this.formatText(desc || '')}</p>
        </div>`;
    }

    generateText(title, desc, color) {
        return `<div class="content-item">
            <h2 style="border-left: 4px solid ${color}; padding-left: 10px; color: ${color};">
                ${title || ''}
            </h2>
            <p>${this.formatText(desc || '')}</p>
        </div>`;
    }

    generateImageCard(imgData, title, desc) {
        return `<div class="project-card">
            <img src="${imgData || 'https://via.placeholder.com/600x400'}">
            <div class="card-info">
                <h3>${title || ''}</h3>
                <p>${this.formatText(desc || '')}</p>
            </div>
        </div>`;
    }

    generateVideo(title, imgData) {
        return `<div class="content-item">
            <h3>${title || ''}</h3>
            <div class="video-container">
                <video autoplay loop muted playsinline controls width="100%">
                    <source src="${imgData || ''}" type="video/mp4">
                </video>
            </div>
        </div>`;
    }

    generateSNS(github, blog, email, color) {
        let html = '<div class="sns-container">';
        
        if (github) {
            html += `<a href="${github}" target="_blank" class="sns-btn">🎨 Social</a>`;
        }
        if (blog) {
            html += `<a href="${blog}" target="_blank" class="sns-btn">🔗 Link</a>`;
        }
        if (email) {
            html += `<a href="javascript:void(0)" 
                onclick="navigator.clipboard.writeText('${email}').then(() => 
                alert('✅ 이메일 주소가 복사되었습니다:\\n${email}'));" 
                class="sns-btn">✉️ Email</a>`;
        }
        
        html += '</div>';
        return html;
    }

    buildFullHtml(title, btnText, color, geometryCode, mainHtml) {
        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🩵</text></svg>">
    <style>
        body { margin: 0; font-family: 'Pretendard', sans-serif; background: #111; color: white; overflow-x: hidden; user-select: none; }
        #canvas-container { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; z-index: -1; transition: opacity 0.8s; cursor: grab; }
        #canvas-container:active { cursor: grabbing; }
        #intro-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 10; transition: 0.8s; padding-top: 200px; pointer-events: none; }
        .enter-btn { pointer-events: auto; padding: 15px 40px; font-size: 1.1rem; background: transparent; color: ${color}; border: 2px solid ${color}; border-radius: 50px; cursor: pointer; transition: 0.3s; }
        .enter-btn:hover { background: ${color}; color: #000; box-shadow: 0 0 20px ${color}; }
        .intro-title { font-size: 2.5rem; font-weight: bold; margin-bottom: 30px; text-shadow: 0 0 15px ${color}; text-align: center; padding: 0 20px; }
        #main-screen { display: none; position: relative; width: 100%; min-height: 100vh; padding: 80px 20px; box-sizing: border-box; background: #111; opacity: 0; transition: opacity 0.8s; user-select: text; }
        .container { max-width: 800px; margin: 0 auto; }
        .profile-img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid ${color}; margin-bottom: 15px; }
        .profile-section { text-align: center; margin-bottom: 50px; }
        .project-card { background: #222; border-radius: 12px; overflow: hidden; margin-bottom: 30px; border: 1px solid #333; transition: transform 0.3s; }
        .project-card:hover { transform: translateY(-5px); border-color: ${color}; }
        .project-card img { width: 100%; height: auto; display: block; }
        .card-info { padding: 20px; }
        .content-item { margin-bottom: 40px; }
        video { border-radius: 8px; }
        .sns-container { display: flex; justify-content: center; gap: 10px; margin-top: 20px; margin-bottom: 40px; flex-wrap: wrap; padding: 10px 0; position: relative; z-index: 10; }
        .sns-btn { text-decoration: none; color: #fff; background: #333; padding: 10px 20px; border-radius: 8px; border: 1px solid #444; transition: 0.2s; position: relative; z-index: 20; cursor: pointer; pointer-events: auto; }
        .sns-btn:hover { background: ${color}; color: #000; border-color: ${color}; }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    <div id="intro-screen">
        <div class="intro-title">${title}</div>
        <button class="enter-btn" onclick="enterSite()">${btnText}</button>
    </div>
    <div id="main-screen">
        <div class="container">${mainHtml}</div>
    </div>
    <script>
        function enterSite() {
            const intro = document.getElementById('intro-screen');
            const canvas = document.getElementById('canvas-container');
            const main = document.getElementById('main-screen');
            intro.style.opacity = '0';
            canvas.style.opacity = '0';
            setTimeout(() => { 
                intro.style.display = 'none';
                canvas.style.display = 'none';
                main.style.display = 'block';
                setTimeout(() => { main.style.opacity = '1'; }, 50);
            }, 800);
        }
    <\/script>
    <script type="importmap"> { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } } <\/script>
    <script type="module">
        import * as THREE from 'three';
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        const light = new THREE.DirectionalLight(0xffffff, 2); 
        light.position.set(1, 1, 1); 
        scene.add(light);
        const mesh = new THREE.Mesh(${geometryCode}, new THREE.MeshStandardMaterial({ color: "${color}", wireframe: true }));
        scene.add(mesh);
        camera.position.z = 3.5;
        mesh.position.y = 0.5;
        
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        document.addEventListener('mousedown', (e) => { 
            if(e.target.closest('a') || e.target.closest('button')) return;
            isDragging = true; 
            previousMousePosition = { x: e.clientX, y: e.clientY }; 
        });
        document.addEventListener('touchstart', (e) => { 
            if(e.target.closest('a') || e.target.closest('button')) return;
            isDragging = true; 
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }; 
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('touchend', () => { isDragging = false; });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = { 
                    x: e.clientX - previousMousePosition.x, 
                    y: e.clientY - previousMousePosition.y 
                };
                mesh.rotation.y += deltaMove.x * 0.005;
                mesh.rotation.x += deltaMove.y * 0.005;
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                const deltaMove = { 
                    x: e.touches[0].clientX - previousMousePosition.x, 
                    y: e.touches[0].clientY - previousMousePosition.y 
                };
                mesh.rotation.y += deltaMove.x * 0.005;
                mesh.rotation.x += deltaMove.y * 0.005;
                previousMousePosition = { 
                    x: e.touches[0].clientX, 
                    y: e.touches[0].clientY 
                };
            }
        });
        
        function animate() { 
            requestAnimationFrame(animate); 
            if (!isDragging) { 
                mesh.rotation.x += 0.002; 
                mesh.rotation.y += 0.002; 
            }
            renderer.render(scene, camera); 
        }
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        animate();
    <\/script>
</body>
</html>`;
    }
}
