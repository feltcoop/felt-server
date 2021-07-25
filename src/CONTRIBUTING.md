[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

Thanks for your interest in contributing! Before you get started you'll need to get your local machine set up.

## Getting Started

1. Configure your environment to the Node & NPM versions listed in [/package.json]
1. Install Gro
1. [Install Postgresql](/src/db/README.md)
1. Set up a local https cert
1. Run `gro dev` and navigate to localhost:3000 to start!

## Setting up a local https cert

1. Run

```
openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

to generate a localhost set of keys & add it to your configs.
