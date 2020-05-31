package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

var r = mux.NewRouter()

var db = Connect()

func handelRequest() {
	r.HandleFunc("/pay", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "POST" {

			userJSON, err := json.Marshal(map[string]string{
				"message": "Wellcome to rec wallet",
			})

			if err != nil {
				log.Println(err)
			}

			response.Header().Set("Content-type", "application/json")
			response.Write(userJSON)
		}
	})

	r.HandleFunc("/getState", func(response http.ResponseWriter, request *http.Request) {
		if request.Method == "GET" {

			response.Header().Set("Content-type", "application/json")

			userJSON, err := json.Marshal(getState(db))

			if err != nil {
				log.Println(err)
			}

			response.Write(userJSON)
		}
	})

}

func main() {

	log.Println(db)

	handelRequest()

	log.Fatal(http.ListenAndServe(":10000", r))
}
