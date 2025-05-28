import dotenv from 'dotenv';

dotenv.config();

export const orgConfig = {
  // demo org credentials
  // in a production environment, make sure to put your org's credentials in environment variables
  orgCredentials: {
    secretKey: process.env.ORGANIZATION_PRIVATEKEY,
    orgDid: 'did:nil:testnet:nillion1au5wp7q6etp9rcrepv0aklnzm56h2pe2wzvmq3',
  },
  // demo node config
  nodes: [
    {
      url: 'https://nildb-nx8v.nillion.network',
      did: 'did:nil:testnet:nillion1qfrl8nje3nvwh6cryj63mz2y6gsdptvn07nx8v',
    },
    {
      url: 'https://nildb-p3mx.nillion.network',
      did: 'did:nil:testnet:nillion1uak7fgsp69kzfhdd6lfqv69fnzh3lprg2mp3mx',
    },
    {
      url: 'https://nildb-rugk.nillion.network',
      did: 'did:nil:testnet:nillion1kfremrp2mryxrynx66etjl8s7wazxc3rssrugk',
    },
  ],
};