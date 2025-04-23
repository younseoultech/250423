// 1) three.js 초기화
let scene, camera, renderer, cube, tesseract;
const canvas = document.getElementById('three-canvas');

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(500, 500);

    camera.position.z = 5;
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.5);
    dir.position.set(1,1,1); 
    scene.add(dir);

    // 3D: 큐브
    const cubeGeo = new THREE.BoxGeometry(2,2,2);
    const cubeMat = new THREE.MeshPhongMaterial({ 
        wireframe: true, 
        transparent: true, 
        opacity: 0.8 
    });
    cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.visible = false;
    scene.add(cube);

    // 4D: 테서랙트 (LineSegments)
    const vertices = [
        // 안쪽 큐브
        new THREE.Vector3(-1, -1, -1),
        new THREE.Vector3(1, -1, -1),
        new THREE.Vector3(1, 1, -1),
        new THREE.Vector3(-1, 1, -1),
        new THREE.Vector3(-1, -1, 1),
        new THREE.Vector3(1, -1, 1),
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(-1, 1, 1),
        // 바깥쪽 큐브
        new THREE.Vector3(-1.5, -1.5, -1.5),
        new THREE.Vector3(1.5, -1.5, -1.5),
        new THREE.Vector3(1.5, 1.5, -1.5),
        new THREE.Vector3(-1.5, 1.5, -1.5),
        new THREE.Vector3(-1.5, -1.5, 1.5),
        new THREE.Vector3(1.5, -1.5, 1.5),
        new THREE.Vector3(1.5, 1.5, 1.5),
        new THREE.Vector3(-1.5, 1.5, 1.5)
    ];

    const edges = [
        // 안쪽 큐브
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
        // 바깥쪽 큐브
        [8, 9], [9, 10], [10, 11], [11, 8],
        [12, 13], [13, 14], [14, 15], [15, 12],
        [8, 12], [9, 13], [10, 14], [11, 15],
        // 연결선
        [0, 8], [1, 9], [2, 10], [3, 11],
        [4, 12], [5, 13], [6, 14], [7, 15]
    ];

    const positions = [];
    edges.forEach(edge => {
        positions.push(
            ...vertices[edge[0]].toArray(),
            ...vertices[edge[1]].toArray()
        );
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({ 
        transparent: true, 
        opacity: 0.8 
    });
    tesseract = new THREE.LineSegments(geom, mat);
    tesseract.visible = false;
    scene.add(tesseract);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if(cube.visible) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    if(tesseract.visible) {
        tesseract.rotation.x += 0.01;
        tesseract.rotation.y += 0.01;
        tesseract.rotation.z += 0.005;
    }
    renderer.render(scene, camera);
}

// 2) 차원 전환 함수
const container = document.querySelector('.dimension-features .wrap');
function setDimension(dim) {
    // CSS 클래스 토글
    container.classList.remove('morph-0d','morph-1d','morph-2d','morph-3d','morph-4d');
    container.classList.add(`morph-${dim}d`);

    // three.js 오브젝트 표시 제어
    cube.visible = (dim === 3);
    tesseract.visible = (dim === 4);
}

// 3) 스크롤에 따라 텍스트 + 모핑 차원 바꾸기
const texts = document.querySelectorAll('.dimension-text');
const dimensionFeatures = document.querySelector('.dimension-features');
let cur = 0;

window.addEventListener('scroll', () => {
    const winH = window.innerHeight;
    const center = winH/2;
    
    // 각 텍스트의 위치를 확인하고 가장 중앙에 가까운 텍스트 찾기
    let closestText = null;
    let minDistance = Infinity;
    
    texts.forEach((text) => {
        const rect = text.getBoundingClientRect();
        const textCenter = rect.top + rect.height/2;
        const distance = Math.abs(textCenter - center);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestText = text;
        }
    });
    
    // 가장 가까운 텍스트가 중앙 근처에 있을 때만 차원 변경
    if (closestText && minDistance < winH/4) {
        const dimension = Array.from(texts).indexOf(closestText);
        if (cur !== dimension) {
            cur = dimension;
            // 모든 텍스트 비활성화
            texts.forEach(t => t.classList.remove('active'));
            // 현재 텍스트 활성화
            closestText.classList.add('active');
            // 차원 변경
            setDimension(dimension);
        }
    }
});

// 4) 초기화
document.addEventListener('DOMContentLoaded', () => {
    // morph-container를 body로 이동
    const morph = document.querySelector('.morph-container');
    document.body.appendChild(morph);
    
    initThree();
    setDimension(0);
}); 