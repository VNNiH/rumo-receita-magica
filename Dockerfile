# 1. Escolhe a imagem base com Node.js
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de package para instalar dependências
COPY package*.json ./
COPY bun.lockb ./

# 4. Instala dependências
RUN npm install

# 5. Copia o restante do código para dentro do container
COPY . .

# 6. Compila o projeto para produção
RUN npm run build

# 7. Instala um servidor web leve para servir o build
RUN npm install -g serve

# 8. Exponha a porta que o app vai rodar
EXPOSE 5173

# 9. Comando para rodar o app
CMD ["serve", "-s", "dist", "-l", "5173"]