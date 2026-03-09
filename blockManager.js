import { BlockTemplates } from './blockTemplates.js';

export class BlockManager {
    constructor() {
        this.blocks = [];
        this.counter = 0;
        this.container = document.getElementById('blockContainer');
        this.currentCrop = null;
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
        wrapper.innerHTML = BlockTemplates.get(type, id);
        
        wrapper.querySelector('.btn-delete').addEventListener('click', () => this.deleteBlock(id));

        if (type === 'profile' || type === 'image_card' || type === 'video_file') {
            const dropZone = wrapper.querySelector(`#drop_${id}`);
            const fileInput = wrapper.querySelector(`#file_${id}`);
            if (dropZone && fileInput) {
                dropZone.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (type === 'profile') {
                        this.initCropModal(file, id);
                    } else {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            wrapper.querySelector(`#data_${id}`).value = event.target.result;
                            if (type === 'video_file') {
                                wrapper.querySelector(`#preview_${id}`).src = event.target.result;
                            } else {
                                dropZone.style.backgroundImage = `url(${event.target.result})`;
                            }
                            document.dispatchEvent(new Event('blockChanged'));
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        }
        
        wrapper.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => document.dispatchEvent(new Event('blockChanged')));
        });
        
        if (savedData) setTimeout(() => this.restoreBlockData(id, type, savedData), 0);
        return wrapper;
    }

    initCropModal(file, blockId) {
        const modal = document.getElementById('cropModal');
        const canvas = document.getElementById('cropCanvas');
        const zoomSlider = document.getElementById('zoomSlider');
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                modal.style.display = 'flex';
                this.currentCrop = { img, blockId, zoom: 1 };
                this.drawCropCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        document.getElementById('btnCropApply').onclick = () => {
            const croppedData = canvas.toDataURL('image/jpeg');
            document.getElementById(`data_${blockId}`).value = croppedData;
            document.getElementById(`drop_${blockId}`).style.backgroundImage = `url(${croppedData})`;
            modal.style.display = 'none';
            document.dispatchEvent(new Event('blockChanged'));
        };
        document.getElementById('btnCropCancel').onclick = () => modal.style.display = 'none';
        zoomSlider.oninput = (e) => { 
            if (this.currentCrop) {
                this.currentCrop.zoom = parseFloat(e.target.value); 
                this.drawCropCanvas(); 
            }
        };
    }

    drawCropCanvas() {
        const canvas = document.getElementById('cropCanvas');
        const ctx = canvas.getContext('2d');
        const { img, zoom } = this.currentCrop;
        canvas.width = 300; canvas.height = 300;
        const size = Math.min(img.width, img.height);
        ctx.clearRect(0, 0, 300, 300);
        ctx.drawImage(img, (img.width-size)/2, (img.height-size)/2, size, size, (300-300*zoom)/2, (300-300*zoom)/2, 300*zoom, 300*zoom);
    }

    moveBlock(id, direction) {
        const index = this.blocks.findIndex(b => b.id === id);
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= this.blocks.length) return;
        [this.blocks[index], this.blocks[targetIndex]] = [this.blocks[targetIndex], this.blocks[index]];
        const wrapper = document.getElementById(`block_wrapper_${id}`);
        if (direction === -1) this.container.insertBefore(wrapper, wrapper.previousElementSibling);
        else this.container.insertBefore(wrapper.nextElementSibling, wrapper);
        document.dispatchEvent(new Event('blockChanged'));
    }

    deleteBlock(id) {
        const el = document.getElementById(`block_wrapper_${id}`);
        if (el) el.remove();
        this.blocks = this.blocks.filter(b => b.id !== id);
        document.dispatchEvent(new Event('blockChanged'));
    }

    restoreBlockData(id, type, data) {
        const fields = { name: `b_${id}_name`, title: `b_${id}_title`, desc: `b_${id}_desc`, github: `b_${id}_github`, blog: `b_${id}_blog`, email: `b_${id}_email` };
        Object.entries(fields).forEach(([key, elId]) => { 
            const el = document.getElementById(elId);
            if (el) el.value = data[key] || ''; 
        });
        if (data.imgData) {
            const dataInput = document.getElementById(`data_${id}`);
            if (dataInput) dataInput.value = data.imgData;
            const drop = document.getElementById(`drop_${id}`);
            if (type === 'video_file') {
                const prev = document.getElementById(`preview_${id}`);
                if (prev) prev.src = data.imgData;
            } else if (drop) {
                drop.style.backgroundImage = `url(${data.imgData})`;
            }
        }
    }

    getState() { return { introTitle: document.getElementById('introTitle').value, introBtnText: document.getElementById('introBtnText').value, shape: document.getElementById('shape').value, color: document.getElementById('color').value, blocks: this.blocks.map(b => this.getBlockData(b.id, b.type)) }; }
    getBlockData(id, type) { return { type, name: document.getElementById(`b_${id}_name`)?.value, title: document.getElementById(`b_${id}_title`)?.value, desc: document.getElementById(`b_${id}_desc`)?.value, github: document.getElementById(`b_${id}_github`)?.value, blog: document.getElementById(`b_${id}_blog`)?.value, email: document.getElementById(`b_${id}_email`)?.value, imgData: document.getElementById(`data_${id}`)?.value }; }
}
