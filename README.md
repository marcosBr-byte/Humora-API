Humora 💜

Plataforma web de acompanhamento e acolhimento emocional de estudantes.

O Humora permite que alunos registrem diariamente como se sentem e pratiquem o autocuidado, enquanto professores acompanham o clima emocional das turmas por meio de um painel com termômetros interativos e alertas — favorecendo a identificação precoce de estudantes que precisam de apoio.

Projeto desenvolvido por estudantes do Curso Técnico em Informática da rede pública estadual da Paraíba, para o Programa Ouse Criar 2026/2027 e a FECT PB 2026.

⚠️ O Humora é uma ferramenta de apoio e prevenção. Ele não substitui o acompanhamento de psicólogos e demais profissionais de saúde.

✨ Funcionalidades
👩‍🎓 Perfil do aluno
Registro diário de emoções: feliz, triste, cansado, calmo, ansioso e irritado, com intensidade e comentário opcional
Exercício de respiração guiada com sessões de 30 segundos ou 1 minuto
Jogos calmantes: Pop-it, Jogo da Memória, Cérebro Saltador e Caça-Palavras
Diário pessoal, que pode ser compartilhado com o professor
Termômetros dos registros recentes e da frequência das emoções
Conquistas (badges) e escolha de avatar
👨‍🏫 Perfil do professor
Cadastro com chave de acesso e vínculo às turmas em que leciona
Painel com resumo emocional e termômetros por turma
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

Defina as variáveis de ambiente `SPRING_DATASOURCE_URL` (por exemplo, `jdbc:postgresql://localhost:5432/humora`), `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`.

As tabelas são criadas automaticamente na primeira execução (ddl-auto: update).

Em bancos existentes, execute [o script SQL](spring-boot/sql/permitir-nomes-repetidos.sql) uma vez para permitir que alunos e professores tenham o mesmo nome.

### Autenticação

- Defina `HUMORA_ADMIN_EMAIL` com o e-mail da única conta autorizada a cadastrar professores. Se esse e-mail já for de um professor, a conta existente recebe a permissão.
- Para criar a primeira conta de administrador, defina também `HUMORA_ADMIN_PASSWORD` (mínimo de oito caracteres) antes da primeira inicialização. O Humora cria a conta se o e-mail estiver livre. Em execuções seguintes, mantenha o e-mail configurado. A senha de inicialização pode ser retirada do ambiente após a criação.
- Defina `HUMORA_JWT_SECRET` com um segredo aleatório de pelo menos 32 bytes para manter as sessões após reinícios. Sem essa variável, o servidor gera uma chave temporária e é preciso entrar novamente.
- Guarde senhas e segredos fora do repositório.

### Apresentação na FECT

1. Na página inicial ou no login, escolha **Visitante** para abrir o cadastro.
2. Informe o primeiro nome e a cidade. Escolha uma amora, ajuste a intensidade de 1 a 5 e registre a emoção. O termômetro mostra a intensidade escolhida.
3. Em outro navegador, escolha **Admin** e entre com uma conta de professor ou administrador. O **Termômetro da feira** atualiza a intensidade média e a distribuição das emoções a cada cinco segundos. A conta configurada como administradora também vê **Cadastrar professor**.

O banco guarda as emoções e intensidades enviadas à FECT. Nome, cidade, anotações, diário e histórico particular do visitante ficam na sessão do navegador. Use a rede local do evento ou um endereço HTTPS para apresentar.

3. Iniciar o backend
bash
cd spring-boot
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run      # Windows

A API fica disponível em http://localhost:8080.

4. Abrir o frontend

Abra http://localhost:8080 no navegador do computador que executa a aplicação. A interface usa a API no mesmo endereço.

### Frontend com Tailwind CSS

O frontend está em `spring-boot/src/main/resources`:

- `static/` contém o HTML, o JavaScript e as imagens. O HTML usa classes descritivas. O JavaScript preenche os modelos `<template>` e atualiza estados com atributos `data-*`.
- `frontend/styles/componentes/` reúne os estilos compartilhados e os de cada tela. As classes descritivas usam `@apply` com utilitários Tailwind (prefixo `tw:`).
- `frontend/styles/pages/` contém as entradas do compilador e as animações específicas de cada tela. As cores e animações compartilhadas ficam no tema `frontend/styles/tailwind.css`.

Ao rodar `mvnw spring-boot:run` ou `mvnw package`, o Maven instala a versão de Node definida no projeto, executa o Tailwind e inclui o frontend no Spring Boot. O CSS pronto fica em `spring-boot/target/generated-resources/frontend/css`. Edite os arquivos em `src/main/resources` e rode o comando novamente para regenerar o CSS.

### Acesso pela rede local

Antes de iniciar a aplicação, defina `SERVER_ADDRESS=0.0.0.0` no Linux/macOS ou `$env:SERVER_ADDRESS = "0.0.0.0"` no PowerShell. No outro notebook, abra `http://<IP-do-computador-servidor>:8080`.

Se necessário, permita conexões TCP na porta 8080 no firewall do servidor, limitadas à rede local. Mantenha o PostgreSQL acessível somente ao servidor. Se o Java estiver em WSL 2 com rede NAT, o Windows precisa encaminhar a porta para o WSL.

🔌 Endpoints principais
Método	Rota	Acesso	Descrição
POST	/auth/register/aluno	Público	Cadastro de aluno
POST	/auth/register/professor	Administrador	Cadastro de professor
POST	/fect/registros	Público	Registro anônimo de emoção na feira
GET	/professor/fect	Professor	Contagem e intensidade agregada das emoções da FECT
POST	/auth/login/aluno	Público	Login do aluno (retorna token JWT)
POST	/auth/login/professor	Público	Login do professor (retorna token JWT)
GET	/aluno/me	Aluno	Consultar o próprio perfil
GET/POST	/aluno/diario	Aluno	Listar e criar registros do próprio diário
PUT/DELETE	/aluno/diario/{id}	Aluno	Editar e excluir registro
GET	/professor/me	Professor	Consultar o próprio perfil
GET	/professor/alunos	Professor	Consultar a lista de alunos sem registros do diário

As rotas /aluno/** e /professor/** exigem o token JWT no cabeçalho Authorization: Bearer <token>.

🔒 Privacidade

O Humora lida com informações emocionais de adolescentes, consideradas sensíveis pela LGPD (Lei nº 13.709/2018). Por isso:

o acesso é separado por perfil (aluno e professor), com autenticação por token;
a API de diário retorna apenas os registros do aluno autenticado;
notas de texto, mensagens e avisos guardados pelo front-end ficam no navegador e não são sincronizados entre notebooks;
apenas os dados necessários ao acompanhamento são coletados.
🌱 Próximos passos
Piloto com uma turma e coleta de feedback de alunos e professores
Ajustes de usabilidade com base nos resultados
Modo de demonstração para a FECT PB 2026
👥 Equipe

Projeto desenvolvido por estudantes do Curso Técnico em Informática, com orientação do professor Ayrton Alcântara de Oliveira Júnior.

<!-- Adicione aqui os nomes dos estudantes da equipe -->
