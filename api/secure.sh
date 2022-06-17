#!/bin/bash
#CHECK FOR DOMAIN
if [ $# -eq 0 ]
  then
    echo "No arguments supplied"
  else
    #DELETE DEFAULT CONFIGURATION
    rm /etc/nginx/sites-enabled/default

    #CREATE NEW CONFIGURATION
    touch "/etc/nginx/sites-enabled/default"
    echo "server {
            server_name $1;
            location / {
                proxy_pass http://127.0.0.1:3000;
                client_max_body_size 20M;
            }
            listen 80;
        }" > "/etc/nginx/sites-enabled/default"

    #RELOAD NGINX
    systemctl reload nginx
    #PRINT SUCCESS MESSAGE
    echo "BASIC SETUP IS COMPLETE, PLEASE RUN: sudo certbot --nginx -d $1"
fi