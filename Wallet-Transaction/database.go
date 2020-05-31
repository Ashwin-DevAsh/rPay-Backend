package main

import (
	"database/sql"
	"fmt"
	"log"

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
