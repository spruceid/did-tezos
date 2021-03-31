type verification_method = string;

type service = {
    type_    : string,
    endpoint : string
};

type storage = {
    owner               : address,
    verification_method : verification_method,
    service             : service,
    metadata            : big_map(string, bytes)
};

let rotate_authentication = ((vm, strg): (verification_method, storage)): storage => {
    {
        owner               : strg.owner,
        verification_method : vm,
        service             : strg.service,
        metadata            : strg.metadata
    };
};

let rotate_service = ((srv, strg): (service, storage)): storage => {
    {
        owner               : strg.owner,
        verification_method : strg.verification_method,
        service             : srv,
        metadata            : strg.metadata
    };
};

let rotate_owner = ((ownr, strg): (address, storage)): storage => {
    {
        owner               : ownr,
        verification_method : strg.verification_method,
        service             : strg.service,
        metadata            : strg.metadata
    };
};

type parameter =
[@layout:comb]
| Owner (address)
| Auth (verification_method)
| Service (service);
type return = (list (operation), storage);

let main = ((action, store): (parameter, storage)) : return => {
  if (Tezos.sender != store.owner) { failwith ("Unauthorised sender."); };
  if (Tezos.amount > 0tz) { failwith ("Tez not accepted."); };
  switch (action) {
  | Auth (l) => ([] : list (operation), rotate_authentication (l, store))
  | Service (l) => ([] : list (operation), rotate_service (l, store))
  | Owner (l) => ([] : list (operation), rotate_owner (l, store))
  };
};
