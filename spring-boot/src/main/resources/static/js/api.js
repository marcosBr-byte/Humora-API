// js/api.js
const API_URL = window.location.origin;

function textoHTML(valor) {
    const caracteres = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(valor ?? "").replace(/[&<>"']/g, caractere => caracteres[caractere]);
}

localStorage.removeItem('token');

const EMOCAO_MAP = {
    'feliz': 'FELIZ', 'triste': 'TRISTE', 'irritado': 'IRRITADO',
    'ansioso': 'ANSIOSO', 'calmo': 'CALMO', 'cansado': 'CANSADO'
};

const EMOCAO_REVERSE = {
    'FELIZ': 'feliz', 'TRISTE': 'triste', 'IRRITADO': 'irritado',
    'ANSIOSO': 'ansioso', 'CALMO': 'calmo', 'CANSADO': 'cansado'
};

const api = {
    getHeaders() {
        const token = sessionStorage.getItem('token');
        const h = { 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    },

    // ===== AUTH =====
    async loginAluno(email, senha) {
        return fetch(`${API_URL}/auth/login/aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
    },
    async loginProfessor(email, senha) {
        return fetch(`${API_URL}/auth/login/professor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
    },

    // ===== CADASTRO =====
    async registerAluno(data) {
        return fetch(`${API_URL}/auth/register/aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },
    async registerProfessor(data) {
        return fetch(`${API_URL}/auth/register/professor`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
    },

    async getPerfil(tipo) {
        const rota = tipo === 'aluno' ? '/aluno/me' : '/professor/me';
        return fetch(`${API_URL}${rota}`, { headers: this.getHeaders() });
    },

    // ===== DIÁRIO =====
    async getDiario() {
        return fetch(`${API_URL}/aluno/diario`, {
            headers: this.getHeaders()
        });
    },
    async createDiario(emocoes) {
        return fetch(`${API_URL}/aluno/diario`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ emocoes })
        });
    },
    async updateDiario(id, data) {
        return fetch(`${API_URL}/aluno/diario/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
    },
    async deleteDiario(id) {
        return fetch(`${API_URL}/aluno/diario/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    },

    // ===== SESSÃO =====
    logout() {
        ['token', 'usuarioLogado', 'tipoUsuario', 'email', 'humoraVisitanteDados'].forEach(k =>
            sessionStorage.removeItem(k)
        );
    }
};