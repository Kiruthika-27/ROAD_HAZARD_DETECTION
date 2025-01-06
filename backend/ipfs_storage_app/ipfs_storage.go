package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	ipfsapi "github.com/ipfs/go-ipfs-api"
)

// TrafficData represents the structure of our traffic data.
type TrafficData struct {
	Timestamp float64   `json:"timestamp"`
	Vehicles  []Vehicle `json:"vehicles"`
}

// Vehicle represents individual vehicle information.
type Vehicle struct {
	ID       string    `json:"id"`
	Position []float64 `json:"position"`
	Speed    float64   `json:"speed"`
	Lane     string    `json:"lane"`
}

func storeDataInIPFS(filePath string) (string, error) {
	client := ipfsapi.NewShell("localhost:5004") // Connects to local IPFS daemon.

	dataFile, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer dataFile.Close()

	dataBytes, _ := ioutil.ReadAll(dataFile)

	hash, err := client.Add(bytes.NewReader(dataBytes))
	if err != nil {
		return "", err
	}
	return hash, nil // Return the hash of stored JSON.
}

func main() {
	ipfsHash, err := storeDataInIPFS("traffic_data.json")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("IPFS Hash: %s\n", ipfsHash)
}
