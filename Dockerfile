FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html style.css app.js data.js leveling.js leveling-ui.js armory.js /usr/share/nginx/html/
