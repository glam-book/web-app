# Stage 1 - Build React app
FROM node:23-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

RUN npm run build

# Stage 2 - Nginx serve
FROM nginx:alpine

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

COPY --from=build /app/dist /usr/share/nginx/html/${PUBLIC_URL}

COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$PUBLIC_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
