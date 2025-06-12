# Stage 1 — копируем уже собранную папку dist
FROM nginx:alpine

ARG PUBLIC_URL
ENV PUBLIC_URL=$PUBLIC_URL

# Копируем только нужный артефакт
COPY dist /usr/share/nginx/html/${PUBLIC_URL}

COPY nginx.conf.template /etc/nginx/nginx.conf.template

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$PUBLIC_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && exec nginx -g 'daemon off;'"]
