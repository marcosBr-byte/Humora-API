Humora 💜

Plataforma web de acompanhamento e acolhimento emocional de estudantes.

O Humora permite que alunos registrem diariamente como se sentem e pratiquem o autocuidado, enquanto professores acompanham o clima emocional das turmas por meio de um painel com gráficos e alertas — favorecendo a identificação precoce de estudantes que precisam de apoio.

Projeto desenvolvido por estudantes do Curso Técnico em Informática da rede pública estadual da Paraíba, para o Programa Ouse Criar 2026/2027 e a FECT PB 2026.

⚠️ O Humora é uma ferramenta de apoio e prevenção. Ele não substitui o acompanhamento de psicólogos e demais profissionais de saúde.

✨ Funcionalidades
👩‍🎓 Perfil do aluno
Registro diário de emoções: feliz, triste, cansado, calmo, ansioso e irritado, com intensidade e comentário opcional
Exercício de respiração guiada
Jogos calmantes: Pop-it, Jogo da Memória, Cérebro Saltador e Caça-Palavras
Diário pessoal, que pode ser compartilhado com o professor
Gráficos da própria evolução emocional
Conquistas (badges) e escolha de avatar
👨‍🏫 Perfil do professor
Cadastro com chave de acesso e vínculo às turmas em que leciona
Painel com resumo emocional e gráficos por turma
Lista de alunos em alerta
Leitura dos diários compartilhados
Envio de mensagens de apoio e comunicados
🛠️ Tecnologias
Camada	Tecnologias
Frontend	HTML5, CSS3, JavaScript
Backend	Java 25, Spring Boot 4, Spring Security, Spring Data JPA
Autenticação	JWT (java-jwt), com perfis ALUNO e PROFESSOR
Banco de dados	PostgreSQL
Ferramentas	Maven, Lombok, Figma, Git/GitHub
📁 Estrutura do projeto
spring-boot/
├── src/main/java/br/com/projetoSpringBoot/spring_boot/
│   ├── controllers/    # AuthController, AlunoController, ProfessorController
│   ├── services/       # Regras de negócio
│   ├── repositories/   # Acesso ao banco de dados (JPA)
│   ├── model/          # Entidades: Aluno, Professor, Diario
│   ├── dto/            # Objetos de entrada e saída da API
│   ├── enumeradores/   # Emoções, matérias, séries e turmas
│   └── config/         # Segurança, JWT e CORS
└── src/main/resources/
    ├── application.yaml
    └── Humora/         # Frontend (HTML, CSS, JS e imagens)
🚀 Como executar
Pré-requisitos
Java 25 (JDK)
PostgreSQL instalado e em execução
Navegador web atualizado
1. Criar o banco de dados
sql
CREATE DATABASE humora;
2. Configurar a conexão

Em spring-boot/src/main/resources/application.yaml, informe o usuário e a senha do seu PostgreSQL:

yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/humora
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD}

As tabelas são criadas automaticamente na primeira execução (ddl-auto: update).

3. Iniciar o backend
bash
cd spring-boot
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run      # Windows

A API fica disponível em http://localhost:8080.

4. Abrir o frontend

Abra no navegador o arquivo spring-boot/src/main/resources/Humora/index.html. O endereço da API é definido em Humora/js/api.js (API_URL).

🔌 Endpoints principais
Método	Rota	Acesso	Descrição
POST	/auth/register/aluno	Público	Cadastro de aluno
POST	/auth/register/professor	Público	Cadastro de professor
POST	/auth/login/aluno	Público	Login do aluno (retorna token JWT)
POST	/auth/login/professor	Público	Login do professor (retorna token JWT)
GET/POST	/aluno/diario	Aluno	Listar e criar registros do diário
PUT/DELETE	/aluno/diario/{id}	Aluno	Editar e excluir registro
GET/POST	/professor	Professor	Consultar e cadastrar professores

As rotas /aluno/** e /professor/** exigem o token JWT no cabeçalho Authorization: Bearer <token>.

🔒 Privacidade

O Humora lida com informações emocionais de adolescentes, consideradas sensíveis pela LGPD (Lei nº 13.709/2018). Por isso:

o acesso é separado por perfil (aluno e professor), com autenticação por token;
o diário só é visto pelo professor quando o aluno decide compartilhá-lo;
apenas os dados necessários ao acompanhamento são coletados.
🌱 Próximos passos
Piloto com uma turma e coleta de feedback de alunos e professores
Ajustes de usabilidade com base nos resultados
Modo de demonstração para a FECT PB 2026
👥 Equipe

Projeto desenvolvido por estudantes do Curso Técnico em Informática, com orientação do professor Ayrton Alcântara de Oliveira Júnior.

<!-- Adicione aqui os nomes dos estudantes da equipe -->
