package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

var r = mux.NewRouter()

var db = Connect()

var smsAPIKey string = "bf344e3e-a1c5-11ea-9fa5-0200cd936042"

func decryptJwtToken(tokenString string) jwt.MapClaims {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("DevAsh"), nil
	})

	if err != nil {
		log.Println(err)
		return nil
	}
	return claims
}

func notify(from string, to string, fromName string, amount string, notifyType string, fromEmail string) {
	log.Println("to ", to, from, amount)
	var fcmToken string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"
	db.QueryRow("select fcmtoken from info where id=$1", to).Scan(&fcmToken)
	sendNotification([]string{fcmToken}, fromName, from, amount, notifyType, fromEmail)
}

type TransactionData struct {
	Amount string
	To     struct {
		Id     string
		Name   string
		Number string
		Email  string
	}
	From struct {
		Id     string
		Number string
		Name   string
		Email  string
	}
}

type CartProuct struct {
	Count   uint64
	Amount  string
	Product struct {
		ProductId    string
		ProductName  string
		ProductOwner string
		Price        uint64
		Category     string
	}
}

type OrderData struct {
	Amount          string
	Products        []CartProuct
	TransactionData TransactionData
}

func handelRequest() {
	r.HandleFunc("/order", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "POST" {
			response.Header().Set("Content-type", "application/json")
			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)
			if header == nil {
				message, err := json.Marshal(map[string]string{"message": "failed"})
				if err == nil {
					log.Println(err)
				}
				log.Println("Header error")
				response.Write(message)
				return
			}
			var orderData OrderData
			err := json.NewDecoder(request.Body).Decode(&orderData)

			log.Println(orderData)

			if (header["number"]) != strings.Replace(orderData.TransactionData.From.Number, "+", "", -1) {
				message, _ := json.Marshal(map[string]string{"message": "failed"})
				log.Println("Header error")
				response.Write(message)
				return
			}

			if err != nil {
				log.Printf("verbose error info: %#v", err)
				return
			}

			var transactionID *uint64 = 0
			var transactionTime string = ""
			if doOrder(db, orderData.TransactionData, &transactionID, &transactionTime) {
				userJSON, err := json.Marshal(map[string]interface{}{
					"message":         "done",
					"transactionID":   *transactionID,
					"transactionTime": transactionTime,
				})
				if err != nil {
					log.Println(err)
				} else {
					response.Write(userJSON)
				}

			} else {

				userJSON, err := json.Marshal(map[string]string{
					"message": "failed",
				})
				if err != nil {
					log.Println(err)
				}
				response.Write(userJSON)

			}
		}
	})
}

func main() {
	handelRequest()
	defer db.Close()
	log.Fatal(http.ListenAndServe(":4600", r))
}
