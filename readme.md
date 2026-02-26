# 📋 Sistema de Cadastro de Pessoas com WhatsApp

Projeto **fullstack simples** desenvolvido com **Flask (Python)** no backend e **Vue.js 3** no frontend, voltado para **cadastro de pessoas**, **envio de mensagens via WhatsApp** e **visualização do histórico de mensagens enviadas para cada pessoa**.

A aplicação utiliza **PostgreSQL** como banco de dados, **SQLAlchemy ORM** para persistência e **Bootstrap** para estilização da interface.  
O frontend é renderizado via **templates Flask**, utilizando **Vue.js 3** e **JavaScript** para interatividade e manipulação dinâmica dos dados.

---

## 🎯 Funcionalidades

- ✅ Cadastro de pessoas  
- 📱 Envio de mensagens para o número de WhatsApp cadastrado  
- 🕓 Histórico de mensagens enviadas por pessoa  
- 🗑️ Exclusão de cadastros  
- 🧩 Interface baseada em modais  
- 📊 Listagem dinâmica de registros  

---

## 🛠️ Tecnologias Utilizadas

### Backend
- Python  
- Flask  
- SQLAlchemy ORM  
- PostgreSQL  

### Frontend
- Vue.js 3  
- JavaScript  
- HTML5 (Templates Flask)  
- CSS3  
- Bootstrap  

---

## 📂 Estrutura do Projeto

```
PROJETOVUE/
├── __pycache__/
├── env/
├── static/
│   ├── scripts.js
│   └── style.css
├── templates/
│   ├── components/
│   └── home.html
├── create_db.py
├── tables.py
├── main.py
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## ⚙️ Como Executar o Projeto

### 1️⃣ Criar e ativar o ambiente virtual

```bash
python -m venv env
```

Cria um ambiente virtual chamado `env`, que isola as dependências do projeto do restante do sistema.

```bash
source env/bin/activate
```

Ativa o ambiente virtual.

- Linux / Mac: `source env/bin/activate`
- Windows: `env\Scripts\activate`

---

### 2️⃣ Instalar as dependências

```bash
pip install -r requirements.txt
```

Instala todas as bibliotecas necessárias para o funcionamento do projeto, listadas no arquivo `requirements.txt`.

---

### 3️⃣ Criar as tabelas no banco de dados

```bash
python create_db.py
```

Executa o script responsável por criar as tabelas no banco de dados PostgreSQL, utilizando os models definidos no SQLAlchemy.

> Normalmente esse comando é executado apenas uma vez, ou sempre que houver alterações na estrutura do banco.

---

### 4️⃣ Executar a aplicação

```bash
python main.py
```

Inicia o servidor Flask da aplicação.

Acesse no navegador:
```
http://localhost:5000
```

---

## 💬 Envio de Mensagens via WhatsApp

O sistema permite:
- Enviar mensagens para o WhatsApp da pessoa cadastrada
- Registrar o conteúdo da mensagem
- Armazenar data e hora do envio
- Consultar o histórico completo de mensagens por pessoa

> O envio pode ser feito via link `wa.me` ou integração externa, conforme implementação do projeto.

---

## 🐳 Docker (Opcional)

```bash
docker build -t projeto-cadastro-whatsapp .
docker run -p 5000:5000 projeto-cadastro-whatsapp
```

---

## 📌 Observações

- Projeto simples, com foco em aprendizado e prática fullstack  
- Estrutura organizada e fácil de manter  
- Ideal para evoluções futuras  
- Vue.js 3 utilizado para controle de estado e interatividade no frontend  

---

## 👨‍💻 Autor

Diego Lopes  
Desenvolvedor Fullstack  
Projeto desenvolvido para estudo e portfólio
