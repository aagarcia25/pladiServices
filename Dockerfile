# Usa una imagen base que incluya el entorno de ejecución necesario para tu aplicación (por ejemplo, Node.js, Python, etc.)
FROM node:20.5.0

# Establece el directorio de trabajo
WORKDIR /app
COPY . .
# Copiar archivos desde la carpeta local 'archivos' a la carpeta '/app/archivos' en el contenedor
COPY PLADIFILES /app/PLADIFILES
# Instala las dependencias
RUN npm install -g nodemon && npm install


# Expón el puerto en el que tu aplicación escucha
EXPOSE 8585

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npm start"]
