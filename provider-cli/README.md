# Retriev Protocol - Providers CLI

Provider's CLI is intended to be used as terminal tool to interact with the protocol so you can expect to do following things:

- **Sign up as provider**: you can subscribe as provider in the protocol to start serving files
- **Create deals**: you can create deals by passing a data uri or reading a local file
- **Tune your SLA**: you can fine tune your specific SLA to be sure that deals mets your specific requirements
- **Withdraw funds**: you can withdraw funds after a deal is ended

## Build CLI from source

CLI is written in NodeJS so we assume you have git, NodeJS >= 16 and YARN installed.

You will also need a web3 provider (we suggest [Infura](https://infura.io)) to interact with blockchain. 

After you've met all required dependencies you can start following those steps:

```
# Clone repository
git clone https://github.com/protocol/retriev

# Install shared dependencies
bash shared/install.sh

# Install specific dependencies
cd ..
cd provider-cli
yarn

# Create .env file
cp .env.goerli .env
sed -i "s/API_KEY/YOUR_INFURA_API_KEY/" ./.env

# Compile node
yarn compile

# Start node
yarn start
```

## First launch

After first launch the node will create a folder inside `~/.rpp` where you will find the configuration file, based on the `--name` argument you give. If you've followed exactly the guide you'll find a `provider0` folder.

This is what the terminal should show:
```
Working dir is: /home/turinglabs/GIT/PROTOCOL/retriev/provider-cli
Homedir is: /home/turinglabs
Provider name is: provider0
Can't find configs for node provider0, creating.
Generating new identity for node.
New identity is: 0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511
Loaded identity: 0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511
```

As you can see the node created a new identity (aka blockchain address) which will be used as identifier inside the network. You'll find the private key inside the `configs.json` file in the `~/.rpp/provider0` folder. Should be something like:
```
{
    "api_url": "https://api.pldr.dev",
    "pin": true, 
    "max_size": 20000000, 
    "price_strategy": 0,
    "key": "0x1087e6f2fc70ab1a4ecd30b0782c6aaf69c38bf98e719cc618e191ea1e80d386",
    "address": "0x66Ed08Bd5067D2e1aEA20CB988FA594Db0F4b511",
    "provider": "https://goerli.infura.io/v3/YOUR_INFURA_ID",
    "contract_address": "0xBc331A7bEa063DbCE8b3d16F77850B617Bc36cbA"
}
```

Please now create a backup of the `key`, which is stored locally and should not be shared. Of course you can also use another key you previosly created.

## Secure external communications

To be sure anyone can communicate with your node we have to setup a reverse proxy with NGINX and also add an SSL certificate. Please be sure you bought a domain and be sure to create an `A` record inside your `DNS` configuration before continue the guide.

After you linked your domain to your ip address you should be able to setup NGINX follow these simple steps:

```
cd NODE_TYPE-cli
bash secure.sh YOUR_DOMAIN
```

The answer should be something like:
```
BASIC SETUP IS COMPLETE, PLEASE RUN: sudo certbot --nginx -d YOUR_DOMAIN
```

Run now:
```
sudo certbot --nginx -d YOUR_DOMAIN
```

If everything is ok you should be now able to connect your node from the external. You can now open the browser and ask the identity of the node directly using the URL:
```
https://YOUR_DOMAIN/identity
```

For example our demo-provider will answer [here](https://provider.pldr.dev/identity).

## Signup as provider

If you completed this procedure to be included as provider inside the protocol you're now able to signup using the CLI.

Please follow these basic steps, assuming you're in the main project's folder:
```
cd provider-cli
./bin/rpp-provider-linux subscribe https://YOUR_DOMAIN
```
## Tune your SLA

As you may noticed on the config file you have those five parameters:
- `pin`: which defines if your node automatically pin on the default instance or not, it can be `true` or `false` (default is `true`).
- `max_size`: which defines the max size your node will accept, written in `bytes` (defauls is `20000000`).
- `min_price`: which defines the amount of *wei* needed to accept the deal. Minimum amount is defined as the result of `price_strategy` * `file_size_in_bytes` * `duration_of_deal` (default is `0`).
- `max_collateral_multiplier`: which defines the max allowed difference between `value` and `collateral` (default is `1000`).
- `max_duration`: which defines the max duration of the deal written in `days` (default is `365`).

If you want to define your own strategy you can tune directly the `config.json` file or using following commands.
Assuming you're in the main project's folder:
```
cd provider-cli
./bin/rpp-provider-linux setupminprice <AMOUNT_IN_WEI>
./bin/rpp-provider-linux setupmaxsize <MAX_SIZE_IN_BYTE>
./bin/rpp-provider-linux setupmaxduration <MAX_DURATION_IN_DAYS>
./bin/rpp-provider-linux setupmaxcollateral <MAX_COLLATERAL_MULTIPLIER>
./bin/rpp-provider-linux pin <TRUE_OR_FALSE>
```

If you want a recap of your stored configuration you can run this command:

```
./bin/rpp-provider-linux getstrategy
```

When you're ready to publish your strategy on the API you run this commmand and wait for confirmation:

```
./bin/rpp-provider-linux storestrategy
```

# Support

If you need support please feel free to jump into our [Slack](https://filecoinproject.slack.com/archives/C03CJKWP2DR) channel and ask for it.
