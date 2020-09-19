package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

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

type OrderDatabase{
  OrederId interface{},
  Status interface{},
  Amount interface{},
  OrderdBy interface{}
  Timestamp interface{},
  Products []json.RawMessage,
  PaymentMetadata json.RawMessage
}

func doOrder(db *sql.DB, orderData OrderData, transactionID *uint64, transactionTime *string) bool {

	if orderData.TransactionData.From.Id == orderData.ransactionData.To.Id {
		return false
	}

	fromJson, _ := json.Marshal(&orderData.TransactionData.From)
	toJson, _ := json.Marshal(&orderData.TransactionData.To)
	Amount, _ := strconv.ParseUint(orderData.TransactionData.Amount, 10, 64)

	row, err := db.Query("select * from amount where id=$1", orderData.TransactionData.From.Id)

	if err!=nil{
		log.Println(err)
		return false
	}

	var id string
	var balance uint64

	if row.Next() {
		row.Scan(&id, &balance)
	} else {
		return false
	}

	if balance < Amount {
		return false
	}

	tx, err := db.Begin()
	if err != nil {
		return false
	}
	_, errFrom := tx.Exec("update amount set balance = balance - $1 where id = $2", Amount, orderData.TransactionData.From.Id)

	if errFrom != nil {
		tx.Rollback()
		log.Println(errFrom)
		return false
	}

	loc, _ := time.LoadLocation("Asia/Kolkata")
	dt := time.Now().In(loc)

	*transactionTime = dt.Format("01-02-2006 15:04:05")

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
			transactionTime, fromJson, toJson, Amount, false, false)

	if rowsTransactionID.Next() {
		rowsTransactionID.Scan(transactionID)
	}

	
	



	if errTrans != nil {
		tx.Rollback()
		return false
	}

	log.Println("transaction id = ", transactionID)


	jsonBodyData := map[string]interface{}{
		"transactionID": transactionID,
		"senderBalance": balance,
		"from":         orderData.transactionData.From,
		"to":           orderData.transactionData.To,
		"isGenerated":   false,
		"isWithdraw":    false,
		"amount":        Amount,
	}

	jsonBody, _ := json.Marshal(jsonBodyData)

	resp, err := http.Post("http://wallet-block:9000/addTransactionBlock/", "application/json", bytes.NewBuffer(jsonBody))

	if err != nil {
		tx.Rollback()
		return false
	}

	defer resp.Body.Close()

	var respResult map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&respResult)

	if err != nil {
		tx.Rollback()
		return false
	}

	if respResult["message"] == "done" {
		tx.Commit()
		return true
	} else {
		tx.Rollback()
		return false
	}

}
