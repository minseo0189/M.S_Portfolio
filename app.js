import { BlockManager } from './blockManager.js';
import { StorageManager } from './storage.js';
import { CodeGenerator } from './generator.js';
import { UIController } from './ui.js';

class PortfolioBuilder {
    constructor() {
        this.blockManager = new BlockManager();
        this.storage = new StorageManager();
        this.generator = new CodeGenerator();
        this.ui = new UIController();
        
        this.init();
    }

    init() {
        // 저장된 데이터 로드
        this.storage.loadData(this.blockManager);
        
        // 이벤트 리스너 등록
        this.setupEventListeners();
        
        // 자동 저장 설정
        this.setupAutoSave();
    }

    setupEventListeners() {
        // 블록 추가 버튼
        document.querySelectorAll('.btn-add button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.blockType;
                this.blockManager.addBlock(type);
                this.storage.save(this.blockManager.getState());
            });
        });

        // 코드 생성
        document.getElementById('btnGenerate').addEventListener('click', () => {
            const code = this.generator.generate(this.blockManager.getState());
            document.getElementById('resultCode').value = code;
            this.ui.setCodeGenerated(true);
            
            // 모바일에서 미리보기로 전환
            if (window.innerWidth <= 768) {
                this.ui.switchTab('preview');
            }
        });

        // 파일 다운로드
        document.getElementById('btnDownload').addEventListener('click', () => {
            if (!this.ui.isCodeGenerated()) {
                alert('⚠️ "코드 생성" 버튼을 먼저 눌러주세요!');
                return;
            }
            this.ui.downloadHtml();
        });

        // 클립보드 복사
        document.getElementById('btnCopy').addEventListener('click', () => {
            if (!this.ui.isCodeGenerated()) {
                alert('⚠️ "코드 생성" 버튼을 먼저 눌러주세요!');
                return;
            }
            this.ui.copyToClipboard();
        });

        // 데이터 초기화
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('정말 모든 내용을 초기화할까요?')) {
                this.storage.clear();
                location.reload();
            }
        });

        // 모바일 탭 전환
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.ui.switchTab(tab);
            });
        });
    }

    setupAutoSave() {
        // 입력 요소 변경 시 자동 저장
        const inputs = ['introTitle', 'introBtnText', 'shape', 'color'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', () => {
                this.storage.save(this.blockManager.getState());
            });
            el.addEventListener('change', () => {
                this.storage.save(this.blockManager.getState());
            });
        });
    }
}

// 앱 초기화
window.addEventListener('DOMContentLoaded', () => {
    new PortfolioBuilder();
});