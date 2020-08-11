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

-- block...

create table blocks(
  blockID bigserial,
  blockHash varchar,
  createdAt timestamp,
  verifiedBy varchar[]
);

