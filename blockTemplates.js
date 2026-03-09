export class BlockTemplates {
    static get(type, id) {
        const templates = {
            profile: this.profile(id),
            text: this.text(id),
            image_card: this.imageCard(id),
            video_file: this.videoFile(id),
            sns: this.sns(id)
        };
        return templates[type] || '';
    }

    static profile(id) {
        return `
            <div class="block-controls">
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, -1)">▲</button>
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, 1)">▼</button>
                <button class="btn-delete">X</button>
            </div>
            <label>👤 프로필 이미지</label>
            <div class="drop-zone" id="drop_${id}"><span>사진 선택</span></div>
            <input type="file" id="file_${id}" style="display:none" accept="image/*">
            <input type="hidden" id="data_${id}">
            <label>이름</label>
            <input type="text" id="b_${id}_name" placeholder="이름">
            <label>자기소개</label>
            <textarea id="b_${id}_desc" placeholder="자기소개"></textarea>
        `;
    }

    static text(id) {
        return `
            <div class="block-controls">
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, -1)">▲</button>
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, 1)">▼</button>
                <button class="btn-delete">X</button>
            </div>
            <label>📝 텍스트 블록</label>
            <label>제목</label>
            <input type="text" id="b_${id}_title" placeholder="제목">
            <label>내용</label>
            <textarea id="b_${id}_desc" placeholder="내용"></textarea>
        `;
    }

    static imageCard(id) {
        return `
            <div class="block-controls">
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, -1)">▲</button>
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, 1)">▼</button>
                <button class="btn-delete">X</button>
            </div>
            <label>🖼️ 작품 이미지</label>
            <div class="drop-zone" id="drop_${id}"><span>이미지 선택</span></div>
            <input type="file" id="file_${id}" style="display:none" accept="image/*">
            <input type="hidden" id="data_${id}">
            <label>작품명</label>
            <input type="text" id="b_${id}_title" placeholder="작품명">
            <label>설명</label>
            <textarea id="b_${id}_desc" placeholder="설명"></textarea>
        `;
    }

    static videoFile(id) {
        return `
            <div class="block-controls">
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, -1)">▲</button>
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, 1)">▼</button>
                <button class="btn-delete">X</button>
            </div>
            <label>🎬 동영상 (MP4)</label>
            <div class="drop-zone" id="drop_${id}">
                <span>MP4 선택</span>
                <video id="preview_${id}" muted></video>
            </div>
            <input type="file" id="file_${id}" style="display:none" accept="video/*">
            <input type="hidden" id="data_${id}">
            <label>영상 제목</label>
            <input type="text" id="b_${id}_title" placeholder="영상 제목">
        `;
    }

    static sns(id) {
        return `
            <div class="block-controls">
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, -1)">▲</button>
                <button class="btn-move" onclick="event.stopPropagation(); window.app.blockManager.moveBlock(${id}, 1)">▼</button>
                <button class="btn-delete">X</button>
            </div>
            <label>🔗 SNS & 연락처</label>
            <label>GitHub / Social URL</label>
            <input type="text" id="b_${id}_github" placeholder="GitHub URL">
            <label>블로그 / 기타 링크</label>
            <input type="text" id="b_${id}_blog" placeholder="블로그/트위터 등 URL">
            <label>이메일</label>
            <input type="text" id="b_${id}_email" placeholder="이메일 주소">
        `;
    }
}
