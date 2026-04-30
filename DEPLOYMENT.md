# Guia de Implantação (Docker Compose) - Dashboard 360º Omni

Este guia descreve os passos para configurar a aplicação na sua VM utilizando **Docker Compose** e integrando com o Caddy na rede `webstack_web`.

## 1. Preparação na VM

Acesse sua VM via SSH e prepare o diretório:

```bash
# Criar a pasta e clonar o repositório
sudo mkdir -p /opt/apps/dash-360-polo
cd /opt/apps/dash-360-polo
sudo git clone https://github.com/seu-usuario/seu-repositorio.git .

# Ajustar permissões
sudo chown -R $USER:$USER /opt/apps/dash-360-polo
```

## 2. Criação dos Arquivos Docker (Na VM)

Como os arquivos Docker não estão no repositório local, crie-os manualmente na pasta `/opt/apps/dash-360-polo`:

### Criar o Dockerfile
```bash
nano Dockerfile
```
Cole o conteúdo abaixo:
```dockerfile
# Estágio de Build do Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Estágio de Build do Backend
FROM node:20-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Estágio Final
FROM node:20-slim
WORKDIR /app

# Copiar arquivos do Backend
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Copiar arquivos do Frontend (para o backend servir)
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Instalar dependências de produção
WORKDIR /app/backend
RUN npm install --omit=dev

EXPOSE 3003

CMD ["node", "dist/server.js"]
```

### Criar o docker-compose.yml
```bash
nano docker-compose.yml
```
Cole o conteúdo abaixo:
```yaml
services:
  dash-360-polo:
    build: .
    container_name: dash-360-polo
    restart: unless-stopped
    environment:
      - PORT=3003
    ports:
      - "3003:3003"
    networks:
      - webstack_web

networks:
  webstack_web:
    external: true
```

## 3. Configuração de Ambiente

Crie o arquivo `.env` para o backend:
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

## 4. Deploy

```bash
# Construir e subir o container
docker compose up -d --build
```

## 5. Configuração do Caddy (Host)

No seu `Caddyfile` da VM, adicione:

```caddy
painel.ippolo.com.br {
    # Proxy para o container Docker
    reverse_proxy localhost:3003
}
```

Recarregue o Caddy:
```bash
sudo systemctl reload caddy
```

---

## Comandos Úteis na VM
- **Logs**: `docker compose logs -f`
- **Status**: `docker compose ps`
- **Atualizar**: `git pull && docker compose up -d --build`
