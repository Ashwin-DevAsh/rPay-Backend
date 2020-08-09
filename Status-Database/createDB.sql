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
    fromID varchar,
    toID varchar,
    fromMetadata json,
    toMetadata json,
    amount bigint,
    isGenerated boolean,
    isWithdraw boolean
);
-- create table logs(currentCheckPoint bigserial,logType varchar,transactionID int,userId varchar);

