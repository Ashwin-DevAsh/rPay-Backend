package main

import (
	"log"

	"github.com/NaySoftware/go-fcm"
)

type PaymentData struct{
	Type string,
	amount string
}

func sendNotification(devices []string, from string) {
	var serverKey string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"

	log.Println("Notification send to ", devices)
	c := fcm.NewFcmClient(serverKey)
	c.AppendDevices(devices)

	c.NewFcmRegIdsMsg(devices, paymentData{
	    "receivedMoney",from
	})
	c.Send()
}
