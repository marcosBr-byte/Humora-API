// js/api.js
const API_URL = 'https://humora-api.onrender.com';

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
        const token = localStorage.getItem('token');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    // ===== ALUNO =====
    async getAllAlunos() {
        return fetch(`${API_URL}/aluno`, { headers: this.getHeaders() });
    },
    async getAlunoByEmail(email) {
        const res = await this.getAllAlunos();
        if (!res.ok) return null;
        const lista = await res.json();
        if (!Array.isArray(lista)) return null;
        return lista.find(a => a.email === email) || null;
    },

    // ===== PROFESSOR =====
    async getAllProfessores() {
        return fetch(`${API_URL}/professor`, { headers: this.getHeaders() });
    },
    async getProfessorByEmail(email) {
        const res = await this.getAllProfessores();
        if (!res.ok) return null;
        const lista = await res.json();
        if (!Array.isArray(lista)) return null;
        return lista.find(p => p.email === email) || null;
    },

    // ===== DIÁRIO =====
    async getDiario(email) {
        return fetch(`${API_URL}/aluno/diario?email=${encodeURIComponent(email)}`, {
            headers: this.getHeaders()
        });
    },
    async createDiario(email, emocoes) {
        return fetch(`${API_URL}/aluno/diario`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, emocoes })
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
        ['token', 'usuarioLogado', 'tipoUsuario', 'email'].forEach(k =>
            localStorage.removeItem(k)
        );
    }
};