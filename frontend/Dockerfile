# File: ./frontend/Dockerfile (Versión Desarrollo)
FROM node:20-alpine

# Establece el directorio de trabajo (debe coincidir con la ruta del volume: /app)
WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Comando para iniciar el servidor de desarrollo (Vite)
# El host 0.0.0.0 es necesario para que sea accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]