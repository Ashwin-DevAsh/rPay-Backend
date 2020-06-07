package main

import (
	"database/sql"
	"log"

	"net/http"

	socketio "github.com/googollee/go-socket.io"

	_ "github.com/lib/pq"

	"github.com/NaySoftware/go-fcm"
)

const serverKey string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"

func sendNotification(devices []string) {

	log.Println("Notification send to ", devices)
	c := fcm.NewFcmClient(serverKey)
	c.AppendDevices(devices)
	c.NewFcmRegIdsMsg(devices, map[string]string{
		"type": "awake",
	})
	c.Send()
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
			s.Join(data["number"])
			updateOnline(db, data["number"], s.ID(), data["fcmToken"], true)
		}
		s.Emit("doUpdate")
	})

	server.OnEvent("/notifyPayment", func(s socketio.Conn, data map[string]string) {
		log.Println(data)
		if data != nil {
			server.BroadcastToRoom("/", data["to"], "receivedPayment")
		}
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Println(" disconnected : ", s.ID())
		s.LeaveAll()

		var fcmToken string

		err := db.QueryRow("select fcmToken from info where socketid = $1", s.ID()).Scan(&fcmToken)

		if err == sql.ErrNoRows {
			log.Println("No Results Found")
		}
		if err != nil {
			log.Println("erroe while disconnect ", err)
		}

		log.Println("the token is = ", fcmToken)

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
