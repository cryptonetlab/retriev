# Install a local Ethereum Node

apt-get install software-properties-common
add-apt-repository -y ppa:ethereum/ethereum
apt-get update
apt-get install -y ethereum

echo "[Unit]
Description=Geth

[Service]
Type=simple
User=root
Restart=always
RestartSec=12
ExecStart=/bin/geth --rinkeby --http

[Install]
WantedBy=default.target" > /etc/systemd/system/geth.service

systemctl daemon-reload
systemctl enable geth.service
systemctl daemon-reload

systemctl start geth
systemctl status geth