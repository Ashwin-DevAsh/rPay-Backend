package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
)

var r = mux.NewRouter()

var db = Connect()

func decryptJwtToken(tokenString string) jwt.MapClaims {
	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("DEVASH"), nil
	})

	if err != nil {
		log.Println(err)
		return nil

	}
	for key, val := range claims {
		log.Println(key, " -> ", val)
	}
	return claims

}

func handelRequest() {
	r.HandleFunc("/pay", func(response http.ResponseWriter, request *http.Request) {

		if request.Method == "POST" {

			response.Header().Set("Content-type", "application/json")

			// jwtToken := request.Header.Get("jwtToken")
			// header := decryptJwtToken(jwtToken)

			// if header == nil {
			// 	message, err := json.Marshal(map[string]string{"message": "failed"})
			// 	if err == nil {
			// 		log.Println(err)
			// 	}
			// 	log.Println("Header error")
			// 	response.Write(message)
			// 	return
			// }

			var transactionData struct {
				From   string
				To     string
				Amount string
			}

			log.Println(request.Body)

			err := json.NewDecoder(request.Body).Decode(&transactionData)

			if err != nil {
				log.Println("error = ", err)
			}

			println(transactionData.From, transactionData.To, transactionData.Amount)

			amount, _ := strconv.ParseUint(transactionData.Amount, 10, 64)

			if doTransaction(db, transactionData.From, transactionData.To, amount) {
				userJSON, err := json.Marshal(map[string]string{
					"message": "done",
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

	r.HandleFunc("/getState", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			jwtToken := request.Header.Get("jwtToken")
			log.Println(jwtToken)
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

}

func main() {

	log.Println(db)

	handelRequest()

	log.Fatal(http.ListenAndServe(":10000", r))
}
