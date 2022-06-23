FROM ubuntu:20.04 

# INSTALL BASIC DEPENDENCIES
RUN apt-get -qq update
RUN apt-get install -y \
  libssl-dev \
  ca-certificates \
  fuse \
  curl \
  wget
  
# INSTALL NODEJS
RUN curl -q https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs
RUN npm install -g npm
RUN npm install -g yarn
RUN npm install -g pm2

# INSTALL IPFS
RUN wget https://github.com/ipfs/go-ipfs/releases/download/v0.13.0/go-ipfs_v0.13.0_linux-386.tar.gz
RUN tar -xvzf go-ipfs_v0.13.0_linux-386.tar.gz
RUN bash go-ipfs/install.sh
RUN rm -rf go-ipfs
RUN rm go-ipfs_v0.13.0_linux-386.tar.gz

#INSTALL GO
RUN wget -c https://dl.google.com/go/go1.14.2.linux-amd64.tar.gz -O - | tar -xz -C /usr/local
ENV PATH="/usr/local/go/bin:${PATH}"

#INIT IPFS
RUN mkdir /data
WORKDIR /data

VOLUME  ["/data"]

EXPOSE 4001
EXPOSE 4001/udp
EXPOSE 5001
EXPOSE 8080
EXPOSE 8081
EXPOSE 7000
EXPOSE 8000

CMD tail -f /dev/null