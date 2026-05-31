
    export const validateForm = (categoryId, title, content) => {
        if (!categoryId) {
            return '카테고리를 선택해주세요.'
        }
        
        if (title === '') {
            return '제목은 필수입니다.'
        }
        if (title.trim() === '') {
            return '제목은 비어 있을 수 없습니다.'
        }
        if (title.length > 100) {
            return '제목은 100자 이하로 입력해주세요.'
        }

        if (content === '') {
            return '내용은 필수입니다.'
        }
        if (content.trim() === '') {
            return '내용은 비어 있을 수 없습니다.'
        }
        if (content.length > 5000) {
            return '내용은 5000자 이하로 입력해주세요.'
        }

        return null
    }