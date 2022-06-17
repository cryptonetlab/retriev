#!/bin/bash
echo "INSTALLING DEPENDENCIES FOR PROJECT"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g
npm install yarn -g

#SETTING UP NGINX
sudo apt update
sudo apt install nginx -y
sudo ufw allow 'Nginx Full'

#INSTALL CERTBOT
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

#SETTING UP FIREWALL
ufw allow 22
ufw allow 3000
ufw --force enable

yarn
cp .env.rinkeby .env

pm2 start npm -- start
