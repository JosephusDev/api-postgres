# Guia de Configuração do Projeto API com Node.js, Fastify, TypeScript, Prisma, Redis e PostgreSQL

Este guia fornece as diretrizes para configurar o ambiente de desenvolvimento para a API utilizando Docker, Node.js, TypeScript e Prisma. Siga os passos abaixo para instalar as dependências, subir o container do PostgreSQL e configurar o Prisma.

## 1. Instalação do Docker e Subida do Container

### 1.1. Instale o Docker e a imagem do Postgres e do Redis
Certifique-se de que o Docker está instalado na sua máquina. Caso não tenha, siga as instruções de instalação no site oficial: [Docker Installation](https://docs.docker.com/get-docker/).

### 1.2. O Arquivo `docker-compose.yml`
Existe um arquivo chamado `docker-compose.yml` na raiz do projeto com o seguinte conteúdo:

```yaml
name: api-postgres
services:
  pg:
    image: postgres:latest
    container_name: db
    restart: always
    environment:
      POSTGRES_USER: docker
      POSTGRES_PASSWORD: docker
      POSTGRES_DB: dbusers
    ports:
      - '5432:5432' # Mapeia a porta padrão do PostgreSQL para a máquina host
    volumes:
      - data:/var/lib/postgresql/data # Persistência dos dados
volumes:
  data:
```

### 1.3. Suba o Container do PostgreSQL
No terminal, navegue até a pasta onde o arquivo `docker-compose.yml` está localizado e execute o seguinte comando:

```bash
docker-compose up -d
```

Isso irá baixar a imagem do PostgreSQL e subir o container com as configurações especificadas.

## 2. Instalação

### 2.1. Instale o Node.js e o npm
Certifique-se de que o Node.js e o npm estão instalados na sua máquina. Caso não tenha, siga as instruções de instalação no site oficial: [Node.js Installation](https://nodejs.org/).

### 2.2. Inicialize o Projeto Node.js
Na raiz do projeto, execute o seguinte comando para instalar todas as dependências:

```bash
npm install
```

```env
DATABASE_URL="postgresql://docker:docker@localhost:5432/dbusers"
REDIS_HOST=localhost
```

### 2.3. Execute as Migrações
Execute as migrações para criar as tabelas no banco de dados:

```bash
npx prisma migrate dev
```

### 2.4. Visualize os Dados no Prisma Studio
Para visualizar e manipular os dados diretamente no banco de dados, utilize o Prisma Studio:

```bash
npx prisma studio
```

Isso abrirá uma interface gráfica no seu navegador onde você poderá visualizar e editar os dados.

## 3. Explicação dos Elementos do Arquivo `docker-compose.yml`

- **`image: postgres:latest`**: Especifica a imagem do PostgreSQL que será utilizada.
- **`container_name: db`**: Define o nome do container como `db`.
- **`restart: always`**: Garante que o container sempre reinicie em caso de falha.
- **`environment`**: Define variáveis de ambiente para configurar o PostgreSQL, como usuário, senha e nome do banco de dados.
- **`ports`**: Mapeia a porta 5432 do container para a porta 5432 da máquina host.
- **`volumes`**: Persiste os dados do banco de dados em um volume chamado `data`.

## 4. Conclusão

Seguindo esses passos, você terá um ambiente de desenvolvimento configurado para a API com Node.js, TypeScript, Prisma e PostgreSQL. Agora você pode começar a desenvolver sua aplicação!