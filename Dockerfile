# Stage 1 - the build process
FROM node:23-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

ARG PUBLIC_URL  # Добавляем ARG для использования переменной
# Установка значения переменной окружения
ENV PUBLIC_URL=$PUBLIC_URL

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

ARG PUBLIC_URL  # Добавляем ARG для использования переменной
# Установка значения переменной окружения
ENV PUBLIC_URL=$PUBLIC_URL

# Copy the build output from the previous step to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html/${PUBLIC_URL}

COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Expose the port on which Nginx will run
EXPOSE 80

# Start Nginx
#CMD ["nginx", "-g", "daemon off;"]

# Use envsubst to substitute environment variables in Nginx config
CMD ["/bin/sh", "-c", "envsubst '$PUBLIC_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
