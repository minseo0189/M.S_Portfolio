import { BlockTemplates } from './blockTemplates.js';

export class BlockManager {
    constructor() {
        this.blocks = [];
        this.counter = 0;
        this.container = document.getElementById('blockContainer');
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
        
        // [수정!] document 대신 wrapper 안에서 직접 버튼을 찾도록 바꿨어
        const deleteBtn = wrapper.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteBlock(id));
        }
        
        // 파일 업로드 기능이 있는 블록인 경우
        if (type === 'profile' || type === 'image_card' || type === 'video_file') {
            const dropZone = wrapper.querySelector(`#drop_${id}`);
            const fileInput = wrapper.querySelector(`#file_${id}`);
            const dataInput = wrapper.querySelector(`#data_${id}`);
            const previewVideo = wrapper.querySelector(`#preview_${id}`);

            if (dropZone && fileInput) {
                dropZone.addEventListener('click', () => fileInput.click());
                
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const result = event.target.result;
                        if (dataInput) dataInput.value = result;
                        if (type === 'video_file' && previewVideo) {
                            dropZone.classList.add('has-video');
                            previewVideo.src = result;
                        } else {
                            dropZone.style.backgroundImage = `url(${result})`;
                        }
                        document.dispatchEvent(new Event('blockChanged'));
                    };
                    reader.readAsDataURL(file);
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

    restoreBlockData(id, type, data) {
        const fields = {
            name: `b_${id}_name`,
            title: `b_${id}_title`,
            desc: `b_${id}_desc`,
            github: `b_${id}_github`,
            blog: `b_${id}_blog`,
            email: `b_${id}_email`
        };
        
        Object.entries(fields).forEach(([key, elementId]) => {
            const el = document.getElementById(elementId);
            if (el && data[key]) {
                el.value = data[key];
            }
        });
        
        // 이미지/비디오 데이터 복원
        if (data.imgData) {
            const dataEl = document.getElementById(`data_${id}`);
            if (dataEl) dataEl.value = data.imgData;
            
            const dropZone = document.getElementById(`drop_${id}`);
            if (type === 'video_file') {
                dropZone.classList.add('has-video');
                document.getElementById(`preview_${id}`).src = data.imgData;
            } else if (type === 'profile' || type === 'image_card') {
                dropZone.style.backgroundImage = `url(${data.imgData})`;
            }
        }
    }

    deleteBlock(id) {
        const wrapper = document.getElementById(`block_wrapper_${id}`);
        if (wrapper) wrapper.remove();
        this.blocks = this.blocks.filter(b => b.id !== id);
        
        // 저장 트리거
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

    moveBlock(id, direction) {
    const index = this.blocks.findIndex(b => b.id === id);
    const targetIndex = index + direction;

    // 범위를 벗어나면 중단
    if (targetIndex < 0 || targetIndex >= this.blocks.length) return;

    // 1. 데이터 배열 순서 바꾸기
    [this.blocks[index], this.blocks[targetIndex]] = [this.blocks[targetIndex], this.blocks[index]];

    // 2. HTML 화면 순서 바꾸기
    const wrapper = document.getElementById(`block_wrapper_${id}`);
    if (direction === -1) {
        this.container.insertBefore(wrapper, wrapper.previousElementSibling);
    } else {
        this.container.insertBefore(wrapper.nextElementSibling, wrapper);
    }

    // 저장 트리거
    document.dispatchEvent(new Event('blockChanged'));
}
