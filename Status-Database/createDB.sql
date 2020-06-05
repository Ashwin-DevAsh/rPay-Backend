create table info(id varchar primary key,fcmToken varchar unique,socketid varchar unique,isonline boolean);
create table amount(id varchar primary key,balance int);
create table transactions(transactionID bigserial,transactionTime varchar,fromID varchar,toID,varchar toName varchar, amount bigint);

