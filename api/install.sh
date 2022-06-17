#!/bin/bash
echo "INSTALLING DEPENDENCIES FOR PROJECT"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g
npm install yarn -g

yarn