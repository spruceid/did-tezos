# DID Manager management script

## Installation

Requires Node.js.

To install dependencies:
```bash
$ npm install
```

## Usage

```bash
$ node did_manager.js --help
did_manager.js [command]

Commands:
  did_manager.js originate       Deploy DID manager smart contract.
  did_manager.js rotate-auth     Rotate authentication.
  did_manager.js rotate-service  Rotate service endpoint.

Options:
      --version          Show version number                           [boolean]
  -u, --url              Tezos node.
                            [string] [default: "https://api.tez.ie/rpc/mainnet"]
  -f, --faucet_key_file  Path to a faucet key JSON file.                [string]
  -s, --secret           Secret key.                                    [string]
  -h, --help             Show help                                     [boolean]
```

### Originate

```bash
$ node did_manager.js originate -u https://api.tez.ie/rpc/delphinet -f faucet.json -e test_service
Waiting for confirmation of origination for KT1XFk3nxojBisE5WpXugmuPuh9GRzo54gxL...
Origination completed.
```

### Rotate Service
```bash
$ node did_manager.js rotate-service -u https://api.tez.ie/rpc/delphinet -f faucet.json -c KT1XFk3nxojBisE5WpXugmuPuh9GRzo54gxL -e test_service2
Awaiting for opUGGvHSzbnh3gyQMNssCFqjFNQRxVGKMyhZS9ZpPKAF6c8Wtw2 to be confirmed...
Operation injected: https://delphi.tzstats.com/opUGGvHSzbnh3gyQMNssCFqjFNQRxVGKMyhZS9ZpPKAF6c8Wtw2
```

### Rotate Authentication
```bash
$ node did_manager.js rotate-auth -u https://api.tez.ie/rpc/delphinet -f faucet.json -s <secret_key> -a <other_address>
```
