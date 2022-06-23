ipfs init
sed -i 's/127.0.0.1/0.0.0.0/' .ipfs/config
sed -i 's/10GB/230GB/' .ipfs/config

# INSTALL SHARED DEPENDENCIES
cd shared
yarn

# INSTALL PROVIDER DEPENDENCIES
cd ../provider-cli
yarn

# INSTALL REFEREE DEPENDENCIES
cd ../referee-cli
yarn