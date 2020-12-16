type verification_method = address;
type rotation_event = {
    public_key           : key,
    current_value_digest : bytes,
    next_value_digest    : bytes,
    current_chain        : bytes,
    rotation_count       : nat
};

type service = {
    type_            : string,
    service_endpoint : string
};

type storage = {
    rotation_count      : nat,
    active_key          : key,
    verification_method : address,
    service             : service,
    metadata            : big_map(string, bytes)
};

let rotate_authentication = ((vm, rot, sgn, strg): (verification_method, rotation_event, signature, storage)): storage => {
    let sgn_target = Bytes.concat(rot.current_value_digest, Bytes.concat(rot.next_value_digest, Bytes.pack(strg.rotation_count)));
    assert(Crypto.check(strg.active_key, sgn, sgn_target));
    assert(rot.current_chain == Bytes.pack(Tezos.chain_id));
    assert(rot.rotation_count == strg.rotation_count + 1n);

    {
        rotation_count      : rot.rotation_count,
        active_key          : rot.public_key,
        verification_method : vm,
        service             : strg.service,
        metadata            : strg.metadata
    };
};

// rotation_event and signature are reused from the rotate_authentication section.
let rotate_service = ((srv, rot, sgn, strg): (service, rotation_event, signature, storage)): storage => {
    let sgn_target = Bytes.concat(rot.current_value_digest, Bytes.concat(rot.next_value_digest, Bytes.pack(strg.rotation_count)));
    assert(Crypto.check(strg.active_key, sgn, sgn_target));
    assert(rot.current_chain == Bytes.pack(Tezos.chain_id));
    assert(rot.rotation_count == strg.rotation_count + 1n);
    assert(srv.type_ == strg.service.type_);
    assert(srv.service_endpoint == strg.service.service_endpoint);

    {
        rotation_count      : rot.rotation_count,
        active_key          : strg.active_key,
        verification_method : strg.verification_method,
        service             : srv,
        metadata            : strg.metadata
    };
};

type parameter =
| RotateAuthentication ((verification_method, rotation_event, signature))
| RotateService ((service, rotation_event, signature));
type return = (list (operation), storage);

let main = ((action, store): (parameter, storage)) : return =>
  switch (action) {
  | RotateAuthentication (l) => ([] : list (operation), rotate_authentication (l[0], l[1], l[2], store))
  | RotateService (l) => ([] : list (operation), rotate_service (l[0], l[1], l[2], store))
  };

let get_service = (strg: storage): service => {
    strg.service;
};
