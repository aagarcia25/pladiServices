# Usa una imagen base que incluya el entorno de ejecución necesario para tu aplicación (por ejemplo, Node.js, Python, etc.)
FROM node:14

# Establece el directorio de trabajo
WORKDIR /app
COPY . .

# Instala las dependencias
RUN npm install -g nodemon && npm install
# Instala netcat
RUN apt-get update && apt-get install -y netcat

# Expón el puerto en el que tu aplicación escucha
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npm start"]
