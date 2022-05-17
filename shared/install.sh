#!/bin/bash
echo "INSTALLING DEPENDENCIES FOR PROJECT"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g
npm install yarn -g

#INSTALL GO
wget -c https://dl.google.com/go/go1.14.2.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.profile
source ~/.profile

#INSTALL IPFS
wget https://dist.ipfs.io/go-ipfs/v0.12.2/go-ipfs_v0.12.2_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.12.2_linux-amd64.tar.gz
bash install.sh
rm -rf go-ipfs
rm go-ipfs_v0.12.2_linux-amd64.tar.gz
sysctl -w net.core.rmem_max=2500000

#INIT IPFS
ipfs init

#SETTING UP NGINX
sudo apt update
sudo apt install nginx -y
sudo ufw allow 'Nginx Full'

#INSTALL CERTBOT
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

#SETTING UP FIREWALL
ufw allow 22
ufw allow 7000
ufw allow 4001
ufw --force enable

#INSTALL SHARED DEPENDENCIES
cd shared
yarn