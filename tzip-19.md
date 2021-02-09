---
tzip: 019
title: A3 - Tezos Decentralized Identifier (DID) Manager
author: Wayne Chang (@wyc) <wayne@spruceid.com>
status: Work In Progress
type: Application (A)
created: 2020-09-16
---


## Summary

This proposal defines the smart contract interface necessary to implement the
Tezos Decentralized Identifier (DID) Manager, which is used by the [Tezos DID
Method](https://did-tezos-draft.spruceid.com) for on-chain establishment of
DPKI and service discovery.

## Abstract

The Tezos Decentralized Identifier (DID) Manager is used to establish
decentralized public key infrastructure (DPKI) and service discovery for
Tezos-based DIDs on-chain. Tezos-based DIDs allow any Tezos accounts,
irrespective of their transaction history, to leverage compatible standards and
protocols within the decentralized identity ecosystem, such as W3C Verifiable
Credentials (VCs). All Tezos accounts start with implied DIDs, which require no
transactions to use. This specification defines a smart contract interface
which must be used in conjunction with implicit DID documents and off-chain
updates to complete DID resolution as described in the [Tezos DID
Method](https://did-tezos-draft.spruceid.com).


## Motivation


## Specification


## Rationale


## Backwards Compatibility


## Test Cases


## Implementations


## Appendix


## Copyright


