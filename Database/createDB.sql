create table users
(
  name varchar,
  number varchar,
  email varchar,
  password varchar,
  imageURL varchar,
  id varchar primary key,
  qrCode varchar
);

create table info
(
    id varchar primary key,
    fcmToken varchar,
    socketid varchar,
    isonline boolean
);

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


