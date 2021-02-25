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
    default: 'https://api.tez.ie/rpc/mainnet',
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
    metadataBigMap.set("", tzip16.char2Bytes("https://gist.githubusercontent.com/sbihel/225e50d6a3befd555b824f4ec374b3b6/raw/2a532032aa48d87e60f8d3155db7312444cd94be/tzip19-metadata.json"));

    let originationOp = await Tezos.contract.originate({
      code: contract,
      storage: {
        active_key: await Tezos.signer.publicKey(),
        metadata: metadataBigMap,
        rotation_count: '0',
        service: {
          endpoint: argv.service_endpoint,
          type_: argv.service_type,
        },
        verification_method: await Tezos.signer.publicKeyHash(),
      },
    });
    process.stdout.write(`Waiting for confirmation of origination for ${originationOp.contractAddress}...\n`);
    // originationOp.contract();
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
    // TODO Reads the storage directly, maybe not good.
    let storage = await contract.storage();
    let chain_id = await Tezos.rpc.getChainId();
    let new_verification_method = argv.address;
    let new_rotation_count = parseInt(storage.rotation_count) + 1;
    let public_key = await Tezos.signer.publicKey();

    const p = new taquito.MichelCodecParser(Tezos);

    const dataChainID = await p.parseMichelineExpression(`"${chain_id}"`);
    const typeChainID = await p.parseMichelineExpression(`chain_id`);
    const packChainID = await Tezos.rpc.packData({data: dataChainID, type: typeChainID});

    const data = `(Pair (Pair (Pair 0x${packChainID.packed} 0x${tzip16.char2Bytes(storage.verification_method)})
                                (Pair 0x${tzip16.char2Bytes(new_verification_method)} "${public_key}"))
                          ${new_rotation_count})`
    const type = `(pair (pair (pair (bytes %current_chain) (bytes %current_value_digest))
                                (pair (bytes %next_value_digest) (key %public_key)))
                          (nat %rotation_count))`;
    const dataJSON = await p.parseMichelineExpression(data)
    const typeJSON = await p.parseMichelineExpression(type)
    const pack = await Tezos.rpc.packData({data: dataJSON, type: typeJSON});
    const sign = await Tezos.signer.sign(pack.packed);

    let op = await contract.methods.rotateAuthentication(
      new_verification_method,
      packChainID.packed,
      tzip16.char2Bytes(storage.verification_method),
      tzip16.char2Bytes(new_verification_method),
      public_key,
      new_rotation_count,
      sign.sig).send();
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
    // TODO Reads the storage directly, maybe not good.
    let storage = await contract.storage();
    let chain_id = await Tezos.rpc.getChainId();
    let new_rotation_count = parseInt(storage.rotation_count) + 1;
    let public_key = await Tezos.signer.publicKey();

    const p = new taquito.MichelCodecParser(Tezos);

    const dataChainID = await p.parseMichelineExpression(`"${chain_id}"`);
    const typeChainID = await p.parseMichelineExpression(`chain_id`);
    const packChainID = await Tezos.rpc.packData({data: dataChainID, type: typeChainID});

    const dataService = await p.parseMichelineExpression(`(Pair "${argv.service_endpoint}" "${argv.service_type}")`);
    const typeService = await p.parseMichelineExpression(`(pair string string)`);
    const packService = await Tezos.rpc.packData({data: dataService, type: typeService});

    let old_service = storage.service;
    const dataOldService = await p.parseMichelineExpression(`(Pair "${old_service.endpoint}" "${old_service.type_}")`);
    const typeOldService = await p.parseMichelineExpression(`(pair string string)`);
    const packOldService = await Tezos.rpc.packData({data: dataOldService, type: typeOldService});

    const data = `(Pair (Pair (Pair 0x${packChainID.packed} 0x${packOldService.packed})
                                (Pair 0x${packService.packed} "${public_key}"))
                          ${new_rotation_count})`
    const type = `(pair (pair (pair bytes bytes)
                              (pair bytes key))
                        nat)`;
    const dataJSON = await p.parseMichelineExpression(data)
    const typeJSON = await p.parseMichelineExpression(type)
    const pack = await Tezos.rpc.packData({data: dataJSON, type: typeJSON});
    const sign = await Tezos.signer.sign(pack.packed);

    let op = await contract.methods.rotateService(
      argv.service_endpoint,
      argv.service_type,
      packChainID.packed,
      packOldService.packed,
      packService.packed,
      public_key,
      new_rotation_count,
      sign.sig).send();
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
