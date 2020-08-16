package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"
	"net/http"
	"encoding/json"
	"bytes"
	"strconv"
	_ "github.com/lib/pq"
)

// Connect ...
func Connect() *sql.DB {
	const (
		host     = "database"
		port     = 5432
		user     = "postgres"
		password = "2017PASS"
		dbname   = "Rec_Wallet"
	)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err := sql.Open("postgres", psqlInfo)

	if err != nil {
		log.Println(err)
	}

	return db
}

func doTransaction(db *sql.DB,transactionData TransactionData,transactionID *uint64) bool {

	if(transactionData.From.Id==transactionData.To.Id){
		return false
	}

    fromJson , err1 :=  json.Marshal(&transactionData.From)
	toJson , err3 :=  json.Marshal(&transactionData.To)
	Amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

	row, err := db.Query("select * from amount where id=$1", transactionData.From.Id)	
	row2, err2 := db.Query("select * from amount where id=$1", transactionData.To.Id)

	if err2 !=nil || err1!=nil || err3!=nil || err!=nil || !row2.Next() {
		return false
	}

	var id string
    var balance uint64

	if row.Next() {
		row.Scan(&id, &balance)
	}else {
		return false
	}

	if(balance<Amount){
		return false
	}

	tx, err := db.Begin()
    if err != nil {
        return false
    }
	_, errFrom := tx.Exec("update amount set balance = balance - $1 where id = $2", Amount, transactionData.From.Id)

	if errFrom != nil {
		tx.Rollback()
		log.Println(errFrom)
		return false
	}

	_, errTo := tx.Exec("update amount set balance = balance + $1 where id = $2", Amount, transactionData.To.Id)

	if errTo != nil {
		tx.Rollback()
		return false
	}

	loc, _ := time.LoadLocation("Asia/Kolkata")
    dt := time.Now().In(loc)
   


	rowsTransactionID, errTrans :=
		tx.Query(`insert
		           into transactions(
					   transactionTime,
					   fromMetadata,
					   toMetadata,
					   amount,
					   isGenerated,
					   iswithdraw)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
			dt.Format("01-02-2006 15:04:05"), fromJson,toJson, Amount,false,false)

	if rowsTransactionID.Next(){
		rowsTransactionID.Scan(&transactionID)
	}

	if errTrans != nil {
		tx.Rollback()
		return false
	}

	jsonBodyData := map[string]interface{}{
		"transactionID":transactionID,
		"senderBalance":  balance,
		"from":transactionData.From,
		"to":transactionData.To,
		"isGenerated":false,
		"isWithdraw":false,
		"amount":Amount,
	}

	jsonBody, _ := json.Marshal(jsonBodyData)

	resp, err := http.Post("http://wallet-block:9000/addTransactionBlock/","application/json",bytes.NewBuffer(jsonBody))


	if err!=nil{
		tx.Rollback()
		return false
	}

	defer resp.Body.Close()


	var respResult  map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&respResult)

	if err!=nil{
		tx.Rollback()
		return false
	}

	
	if respResult["message"]=="done"{
       	tx.Commit()
	   return true 
	}else {
		tx.Rollback()
		return false
	}



}

func addMoney(db *sql.DB,transactionData TransactionData) bool {
	row2, err1 := db.Query("select * from amount where id=$1", transactionData.To.Id)
    fromJson , err2 :=  json.Marshal(&transactionData.From)
	toJson , err3 :=  json.Marshal(&transactionData.To)
    Amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

	if err1 !=nil || err2!=nil || err3!=nil {
		return false
	}

	if !row2.Next(){
		return false
	}
	
	tx, err := db.Begin()
    if err != nil {
        return false
	}

	_, errTo := tx.Exec("update amount set balance = balance + $1 where id = $2", Amount, transactionData.To.Id)
	if errTo != nil {
		tx.Rollback()
		return false
	}

	loc, _ := time.LoadLocation("Asia/Kolkata")

    transactionID := 0

    dt := time.Now().In(loc)
	rows, errTrans :=
		tx.Query(`insert
		           into transactions(
					   transactionTime,
					   fromMetadata,
					   toMetadata,
					   amount,
					   isGenerated,
					   iswithdraw)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
			dt.Format("01-02-2006 15:04:05"), fromJson,toJson, Amount,true,false)
	if rows.Next(){
		rows.Scan(&transactionID)
	}

	if errTrans != nil {
		tx.Rollback()
		return false
	}

	jsonBodyData := map[string]interface{}{
		"transactionID":transactionID,
		"from":transactionData.From,
		"to":transactionData.To,
		"isGenerated":true,
		"isWithdraw":false,
		"amount":Amount,
	}
	
	jsonBody, _ := json.Marshal(jsonBodyData)

	resp, err := http.Post("http://wallet-block:9000/addMoneyBlock/","application/json",bytes.NewBuffer(jsonBody))

	if err!=nil {
		tx.Rollback()
		return false
	}

	defer resp.Body.Close()

	var respResult  map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&respResult)

	if err!=nil{
		tx.Rollback()
		return false
	}

	if respResult["message"]=="done"{
       	tx.Commit()
	   return true 
	}else {
		tx.Rollback()
		return false
	}
}

