import { BlockTemplates } from './blockTemplates.js';

export class BlockManager {
    constructor() {
        this.blocks = [];
        this.counter = 0;
        this.container = document.getElementById('blockContainer');
        
        // 크롭 및 드래그 기능을 위한 임시 저장 변수
        this.currentCrop = { img: null, blockId: null, zoom: 1, x: 0, y: 0 };
    }

    addBlock(type, savedData = null) {
        const id = this.counter++;
        const blockEl = this.createBlockElement(type, id, savedData);
        this.container.appendChild(blockEl);
        this.blocks.push({ type, id });
        
        return id;
    }

    createBlockElement(type, id, savedData) {
        const wrapper = document.createElement('div');
        wrapper.className = 'section-group';
        wrapper.id = `block_wrapper_${id}`;
        wrapper.dataset.type = type;
        
        const template = BlockTemplates.get(type, id);
        wrapper.innerHTML = template;
        
        // 1. 삭제 버튼 연결
        const deleteBtn = wrapper.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteBlock(id);
            });
        }

        // 2. [추가] 순서 변경 버튼 연결 (▲, ▼)
        const moveBtns = wrapper.querySelectorAll('.btn-move');
        moveBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.textContent === '▲' ? -1 : 1;
                this.moveBlock(id, direction);
            });
        });
        
        // 3. 파일 업로드 및 크롭 연결
        if (type === 'profile' || type === 'image_card' || type === 'video_file') {
            const dropZone = wrapper.querySelector(`#drop_${id}`);
            const fileInput = wrapper.querySelector(`#file_${id}`);
            
            if (dropZone && fileInput) {
                dropZone.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // [중요] 프로필일 때만 크롭 모달 띄우기
                    if (type === 'profile') {
                        this.initCropModal(file, id);
                    } else {
                        // 나머지는 기존처럼 바로 처리
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const result = event.target.result;
                            const dataInput = wrapper.querySelector(`#data_${id}`);
                            if (dataInput) dataInput.value = result;
                            if (type === 'video_file') {
                                dropZone.classList.add('has-video');
                                wrapper.querySelector(`#preview_${id}`).src = result;
                            } else {
                                dropZone.style.backgroundImage = `url(${result})`;
                            }
                            document.dispatchEvent(new Event('blockChanged'));
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
        
        // 입력 필드 자동 저장 이벤트
        wrapper.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                document.dispatchEvent(new Event('blockChanged'));
            });
        });
        
        if (savedData) {
            setTimeout(() => this.restoreBlockData(id, type, savedData), 0);
        }
        
        return wrapper;
    }

    // --- 프로필 크롭 및 드래그 기능 관련 함수 ---
    initCropModal(file, blockId) {
        const modal = document.getElementById('cropModal');
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        const zoomSlider = document.getElementById('zoomSlider');
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                modal.style.display = 'flex';
                // 데이터 초기화
                this.currentCrop = { img, blockId, zoom: 1, x: 0, y: 0 };
                this.drawCropCanvas();
                
                // 이벤트 드래그 설정
                this.setupDragEvents(canvas);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // 적용 버튼 클릭 시
        document.getElementById('btnCropApply').onclick = () => {
            const croppedData = canvas.toDataURL('image/jpeg');
            const wrapper = document.getElementById(`block_wrapper_${blockId}`);
            wrapper.querySelector(`#data_${blockId}`).value = croppedData;
            wrapper.querySelector(`#drop_${blockId}`).style.backgroundImage = `url(${croppedData})`;
            
            modal.style.display = 'none';
            this.currentCrop = { img: null, blockId: null, zoom: 1, x: 0, y: 0 };
            document.dispatchEvent(new Event('blockChanged'));
        };

        // 취소 버튼
        document.getElementById('btnCropCancel').onclick = () => {
            modal.style.display = 'none';
            this.currentCrop = { img: null, blockId: null, zoom: 1, x: 0, y: 0 };
        };

        // 확대 슬라이더
        zoomSlider.oninput = (e) => {
            this.currentCrop.zoom = parseFloat(e.target.value);
            this.drawCropCanvas();
        };
    }

    setupDragEvents(canvas) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        // 마우스 이벤트
        canvas.onmousedown = (e) => {
            isDragging = true;
            canvas.style.cursor = 'grabbing';
            startX = e.clientX - this.currentCrop.x;
            startY = e.clientY - this.currentCrop.y;
        };

        canvas.onmousemove = (e) => {
            if (isDragging) {
                this.currentCrop.x = e.clientX - startX;
                this.currentCrop.y = e.clientY - startY;
                this.drawCropCanvas();
            }
        };

        canvas.onmouseup = () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        };

        canvas.onmouseleave = () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        };

        // 터치 이벤트 (모바일 대응)
        canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX - this.currentCrop.x;
            startY = e.touches[0].clientY - this.currentCrop.y;
        });

        canvas.addEventListener('touchmove', (e) => {
            if (isDragging) {
                this.currentCrop.x = e.touches[0].clientX - startX;
                this.currentCrop.y = e.touches[0].clientY - startY;
                this.drawCropCanvas();
                // 스크롤 방지
                e.preventDefault();
            }
        });

        canvas.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    drawCropCanvas() {
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        const { img, zoom, x, y } = this.currentCrop;

        if (!img) return;

        canvas.width = 300;
        canvas.height = 300;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 확대 및 드래그 계산
        const size = Math.min(img.width, img.height);
        
        // 원본 중심에서 확대 적용
        const sW = size / zoom;
        const sH = size / zoom;
        const sX = (img.width - sW) / 2 - (x / zoom);
        const sY = (img.height - sH) / 2 - (y / zoom);

        // [중요] 캔버스의 중심에 그리도록 수정!
        ctx.drawImage(
            img, 
            sX, sY, sW, sH, // 원본에서 크롭할 위치
            0, 0, 300, 300 // 캔버스에 그릴 위치
        );
    }

    // --- 기존 유지 기능들 ---
    moveBlock(id, direction) {
        const index = this.blocks.findIndex(b => b.id === id);
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= this.blocks.length) return;

        [this.blocks[index], this.blocks[targetIndex]] = [this.blocks[targetIndex], this.blocks[index]];

        const wrapper = document.getElementById(`block_wrapper_${id}`);
        if (direction === -1) {
            this.container.insertBefore(wrapper, wrapper.previousElementSibling);
        } else {
            this.container.insertBefore(wrapper.nextElementSibling, wrapper);
        }
        document.dispatchEvent(new Event('blockChanged'));
    }

    restoreBlockData(id, type, data) {
        const fields = { name: `b_${id}_name`, title: `b_${id}_title`, desc: `b_${id}_desc`, github: `b_${id}_github`, blog: `b_${id}_blog`, email: `b_${id}_email` };
        Object.entries(fields).forEach(([key, elementId]) => {
            const el = document.getElementById(elementId);
            if (el && data[key]) el.value = data[key];
        });
        if (data.imgData) {
            const dataEl = document.getElementById(`data_${id}`);
            if (dataEl) dataEl.value = data.imgData;
            const dropZone = document.getElementById(`drop_${id}`);
            if (dropZone) {
                if (type === 'video_file') {
                    dropZone.classList.add('has-video');
                    const preview = document.getElementById(`preview_${id}`);
                    if (preview) preview.src = data.imgData;
                } else {
                    dropZone.style.backgroundImage = `url(${data.imgData})`;
                }
            }
        }
    }

    deleteBlock(id) {
        const wrapper = document.getElementById(`block_wrapper_${id}`);
        if (wrapper) wrapper.remove();
        this.blocks = this.blocks.filter(b => b.id !== id);
        document.dispatchEvent(new Event('blockChanged'));
    }

    getState() {
        return {
            introTitle: document.getElementById('introTitle').value,
            introBtnText: document.getElementById('introBtnText').value,
            shape: document.getElementById('shape').value,
            color: document.getElementById('color').value,
            blocks: this.blocks.map(b => this.getBlockData(b.id, b.type))
        };
    }

    getBlockData(id, type) {
        return {
            type,
            name: document.getElementById(`b_${id}_name`)?.value,
            title: document.getElementById(`b_${id}_title`)?.value,
            desc: document.getElementById(`b_${id}_desc`)?.value,
            github: document.getElementById(`b_${id}_github`)?.value,
            blog: document.getElementById(`b_${id}_blog`)?.value,
            email: document.getElementById(`b_${id}_email`)?.value,
            imgData: document.getElementById(`data_${id}`)?.value
        };
    }
}
