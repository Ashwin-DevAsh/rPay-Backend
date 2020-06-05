package main

import (
	"log"

	"github.com/NaySoftware/go-fcm"
)

const serverKey string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"

func sendNotification(devices []string, data map[string]string) {

	log.Println("Notification send to ", devices)
	c := fcm.NewFcmClient(serverKey)
	c.AppendDevices(devices)
	c.NewFcmRegIdsMsg(devices, data)
	c.Send()
}
