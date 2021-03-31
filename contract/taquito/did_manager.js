const fs = require('fs');
const yargs = require('yargs');
const taquito = require('@taquito/taquito');
const tzip16 = require('@taquito/tzip16');
const signer = require('@taquito/signer');

const argv = yargs
  .command('originate', 'Deploy DID manager smart contract.',
    {
      service_endpoint: {
        description: 'Service endpoint.',
        alias: 'e',
        type: 'string',
        demand: true,
      },
      service_type: {
        description: 'Service type.',
        alias: 't',
        type: 'string',
        default: 'TezosDiscoveryService',
      }
    }
  )
  .command('rotate-auth', 'Rotate authentication.',
    {
      contract: {
        description: 'DID manager address.',
        alias: 'c',
        type: 'string',
        demand: true,
      },
      address: {
        description: 'New address',
        alias: 'a',
        type: 'string',
        demand: true,
      }
    }
  )
  .command('rotate-service', 'Rotate service endpoint.',
    {
      contract: {
        description: 'DID manager address.',
        alias: 'c',
        type: 'string',
        demand: true,
      },
      service_endpoint: {
        description: 'Service endpoint.',
        alias: 'e',
        type: 'string',
        demand: true,
      },
      service_type: {
        description: 'Service type.',
        alias: 't',
        type: 'string',
        default: 'TezosDiscoveryService',
      }
    }
  )
  .option('url', {
    alias: 'u',
    description: 'Tezos node.',
    type: 'string',
    default: 'https://mainnet.smartpy.io/',
  })
  .option('faucet_key_file', {
    alias: 'f',
    description: 'Path to a faucet key JSON file.',
    type: 'string',
  })
  .option('secret', {
    alias: 's',
    description: 'Secret key.',
    type: 'string',
  })
  .help()
  .alias('help', 'h')
  .argv;

const Tezos = new taquito.TezosToolkit(argv.url);
Tezos.addExtension(new tzip16.Tzip16Module());

if (argv.faucet_key_file) {
  const key = JSON.parse(fs.readFileSync(argv.faucet_key_file, 'utf8'));
  signer.importKey(
    Tezos,
    key.email,
    key.password,
    key.mnemonic.join(' '),
    key.secret
  ).catch((e) => {
    process.stderr.write(`Error importing faucet key: ${JSON.stringify(e)}`);
    process.exit(1);
  });
} else if (argv.secret) {
  Tezos.setProvider({
    signer: new signer.InMemorySigner(argv.secret),
  });
} else {
  process.stderr.write(`No secret or key provided.`);
  process.exit(1);
}

async function originate() {
  try {
    const contract = fs.readFileSync('../contract.michelson', 'utf8')

    const metadataBigMap = new taquito.MichelsonMap();
    metadataBigMap.set("", tzip16.char2Bytes("ipfs://QmemdKdgCBhhr6hZC3TzsyjsMT8mVjhWvNsP37D4uUNpSP"));

    let originationOp = await Tezos.contract.originate({
      code: contract,
      storage: {
        owner: await Tezos.signer.publicKeyHash(),
        metadata: metadataBigMap,
        service: {
          endpoint: argv.service_endpoint,
          type_: argv.service_type,
        },
        verification_method: `did:pkh:tz:${await Tezos.signer.publicKeyHash()}#TezosMethod2021`,
      },
    });
    process.stdout.write(`Waiting for confirmation of origination for ${originationOp.contractAddress}...\n`);
    await originationOp.confirmation(3);
    process.stdout.write(`Origination completed.`);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

async function rotate_auth() {
  try {
    let contract = await
      Tezos.contract
        .at(argv.contract);
    let op = await contract.methods.auth(argv.address).send();
    process.stdout.write(`Awaiting for ${op.hash} to be confirmed...\n`);
    await op.confirmation(3);
    let hash = op.hash;
    process.stdout.write(`Operation injected: https://delphi.tzstats.com/${hash}\n`);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

async function rotate_service() {
  try {
    let contract = await
      Tezos.contract
        .at(argv.contract);
    let op = await contract.methods.service(argv.service_type, argv.service_endpoint).send();
    process.stdout.write(`Awaiting for ${op.hash} to be confirmed...\n`);
    await op.confirmation(3);
    let hash = op.hash;
    process.stdout.write(`Operation injected: https://delphi.tzstats.com/${hash}\n`);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

if (argv._.includes('originate')) {
  originate();
} else if (argv._.includes('rotate-auth')) {
  rotate_auth();
} else if (argv._.includes('rotate-service')) {
  rotate_service();
}
