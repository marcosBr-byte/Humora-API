// js/api.js

// ⭐ DEFINIR A URL DA API AQUI
const API_URL = 'https://humora-api.onrender.com';';

console.log("🔵 API inicializada com URL:", API_URL);

// ===== MAPEAMENTO DE EMOÇÕES =====
const EMOCAO_MAP = {
    'feliz': 'FELIZ',
    'triste': 'TRISTE',
    'irritado': 'IRRITADO',
    'ansioso': 'ANSIOSO',
    'calmo': 'CALMO',
    'cansado': 'CANSADO'
};

const EMOCAO_REVERSE = {
    'FELIZ': 'feliz',
    'TRISTE': 'triste',
    'IRRITADO': 'irritado',
    'ANSIOSO': 'ansioso',
    'CALMO': 'calmo',
    'CANSADO': 'cansado'
};

const api = {
    // Headers padrão com autenticação
    getHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        console.log("📋 Headers:", headers);
        return headers;
    },

    // ========== AUTENTICAÇÃO ==========
    async loginAluno(email, senha) {
        console.log("🔐 Login aluno:", email);
        try {
            const response = await fetch(`${API_URL}/auth/login/aluno`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            console.log("📥 Resposta login aluno:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro no login aluno:", error);
            throw error;
        }
    },

    async loginProfessor(email, senha) {
        console.log("🔐 Login professor:", email);
        try {
            const response = await fetch(`${API_URL}/auth/login/professor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            console.log("📥 Resposta login professor:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro no login professor:", error);
            throw error;
        }
    },

    // ========== CADASTRO ==========
    async registerAluno(data) {
        console.log("📝 Cadastro aluno:", data);
        try {
            const response = await fetch(`${API_URL}/auth/register/aluno`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("📥 Resposta cadastro aluno:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro no cadastro aluno:", error);
            throw error;
        }
    },

    async registerProfessor(data) {
        console.log("📝 Cadastro professor:", data);
        try {
            const response = await fetch(`${API_URL}/auth/register/professor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            console.log("📥 Resposta cadastro professor:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro no cadastro professor:", error);
            throw error;
        }
    },

    // ========== ALUNO ==========
    async getAllAlunos() {
        console.log("📋 Buscando todos os alunos");
        try {
            const response = await fetch(`${API_URL}/aluno`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            console.log("📥 Resposta getAlunos:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao buscar alunos:", error);
            throw error;
        }
    },

    // ========== DIÁRIO ==========
    async getDiario(email) {
        console.log("📋 Buscando diário do aluno:", email);
        try {
            const response = await fetch(`${API_URL}/aluno/diario?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            console.log("📥 Resposta getDiario:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao buscar diário:", error);
            throw error;
        }
    },

    async createDiario(email, emocoe) {
        console.log("📝 Criando diário:", { email, emocoe });
        try {
            const response = await fetch(`${API_URL}/aluno/diario`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ email, emocoe })
            });
            console.log("📥 Resposta createDiario:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao criar diário:", error);
            throw error;
        }
    },

    async deleteDiario(id) {
        console.log("🗑️ Deletando diário:", id);
        try {
            const response = await fetch(`${API_URL}/aluno/diario/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            console.log("📥 Resposta deleteDiario:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao deletar diário:", error);
            throw error;
        }
    },

    async updateDiario(id, data) {
        console.log("📝 Atualizando diário:", { id, data });
        try {
            const response = await fetch(`${API_URL}/aluno/diario/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });
            console.log("📥 Resposta updateDiario:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao atualizar diário:", error);
            throw error;
        }
    },

    // ========== PROFESSOR ==========
    async getAllProfessores() {
        console.log("📋 Buscando todos os professores");
        try {
            const response = await fetch(`${API_URL}/professor`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            console.log("📥 Resposta getProfessores:", response.status);
            return response;
        } catch (error) {
            console.error("❌ Erro ao buscar professores:", error);
            throw error;
        }
    }
};

console.log("✅ API carregada com sucesso!");
console.log("📋 Métodos disponíveis:", Object.keys(api));