![did-tezos header](docs/didtzheader.png)

# The Tezos DID Method

The Tezos DID Method (did:tz) specifies the operations by
which DIDs and DID documents are created, resolved, updated,
and deactivated using the Tezos blockchain. 

The `did:tz` Decentralized Identifier Method Specification
can be found [here](https://did-tezos.spruceid.com/)

The W3C Decentralized Identifiers (DIDs) v1.0 draft specification
can be found [here](https://www.w3.org/TR/did-core/).

# Method Properties 

# DID Manager management

For its resolution, a did:tz requires to have a DID Manager (a smart contract)
deployed on-chain. Please refer to [this directory](contract/taquito/README.md)
which includes a CLI and instructions to deploy and update your DID Manager.

# Example usage with DIDKit

[DIDKit](https://github.com/spruceid/didkit/) supports did:tz. Following are a
examples commands using the CLI.

## Basic resolution

```bash
$ didkit did-resolve did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
  "verificationMethod": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId",
      "type": "Ed25519PublicKeyBLAKE2BDigestSize20Base58CheckEncoded2021",
      "controller": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
      "blockchainAccountId": "tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq@tezos:delphinet"
    }
  ],
  "authentication": [
    "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId"
  ],
  "assertionMethod": [
    "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId"
  ],
  "service": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#discovery",
      "type": "TezosDiscoveryService",
      "serviceEndpoint": "test_service2"
    }
  ]
}
```

## Include the public key

Because of the nature of tz1 and tz2 addresses, it is impossible to derive the
public key from the address (i.e. the public key hash). So if the authentication
field is required to have the public key (as is needed for signed patches, which
is shown in the next example), it has to be passed through the input metadata.

```bash
$ didkit did-resolve did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq -i public_key=edpkthtzpq4e8AhtjZ6BPK63iLfqpH7rzjDVbjxjbTuv3kMoGQi26A
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
  "verificationMethod": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId",
      "type": "Ed25519PublicKeyBLAKE2BDigestSize20Base58CheckEncoded2021",
      "controller": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
      "blockchainAccountId": "tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq@tezos:delphinet"
    }
  ],
  "authentication": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId",
      "type": "Ed25519PublicKeyBLAKE2BDigestSize20Base58CheckEncoded2021",
      "controller": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
      "publicKeyBase58": "edpkthtzpq4e8AhtjZ6BPK63iLfqpH7rzjDVbjxjbTuv3kMoGQi26A"
    }
  ],
  "assertionMethod": [
    "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId"
  ],
  "service": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#discovery",
      "type": "TezosDiscoveryService",
      "serviceEndpoint": "test_service2"
    }
  ]
}
```

## Signed JSON Patches

```bash
$ didkit did-resolve did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq -i public_key=edpkthtzpq4e8AhtjZ6BPK63iLfqpH7rzjDVbjxjbTuv3kMoGQi26A -i 'updates={"type":"signed-ietf-json-patch", "value":["eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDp0ejpkZWxwaGluZXQ6dHoxV3Z2YkVHcEJYR2VUVmJMaVI2RFlCZTFpem1naVl1WmJxI2Jsb2NrY2hhaW5BY2NvdW50SWQifQ.eyJpZXRmLWpzb24tcGF0Y2giOiBbCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIm9wIjogImFkZCIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInBhdGgiOiAiL3NlcnZpY2UvMSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInZhbHVlIjogewogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAiaWQiOiAidGVzdF9zZXJ2aWNlX2lkIiwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInR5cGUiOiAidGVzdF9zZXJ2aWNlIiwKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInNlcnZpY2VFbmRwb2ludCI6ICJ0ZXN0X3NlcnZpY2VfZW5kcG9pbnQiCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdfQ.OTMe8ljEZEqZrdfkL1hhuiVXFGw_taFRVqNTfsycxFDq5FPu1ZSgaTOertyC61cQQXNLqTRo2kHAos8kx8PHAQ"]}'
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
  "verificationMethod": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId",
      "type": "Ed25519PublicKeyBLAKE2BDigestSize20Base58CheckEncoded2021",
      "controller": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
      "blockchainAccountId": "tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq@tezos:delphinet"
    }
  ],
  "authentication": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId",
      "type": "Ed25519PublicKeyBLAKE2BDigestSize20Base58CheckEncoded2021",
      "controller": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq",
      "publicKeyBase58": "edpkthtzpq4e8AhtjZ6BPK63iLfqpH7rzjDVbjxjbTuv3kMoGQi26A"
    }
  ],
  "assertionMethod": [
    "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#blockchainAccountId"
  ],
  "service": [
    {
      "id": "did:tz:delphinet:tz1WvvbEGpBXGeTVbLiR6DYBe1izmgiYuZbq#discovery",
      "type": "TezosDiscoveryService",
      "serviceEndpoint": "test_service2"
    },
    {
      "id": "test_service_id",
      "type": "test_service",
      "serviceEndpoint": "test_service_endpoint"
    }
  ]
}
```
