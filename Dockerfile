FROM nginx

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY web_app /var/www/web_app