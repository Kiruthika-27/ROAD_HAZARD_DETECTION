package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	ipfsapi "github.com/ipfs/go-ipfs-api"
)

// Event represents individual event information.
type Event struct {
	Receiver    string  `json:"receiver"`
	Sender      string  `json:"sender"`
	MessageType string  `json:"message_type"`
	Timestamp   float64 `json:"timestamp"`
}

func storeDataInIPFS(filePath string) (string, error) {
	client := ipfsapi.NewShell("localhost:5006")

	dataFile, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer dataFile.Close()

	dataBytes, err := ioutil.ReadAll(dataFile)
	if err != nil {
		return "", err
	}

	hash, err := client.Add(bytes.NewReader(dataBytes))
	if err != nil {
		return "", err
	}
	return hash, nil
}

func main() {
	jsonFilePath := "test_data.json" // Change to your test JSON file

	// Read the JSON file
	data, err := ioutil.ReadFile(jsonFilePath)
	if err != nil {
		log.Fatalf("Failed to read the JSON file: %v", err)
	}

	// Log the raw JSON data
	fmt.Printf("Raw JSON Data: %s\n", string(data))

	// Unmarshal the JSON data
	var events []Event
	if err := json.Unmarshal(data, &events); err != nil {
		log.Fatalf("Failed to unmarshal JSON data: %v", err)
	}

	// Print the parsed events
	fmt.Printf("Traffic Events: %+v\n", events)

	// Store the data in IPFS
	ipfsHash, err := storeDataInIPFS(jsonFilePath)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("IPFS Hash: %s\n", ipfsHash)
}
