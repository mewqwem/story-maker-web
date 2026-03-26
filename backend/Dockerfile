FROM node:20-slim
WORKDIR /app
COPY package.json ./
# Встановлюємо все для білду
RUN npm install
COPY . .
# Явно запускаємо білд
RUN npm run build
EXPOSE 8080
# Вказуємо шлях до скомпільованого файлу
CMD ["node", "dist/main"]