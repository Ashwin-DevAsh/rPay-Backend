create table users(
  accountname varchar,
  ownername varchar,
  number varchar,
  email varchar,
  password varchar,
  id varchar primary key,
  AccountInfo json[],
  qrCode varchar,
  isMerchantAccount boolean,
  status varchar,
  fcmToken varchar,
  balance bigint
);

create table admins(
  id varchar primary key,
  name varchar,
  number varchar,
  email varchar,
  password varchar,
  permissions json[]
);

-- otp

create table otp(
    number varchar primary key,
    otp varchar,
    verified Boolean
);

create table merchantsOtp(
    number varchar primary key,
    otp varchar,
    verified Boolean
);

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


-- mart --


create table products(
   productID bigserial primary key,
   productName varchar,
   ownerID varchar,
   discription varchar,
   quantity int,  
   price bigint,
   category varchar,
   imageUrl varchar,
   availableOn varchar[],
);

create table orders(
  orederId bigserial,
  status varchar,
  amount bigint,
  orderdBy json,
  timestamp varchar,
  products json[],
  paymentMetadata json
);

create table transactions(
    transactionID bigserial,
    transactionTime varchar,
    fromMetadata json,
    toMetadata json,
    amount bigint,
    isGenerated boolean,
    isWithdraw boolean,
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

