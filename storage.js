export class StorageManager {
    constructor() {
        this.storageKey = 'portfolioData';
        this.statusEl = document.getElementById('saveStatus');
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.updateStatus('✅ 저장됨');
        } catch (e) {
            this.updateStatus('⚠️ 용량 초과');
            console.error('Storage error:', e);
        }
    }

    loadData(blockManager) {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            // 기본 설정 복원
            document.getElementById('introTitle').value = data.introTitle || 'Minseo Portfolio';
            document.getElementById('introBtnText').value = data.introBtnText || 'View Works';
            document.getElementById('shape').value = data.shape || 'TorusGeometry';
            document.getElementById('color').value = data.color || '#00ffcc';
            
            // 블록 복원
            if (data.blocks && data.blocks.length > 0) {
                data.blocks.forEach(blockData => {
                    blockManager.addBlock(blockData.type, blockData);
                });
            }
            
            this.updateStatus('✅ 불러옴');
        } catch (e) {
            console.error('Load error:', e);
            this.updateStatus('⚠️ 로드 실패');
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    updateStatus(message) {
        this.statusEl.textContent = message;
        setTimeout(() => {
            this.statusEl.textContent = '대기 중...';
        }, 2000);
    }
}
