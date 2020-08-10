package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"
	"net/http"
	"encoding/json"
    "bytes"
	_ "github.com/lib/pq"
)

// Connect ...
func Connect() *sql.DB {
	const (
		host     = "status-database"
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

func doTransaction(db *sql.DB, from string, fromName string, to string, toName string, amount uint64) bool {

	if(from==to){
		return false
	}

	row2, err2 := db.Query("select * from amount where id=$1", to)

	if err2 !=nil {
		log.Println(err2)
		return false
	}

	if !row2.Next(){
		return false
	}
	
	row, err := db.Query("select * from amount where id=$1", from)

	if err != nil {
		log.Println(err)
		return false
	}

	var id string
    var balance uint64

	if row.Next() {
		row.Scan(&id, &balance)
	}else {
		return false
	}

	if(balance<amount){
		return false
	}

	tx, err := db.Begin()
    if err != nil {
        return false
    }
	_, errFrom := tx.Exec("update amount set balance = balance - $1 where id = $2", amount, from)

	if errFrom != nil {
		tx.Rollback()
		log.Println(errFrom)
		return false
	}

	_, errTo := tx.Exec("update amount set balance = balance + $1 where id = $2", amount, to)

	if errTo != nil {
		tx.Rollback()
		return false
	}

	loc, _ := time.LoadLocation("Asia/Kolkata")
    dt := time.Now().In(loc)
   

	_, errTrans :=
		tx.Exec("insert into transactions(transactionTime,fromID,toID,toName,amount,fromName,isGenerated,iswithdraw) values($1,$2,$3,$4,$5,$6,$7,$8)",
			dt.Format("01-02-2006 15:04:05"), from, to, toName, amount, fromName,false,false)

	if errTrans != nil {
		tx.Rollback()
		return false
	}

	jsonBodyData := map[string]interface{}{
		"senderBalance":  balance,
		"fromID":from,
		"toID":to,
		"amount":amount,
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

func addMoney(db *sql.DB, from string, fromName string, to string, toName string, amount uint64) bool {
	row2, err2 := db.Query("select * from amount where id=$1", to)

	log.Println("querying....")


	if err2 !=nil {
		log.Println(err2)
		return false
	}

	if !row2.Next(){
		return false
	}
	
	tx, err := db.Begin()
    if err != nil {
        return false
	}
	
	log.Println("Checking....")

	_, errTo := tx.Exec("update amount set balance = balance + $1 where id = $2", amount, to)
	if errTo != nil {
		tx.Rollback()
		return false
	}

	log.Println("Stage 2....")


	loc, _ := time.LoadLocation("Asia/Kolkata")
    dt := time.Now().In(loc)
	_, errTrans :=
		tx.Exec("insert into transactions(transactionTime,fromID,toID,toObject,amount,fromObject,isGenerated,iswithdraw) values($1,$2,$3,$4,$5,$6,$7,$8)",
			dt.Format("01-02-2006 15:04:05"), from, to, toName, amount, fromName,true,false)

	if errTrans != nil {
		tx.Rollback()
		return false
	}

	log.Println("stage 3....")


	jsonBodyData := map[string]interface{}{
		"id":to,
		"amount":amount,
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

// MyState ...
type MyState struct {
	Balance      int
	Transactions []Transaction
}

// Transaction ...
type Transaction struct {
	From            interface{}
	To              interface{}
	TransactionID   interface{}
	TransactionTime interface{}
	ToName          interface{}
	Amount          interface{}
	FromName        interface{}
	IsGenerated  	interface{}
	IsWithdraw      interface{}
	TimeStamp       interface{}
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

	row, err := db.Query(`select TransactionTime,
								 fromMetadata -> 'id',
								 toMetadata -> 'id',
								 fromMetadata -> 'name',
								 toMetadata -> 'name',
								 amount,
								 isGenerated,
								 isWithdraw,
								 to_timestamp(transactionTime , 'MM-DD-YYYY HH24:MI:SS') as TimeStamp 
						   from 
							   transactions 
						   where 
							   cast(fromMetadata->'id' as varchar) = $1 or cast(toMetadata->'id' as varchar) = $1`,
						   id)

	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var transaction Transaction
		row.Scan(&transaction.TransactionID, &transaction.TransactionTime, &transaction.From, 
				 &transaction.To, &transaction.ToName, &transaction.FromName, &transaction.Amount ,
				 &transaction.IsGenerated,&transaction.IsWithdraw,&transaction.TimeStamp)
		transactions = append(transactions, transaction)

	}



	return transactions
}

func getTransactionsBetweenObjects(sb *sql.DB, id1 string, id2 string) []Transaction {

	transactions := []Transaction{}

	row, err := db.Query("select * from transactions where (fromid = $1 or fromid = $2) and (toid = $1 or toid = $2)", id1, id2)

	if err != nil {
		log.Println(err)
	}

	for row.Next() {
		var transaction Transaction
		row.Scan(&transaction.TransactionID, &transaction.TransactionTime, &transaction.From, 
			&transaction.To, &transaction.ToName, &transaction.FromName, &transaction.Amount, &transaction.IsGenerated,&transaction.IsWithdraw)
		transactions = append(transactions, transaction)

	}


	return transactions
}
