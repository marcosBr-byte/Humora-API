// js/api.js
const API_URL = 'http://localhost:8080';

const api = {
    // Headers padrão
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    },

    // Autenticação
    async loginAluno(email, senha) {
        const response = await fetch(`${API_URL}/auth/login/aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        return response;
    },

    async loginProfessor(email, senha) {
        const response = await fetch(`${API_URL}/auth/login/professor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        return response;
    },

    async registerAluno(data) {
        const response = await fetch(`${API_URL}/auth/register/aluno`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response;
    },

    async registerProfessor(data) {
        const response = await fetch(`${API_URL}/auth/register/professor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response;
    },

    // Aluno - Diário
    async getDiario(email) {
        const response = await fetch(`${API_URL}/aluno/diario`, {
            method: 'GET',
            headers: this.getHeaders(),
            body: JSON.stringify({ email })
        });
        return response;
    },

    async createDiario(email, emocoe) {
        const response = await fetch(`${API_URL}/aluno/diario`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, emocoe })
        });
        return response;
    },

    async deleteDiario(id) {
        const response = await fetch(`${API_URL}/aluno/diario/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return response;
    },

    // Aluno - Perfil
    async getAlunoById(id) {
        const response = await fetch(`${API_URL}/aluno/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return response;
    },

    async getAllAlunos() {
        const response = await fetch(`${API_URL}/aluno`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return response;
    },

    // Professor
    async getProfessorById(id) {
        const response = await fetch(`${API_URL}/professor/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return response;
    },

    async getAllProfessores() {
        const response = await fetch(`${API_URL}/professor`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        return response;
    }
};

// Mapeamento de emoções para o backend
const EMOCAO_MAP = {
    'feliz': 'FELIZ',
    'triste': 'TRISTE',
    'cansado': 'CANSADO',
    'calmo': 'CALMO',
    'ansioso': 'ANSIOSO',
    'irritado': 'IRRITADO'
};

// Mapeamento inverso
const EMOCAO_REVERSE = {
    'FELIZ': 'feliz',
    'TRISTE': 'triste',
    'CANSADO': 'cansado',
    'CALMO': 'calmo',
    'ANSIOSO': 'ansioso',
    'IRRITADO': 'irritado'
};