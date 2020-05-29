package main

import (
	"database/sql"
	"fmt"
	"log"

	"net/http"

	socketio "github.com/googollee/go-socket.io"

	_ "github.com/lib/pq"

	"github.com/NaySoftware/go-fcm"
)

const serverKey string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"

func sendNotification(devices []string) {
	c := fcm.NewFcmClient(serverKey)
	c.AppendDevices(devices)
	c.Send()
}

func connect() *sql.DB {
	const (
		host     = "status-database"
		port     = 5432
		user     = "postgres"
		password = "2017PASS"
		dbname   = "status"
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

func updateOnline(db *sql.DB, id string, socketID string, isOnline bool) {
	insertStatement := `update status set isonline=$3 , socketid=$2 where id=$1`
	_, err := db.Exec(insertStatement, id, socketID, isOnline)
	log.Println("UpdatedOnline", err)
}

func updateOffline(db *sql.DB, socketID string) {
	insertStatement := `update status set socketid=null , isonline=false where socketid=$1`
	_, err := db.Exec(insertStatement, socketID)
	log.Println("UpdatedOffline", err)
}

func main() {

	server, err := socketio.NewServer(nil)

	db := connect()

	if err != nil {
		log.Fatal(err)
	}

	server.OnConnect("/", func(s socketio.Conn) error {
		log.Println(" connected : ", s.ID())
		s.Join(s.ID())
		return nil
	})

	server.OnEvent("/", "getInformation", func(s socketio.Conn, data map[string]string) {
		log.Println(s.ID(), " = ", data)
		if data != nil {
			updateOnline(db, data["number"], s.ID(), true)
		}

	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println(" disconnected : ", s.ID())
		s.LeaveAll()

		var fcmToken string = ""

		err := db.QueryRow("select fcmToken from status where socketid = $1", s.ID()).Scan(&fcmToken)

		if err == sql.ErrNoRows {
			log.Println("No Results Found")
		}
		if err != nil {
			log.Println(err)
		}

		log.Println(fcmToken)

		if fcmToken != "" {
			sendNotification([]string{fcmToken})
		}

		updateOffline(db, s.ID())

	})

	go server.Serve()
	defer server.Close()

	http.Handle("/socket.io/", server)
	log.Println("Serving at localhost:7000...")
	log.Fatal(http.ListenAndServe(":7000", nil))
}
