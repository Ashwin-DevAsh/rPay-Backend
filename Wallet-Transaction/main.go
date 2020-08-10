package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

var r = mux.NewRouter()

var db = Connect()

var smsAPIKey string = "bf344e3e-a1c5-11ea-9fa5-0200cd936042"

type TransactionData  struct {
		Amount  string
		To struct{
						Id string
						Name string
						Number string
						Email string
					}
		From struct{
						Id string
						Number string
						Name string
						Email string
					}
}


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

func notify(from string, to string, fromName string, amount string,notifyType string) {
	log.Println("to ", to, from, amount)
	jsonBodyData := map[string]string{
		"From": "RECPAY",
		"To":   "+" + to,
		"Msg":  amount + " deposited to A/c " + to + " From " + fromName + " ( " + from + " ) ",
	}
	jsonBody, _ := json.Marshal(jsonBodyData)
	result, err := http.Post("https://2factor.in/API/V1/"+smsAPIKey+"/ADDON_SERVICES/SEND/TSMS", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Println("error = ", err)
	} else {
		log.Println(result)
	}

	var fcmToken string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"
	db.QueryRow("select fcmtoken from info where id=$1", to).Scan(&fcmToken)
	sendNotification([]string{fcmToken}, fromName, from, amount,notifyType)
}

func handelRequest() {
	r.HandleFunc("/addMoney",func(response http.ResponseWriter, request *http.Request){
		if request.Method == "POST"{
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

			var transactionData TransactionData

			log.Println("addMoney....")

			err := json.NewDecoder(request.Body).Decode(&transactionData)

			if err != nil {
				log.Printf("verbose error info: %#v", err)
				return
			}

			amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

			log.Println(db, transactionData.From.Id, transactionData.From.Name, transactionData.From.Id, transactionData.From.Name, amount)

			if addMoney(db, transactionData.From.Id, transactionData.From.Name, transactionData.From.Id, transactionData.From.Name, amount) {
				userJSON, err := json.Marshal(map[string]string{
					"message": "done",
				})

				if err != nil {
					log.Println(err)

				} else {
					notify(transactionData.From.Id,  transactionData.From.Id , transactionData.From.Name, transactionData.Amount,"addedMoney")
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
	r.HandleFunc("/pay", func(response http.ResponseWriter, request *http.Request) {
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

			var transactionData struct {
				From     string
				To       string
				Amount   string
				ToName   string
				FromName string
			}

			err := json.NewDecoder(request.Body).Decode(&transactionData)

			if err != nil {
				log.Printf("verbose error info: %#v", err)
				return
			}

			amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

			if doTransaction(db, transactionData.From, transactionData.FromName, transactionData.To, transactionData.ToName, amount) {
				userJSON, err := json.Marshal(map[string]string{
					"message": "done",
				})

				if err != nil {
					log.Println(err)

				} else {
					notify(transactionData.From, transactionData.To, transactionData.FromName, transactionData.Amount,"receivedMoney")
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

	r.HandleFunc("/getState", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)

			if header != nil {
				userJSON, err := json.Marshal(getState(db))

				if err != nil {
					log.Println(err)
				}

				response.Write(userJSON)
			}

		}
	})

	r.HandleFunc("/getMyState", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			id := request.URL.Query().Get("id")

			log.Println(id)

			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)

			if header != nil {
				userJSON, err := json.Marshal(getMyState(db, id))

				if err != nil {
					log.Println(err)
				}


				response.Write(userJSON)
			}

		}
	})

	r.HandleFunc("/getTransactions", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			number := request.URL.Query().Get("number")

			log.Println(number)

			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)

			if header != nil || true {
				userJSON, err := json.Marshal(getTransactions(db, number))

				if err != nil {
					log.Println(err)
				}

				response.Write(userJSON)
			}

		}
	})

	r.HandleFunc("/getTransactionsBetweenObjects", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			number1 := request.URL.Query().Get("id1")
			number2 := request.URL.Query().Get("id2")

			log.Println(number1, number2)

			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)

			if header != nil || true {
				userJSON, err := json.Marshal(getTransactionsBetweenObjects(db, number1, number2))

				if err != nil {
					log.Println(err)
				}

				response.Write(userJSON)
			}

		}
	})

}

func main() {

	log.Println(db)

	handelRequest()

	defer db.Close()

	log.Fatal(http.ListenAndServe(":10000", r))
}
