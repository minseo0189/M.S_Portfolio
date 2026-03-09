import { BlockTemplates } from '../templates/blockTemplates.js';

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
        
        // 삭제 버튼 이벤트
        wrapper.querySelector('.btn-delete').addEventListener('click', () => {
            this.deleteBlock(id);
        });
        
        // 파일 업로드 이벤트
        if (type === 'profile' || type === 'image_card' || type === 'video_file') {
            this.setupFileUpload(id, type);
        }
        
        // 입력 필드 이벤트 (자동 저장)
        wrapper.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                document.dispatchEvent(new Event('blockChanged'));
            });
        });
        
        // 저장된 데이터 복원
        if (savedData) {
            this.restoreBlockData(id, type, savedData);
        }
        
        return wrapper;
    }

    setupFileUpload(id, type) {
        const dropZone = document.getElementById(`drop_${id}`);
        const fileInput = document.getElementById(`file_${id}`);
        
        dropZone.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target.result;
                document.getElementById(`data_${id}`).value = result;
                
                if (type === 'video_file') {
                    dropZone.classList.add('has-video');
                    document.getElementById(`preview_${id}`).src = result;
                } else {
                    dropZone.style.backgroundImage = `url(${result})`;
                }
                
                // 저장 트리거
                document.dispatchEvent(new Event('blockChanged'));
            };
            reader.readAsDataURL(file);
        });
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
}