func withdraw(db *sql.DB,transactionData TransactionData) bool {

	if(transactionData.From.Id==transactionData.To.Id){
		return false
	}

    fromJson , err1 :=  json.Marshal(&transactionData.From)
	toJson , err3 :=  json.Marshal(&transactionData.To)
	Amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

	row, err := db.Query("select * from amount where id=$1", transactionData.From.Id)	

	if err1!=nil || err3!=nil || err!=nil {
		return false
	}

	var id string
    var balance uint64

	if row.Next() {
		row.Scan(&id, &balance)
	}else {
		return false
	}

	if(balance<Amount){
		return false
	}

	tx, err := db.Begin()
    if err != nil {
        return false
    }
	_, errFrom := tx.Exec("update amount set balance = balance - $1 where id = $2", Amount, transactionData.From.Id)

	if errFrom != nil {
		tx.Rollback()
		log.Println(errFrom)
		return false
	}

	loc, _ := time.LoadLocation("Asia/Kolkata")
    dt := time.Now().In(loc)
   
	transactionID :=0

	rowsTransactionID, errTrans :=
		tx.Query(`insert
		           into transactions(
					   transactionTime,
					   fromMetadata,
					   toMetadata,
					   amount,
					   isGenerated,
					   iswithdraw)
				    values($1,$2,$3,$4,$5,$6) returning transactionID`,
			dt.Format("01-02-2006 15:04:05"), fromJson,toJson, Amount,false,true)

	if rowsTransactionID.Next(){
		rowsTransactionID.Scan(&transactionID)
	}

	if errTrans != nil {
		tx.Rollback()
		return false
	}

	jsonBodyData := map[string]interface{}{
		"transactionID":transactionID,
		"senderBalance":  balance,
		"from":transactionData.From,
		"to":transactionData.To,
		"isGenerated":false,
		"isWithdraw":true,
		"amount":Amount,
	}

	jsonBody, _ := json.Marshal(jsonBodyData)

	resp, err := http.Post("http://wallet-block:9000/addWithdrawBlock/","application/json",bytes.NewBuffer(jsonBody))


	if err!=nil{
		tx.Rollback()
		return false
	}

	defer resp.Body.Close()


	var respResult  map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&respResult)

	if err!=nil{
		tx.Rollback()
		return false
	}

	
	if respResult["message"]=="done"{
       	tx.Commit()
	   return true 
	}else {
		tx.Rollback()
		return false
	}



}

func sendMessage(db *sql.DB,messageData MessageData) bool {

	if(messageData.From.Id==messageData.To.Id){
		return false
	}

    fromJson , _ :=  json.Marshal(&messageData.From)
	toJson , _ :=  json.Marshal(&messageData.To)
	Message := messageData.Message

	loc, _ := time.LoadLocation("Asia/Kolkata")
    dt := time.Now().In(loc)

	_, errTrans :=
		db.Query(`insert
		           into messages(
					   messageTime,
					   fromMetadata,
					   toMetadata,
					   message)
				    values($1,$2,$3,$4)`,
			dt.Format("01-02-2006 15:04:05"), fromJson,toJson, Message)


	if errTrans != nil {
		return false
	}
	return true 

}

// MyState ...
type MyState struct {
	Balance      int
	Transactions []Transaction
}

