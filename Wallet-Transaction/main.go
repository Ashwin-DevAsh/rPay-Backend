package main

import (
	"encoding/json"
	"log"
	"net/http"
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

type MessageData  struct {
		Message  string
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

func notify(from string, to string, fromName string, amount string,notifyType string,fromEmail string) {
	log.Println("to ", to, from, amount)
	var fcmToken string = "AAAAwveu2fw:APA91bFuqXWjuuTBix0mRNydlB3o2hEp9Adky7IJX2LNS3mKvkblUCtbeqGFUWrjRCgyrwRY-Q46b_M6weSf0wxj33wv7h_ASrpQnSQmWwRVEEun0T3lrliTh2NhQNYHypkeM38gjI9A"
	db.QueryRow("select fcmtoken from info where id=$1", to).Scan(&fcmToken)
	sendNotification([]string{fcmToken}, fromName, from, amount,notifyType,fromEmail)
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
			err := json.NewDecoder(request.Body).Decode(&transactionData)
			log.Println(header["number"])
			log.Println(header)
			if(header["number"]!=transactionData.To.Number){
				message, _ := json.Marshal(map[string]string{"message": "failed"})
                log.Println("Header error")
				response.Write(message)
				return
			}
			if err != nil {
				log.Printf("verbose error info: %#v", err)
				return
			}
			if addMoney(db, transactionData) {
				userJSON, err := json.Marshal(map[string]string{
					"message": "done",
				})
				if err != nil {
					log.Println(err)
				} else {
					notify(transactionData.To.Id,  transactionData.To.Id , transactionData.From.Name, transactionData.Amount,"addedMoney",transactionData.From.Email)
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
			var transactionData TransactionData
			err := json.NewDecoder(request.Body).Decode(&transactionData)
			if err != nil {
				log.Printf("verbose error info: %#v", err)
				return
			}
			var transactionID uint64 = 0
			var transactionTime string = ""
			if doTransaction(db, transactionData,&transactionID,&transactionTime) {
				userJSON, err := json.Marshal(map[string]interface{}{
					"message": "done",
					"transactionID": transactionID,
					"transactionTime":transactionTime,
				})
				if err != nil {
					log.Println(err)
				} else {
					notify(transactionData.From.Id, transactionData.To.Id, transactionData.From.Name, transactionData.Amount,"receivedMoney",transactionData.From.Email)
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

	r.HandleFunc("/withdraw",func(response http.ResponseWriter, request *http.Request){
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
		err := json.NewDecoder(request.Body).Decode(&transactionData)
		if err != nil {
			log.Printf("verbose error info: %#v", err)
			return
		}
		if withdraw(db, transactionData) {
			userJSON, err := json.Marshal(map[string]string{
				"message": "done",
			})
			if err != nil {
				log.Println(err)
			} else {
				notify(transactionData.From.Id,  transactionData.From.Id , transactionData.From.Name, transactionData.Amount,"withdraw",transactionData.From.Email)
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

	r.HandleFunc("/sendMessage",func(response http.ResponseWriter, request *http.Request){
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
		var messageData MessageData
		err := json.NewDecoder(request.Body).Decode(&messageData)
		if err != nil {
			log.Printf("verbose error info: %#v", err)
			return
		}
		if sendMessage(db, messageData) {
			userJSON, err := json.Marshal(map[string]string{
				"message": "done",
			})
			if err != nil {
				log.Println(err)
			} else {
					
				notify(messageData.From.Id,  messageData.To.Id , messageData.From.Name, messageData.Message,"message",messageData.From.Email)
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
			id1 := request.URL.Query().Get("id1")
			id2 := request.URL.Query().Get("id2")
			jwtToken := request.Header.Get("jwtToken")
			header := decryptJwtToken(jwtToken)
			if header != nil || true {
				userJSON, err := json.Marshal(getTransactionsBetweenObjects(db, id1, id2))
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
	log.Fatal(http.ListenAndServe(":10000", r))
}
