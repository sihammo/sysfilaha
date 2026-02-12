FROM nginx:alpine

# Copy the HTML file and logo to nginx serving directory
COPY index.html /usr/share/nginx/html/
COPY logo.jpg /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