// Transaction ...
type Transaction struct {
	From            json.RawMessage
	To              json.RawMessage
	TransactionID   interface{}
	TransactionTime interface{}
	Amount          interface{}
	IsGenerated  	interface{}
	IsWithdraw      interface{}
	TimeStamp       interface{}
}

type Message struct {
	From             json.RawMessage
	To               json.RawMessage
	MessageTime      interface{}
	Message          interface{}
	TimeStamp        interface{}
}

func getMyState(db *sql.DB, id string) MyState {

	state := map[string]int{}
	row, err := db.Query("select * from amount where id=$1", id)
	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var id string
		var balance int
		row.Scan(&id, &balance)
		state[id] = balance
	}
	myState := MyState{state[id], getTransactions(db, id)}
	return myState
}

func getState(db *sql.DB) map[string]int {
	state := map[string]int{}
	row, err := db.Query("select * from amount")

	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var id string
		var balance int
		row.Scan(&id, &balance)
		state[id] = balance
	}
	return state

}

func getTransactions(sb *sql.DB, id string) []Transaction {

	transactions := []Transaction{}

	row, err := db.Query(`select TransactionId,
								 TransactionTime,
								 fromMetadata,
								 toMetadata,
								 amount,
								 isGenerated,
								 isWithdraw,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
							   cast(fromMetadata->>'Id' as varchar) = $1 or cast(toMetadata->>'Id' as varchar) = $1`,
						   id)

	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var transaction Transaction
		row.Scan(&transaction.TransactionID, &transaction.TransactionTime, &transaction.From, 
				 &transaction.To, &transaction.Amount , &transaction.IsGenerated,
				 &transaction.IsWithdraw,&transaction.TimeStamp)
		transactions = append(transactions, transaction)

	}



	return transactions
}

type SingleObjectTransaction struct{
	 TransactionData Transaction
	 MessageData Message 
}

func getTransactionsBetweenObjects(sb *sql.DB, id1 string, id2 string) []SingleObjectTransaction {

	singleObjectTransactions := []SingleObjectTransaction{}

	row, err := db.Query(`((select
								 TransactionId as id,
								 TransactionTime as time,
								 fromMetadata,
								 toMetadata,
								 null as message,
								 amount as amount,
								 isGenerated,
								 isWithdraw,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
								(cast(fromMetadata->>'Id' as varchar) = $1 or cast(fromMetadata->>'Id' as varchar) = $2) 
								     and 
								(cast(toMetadata->>'Id' as varchar) = $1 or cast(toMetadata->>'Id' as varchar) = $2))
								
						   union all (select
							     null as id,
								 messageTime as time,
								 fromMetadata,
								 toMetadata,
								 message,
								 null as amount,
								 null as isGenerated,
								 null as isWithdraw,
								 to_timestamp(messageTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   messages 
						   where  
								(cast(fromMetadata->>'Id' as varchar) = $1 or cast(fromMetadata->>'Id' as varchar) = $2) 
								     and 
								(cast(toMetadata->>'Id' as varchar) = $1 or cast(toMetadata->>'Id' as varchar) = $2)))
						   order by TimeStamp`,
						   id1, id2)

	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var singleObjectTransaction SingleObjectTransaction

		var TransactionData Transaction
		var MessageData Message

		var id interface{}
		var time interface{}
		var fromMetadata json.RawMessage
		var toMetadata json.RawMessage
		var message interface{}
		var amount interface{}
		var isGenerated interface{}
		var isWithdraw interface{}
		var timeStamp interface{}

		row.Scan(&id,
				 &time, 
				 &fromMetadata, 
				 &toMetadata,
				 &message,
				 &amount, 
				 &isGenerated,
				 &isWithdraw,
				 &timeStamp)
		
		if amount!=nil{
			 TransactionData = Transaction{
			 fromMetadata,
			 toMetadata,
			 id,
			 time,
			 amount,
			 isGenerated,
    		 isWithdraw,
			 timeStamp }
		}else{
			MessageData  = Message{
			fromMetadata,
			toMetadata,
			time,
			message,
			timeStamp}
		}

		singleObjectTransaction = SingleObjectTransaction{TransactionData,MessageData}
		
		singleObjectTransactions = append(singleObjectTransactions, singleObjectTransaction)

		
	}

	
	

	return singleObjectTransactions
}
