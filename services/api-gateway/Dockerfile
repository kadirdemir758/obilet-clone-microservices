FROM nginx:1.25-alpine

# Varsayılan nginx konfigürasyonunu kaldır
RUN rm /etc/nginx/conf.d/default.conf

# Kendi nginx konfigürasyonumuzu kopyala
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
