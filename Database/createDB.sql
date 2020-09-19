-- users...

create table users
(
  name varchar,
  number varchar,
  email varchar,
  password varchar,
  id varchar primary key,
  AccountInfo json[],
  qrCode varchar
);

create table otp(
    number varchar primary key,
    otp varchar,
    verified Boolean
);

-- merchants...

create table merchants(
  name varchar,
  number varchar,
  email varchar,
  password varchar,
  id varchar primary key,
  qrCode varchar,
  accountInfo json[],
  storeName varchar,
  status varchar
);

create table merchantsOtp(
    number varchar primary key,
    otp varchar,
    verified Boolean
);

-- mart --

create table orders(
  orederId bigserial,
  status varchar,
  amount bigint,
  orderdBy json,
  timestamp varchar,
  products json[],
  paymentMetadata json
);

-- admin...

create table admins(
  id varchar primary key,
  name varchar,
  number varchar,
  email varchar,
  password varchar,
  permissions json[]
);

-- recovery...

create table recoveryOtp(
    email varchar  primary key,
    otp varchar,
    verified Boolean
);

create table recoveryMerchantsOtp(
    email varchar  primary key,
    otp varchar,
    verified Boolean
);

-- node

create table info
(
    id varchar primary key,
    fcmToken varchar,
    socketid varchar,
    isonline boolean
);

-- assect

create table amount
(
    id varchar primary key,
    balance int
);

create table transactions
(
    transactionID bigserial,
    transactionTime varchar,
    fromMetadata json,
    toMetadata json,
    amount bigint,
    isGenerated boolean,
    isWithdraw boolean
);

create table messages
(
    messageTime varchar,
    fromMetadata json,
    toMetadata json,
    message varchar
);

-- block...

create table blocks(
  type varchar,
  blockID bigserial,
  refID varchar,
  encryptedData varchar,
  timestamp timestamp default current_timestamp,
  verifiedBy varchar[]
);

