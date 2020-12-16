const fs = require('fs');
const taquito = require('@taquito/taquito');
const tzip16 = require('@taquito/tzip16');
const signer = require('@taquito/signer');

// const url = 'http://localhost:20000';
const url = 'https://api.tez.ie/rpc/delphinet';
const Tezos = new taquito.TezosToolkit(url);
Tezos.addExtension(new tzip16.Tzip16Module());

const contract = fs.readFileSync('../contract.michelson', 'utf8')

// Tezos.setProvider({
//   signer: new signer.InMemorySigner('edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq'),
// });

const FAUCET_KEY = {
  mnemonic: [
    "risk",
    "copper",
    "awkward",
    "park",
    "curve",
    "embrace",
    "glad",
    "pretty",
    "eager",
    "corn",
    "swarm",
    "drop",
    "also",
    "issue",
    "protect"
  ],
  secret: "c6d196eea462e073e72da3366a19ff4e5134f3fa",
  amount: "2296040028",
  pkh: "tz1Z3yNumnSFoHtMsMPAkiCqDQpTcnw7fk1s",
  password: "3csWwURLHp",
  email: "sgoamkpl.paljfttk@tezos.example.org",
};

signer.importKey(
  Tezos,
  FAUCET_KEY.email,
  FAUCET_KEY.password,
  FAUCET_KEY.mnemonic.join(' '),
  FAUCET_KEY.secret
).catch((e) => console.error(e));

async function main() {
  const public_key = await Tezos.signer.publicKey();
  process.stdout.write(`Public key: ${public_key}\n`);
  const public_key_hash = await Tezos.signer.publicKeyHash();
  process.stdout.write(`Public key hash ${public_key_hash}\n`);

  const metadataBigMap = new taquito.MichelsonMap();
  metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/225e50d6a3befd555b824f4ec374b3b6/raw/39eb6eb6906a3b17c8abee79680767cab1029562/tzip19-metadata.json"));

  Tezos.contract.originate({
    code: contract,
    storage: {
      active_key: public_key,
      metadata: metadataBigMap,
      rotation_count: '0',
      service: {
        service_endpoint: 'test_service',
        type_: 'TezosDiscoveryService',
      },
      verification_method: public_key_hash,
    },
  })
    .then((originationOp) => {
      process.stdout.write(`Waiting for confirmation of origination for ${originationOp.contractAddress}...\n`);
      return originationOp.contract();
    })
    .then((_) => {
      process.stdout.write(`Origination completed.`);
    })
    .catch((error) => process.stdout.write(`Error: ${JSON.stringify(error)}`));
}

main();
