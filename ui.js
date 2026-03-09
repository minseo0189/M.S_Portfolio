export class UIController {
    constructor() {
        this.codeGenerated = false;
    }

    isCodeGenerated() {
        return this.codeGenerated;
    }

    setCodeGenerated(value) {
        this.codeGenerated = value;
        
        const btnDownload = document.getElementById('btnDownload');
        const btnCopy = document.getElementById('btnCopy');
        
        if (value) {
            btnDownload.classList.add('active');
            btnCopy.classList.add('active');
        } else {
            btnDownload.classList.remove('active');
            btnCopy.classList.remove('active');
        }
    }

    switchTab(mode) {
        const wrapper = document.getElementById('app-wrapper');
        const btnSetting = document.querySelector('[data-tab="setting"]');
        const btnPreview = document.querySelector('[data-tab="preview"]');
        
        if (mode === 'preview') {
            wrapper.style.transform = 'translateX(-100vw)';
            btnSetting.classList.remove('active');
            btnPreview.classList.add('active');
        } else {
            wrapper.style.transform = 'translateX(0)';
            btnPreview.classList.remove('active');
            btnSetting.classList.add('active');
        }
    }

    async downloadHtml() {
        const content = document.getElementById('resultCode').value;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            this.downloadMobile(content);
        } else {
            await this.downloadDesktop(content);
        }
    }

    downloadMobile(content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('✅ 다운로드 폴더를 확인해주세요!');
    }

    async downloadDesktop(content) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: 'index.html',
                types: [{
                    description: 'HTML File',
                    accept: { 'text/html': ['.html'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            alert('✅ 파일이 저장되었습니다!');
        } catch (err) {
            if (err.name !== 'AbortError') {
                this.downloadMobile(content);
            }
        }
    }

    copyToClipboard() {
        const code = document.getElementById('resultCode').value;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code)
                .then(() => alert('✅ 클립보드에 복사되었습니다!'))
                .catch(() => this.fallbackCopy());
        } else {
            this.fallbackCopy();
        }
    }

    fallbackCopy() {
        const textarea = document.getElementById('resultCode');
        textarea.select();
        document.execCommand('copy');
        alert('✅ 클립보드에 복사되었습니다!');
    }
}
