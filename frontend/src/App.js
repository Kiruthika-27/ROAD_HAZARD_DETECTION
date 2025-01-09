import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DataStorage from "./artifacts/RoadHazardStorage.json"; // Make sure this points to your compiled contract ABI

function App() {
    const [trafficIpfsHash, setTrafficIpfsHash] = useState("");
    const [accidentIpfsHash, setAccidentIpfsHash] = useState("");
    const [message, setMessage] = useState("");
    const [dataStorage, setDataStorage] = useState(null);
    const [storedTrafficData, setStoredTrafficData] = useState([]); // Initialize as empty array
    const [storedAccidentData, setStoredAccidentData] = useState([]); // Initialize as empty array

    // Function to request account access
    const requestAccount = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                console.log("Connected account:", accounts[0]);
            } catch (error) {
                console.error("Error requesting accounts:", error);
                setMessage(`Error requesting accounts: ${error.message}`);
            }
        } else {
            alert("Please install MetaMask!");
            setMessage("Please install MetaMask!");
        }
    };

    useEffect(() => {
        const initializeContract = async () => {
            await requestAccount(); // Request account access
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(
                    "0x8Fa7F30445d634F79635CaDD323e08A38f6344f5", // Replace with your contract address
                    DataStorage.abi,
                    signer
                );
                setDataStorage(contract);
                console.log("Contract initialized:", contract);
            } catch (error) {
                console.error("Error initializing contract:", error);
                setMessage(`Error initializing contract: ${error.message}`);
            }
        };

        initializeContract();
    }, []);

    // Function to store Traffic Data
    const storeTrafficData = async () => {
        if (!dataStorage) return;

        try {
            const response = await fetch("/traffic_data.json"); // Ensure this file is served in your React app's public folder
            const jsonData = await response.json();

            // Call the localhost API to store the JSON content in IPFS
            const apiResponse = await fetch("http://localhost:8080/storeTraffic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            if (!apiResponse.ok) {
                throw new Error(`Error from IPFS API: ${apiResponse.statusText}`);
            }

            const { cid } = await apiResponse.json();
            console.log("Received Traffic CID from IPFS:", cid);

            // Store the IPFS hash on the blockchain
            const tx = await dataStorage.storeTrafficData(cid, {
                gasLimit: 500000, // Adjust as necessary
            });
            await tx.wait();

            console.log("Traffic Data stored in smart contract:", cid);
            setTrafficIpfsHash(cid);
            setMessage("Traffic Data stored successfully!");
        } catch (error) {
            console.error("Error storing Traffic Data:", error);
            setMessage(`Error storing Traffic Data: ${error.message}`);
        }
    };

    // Function to store Accident Data
    const storeAccidentData = async () => {
        if (!dataStorage) return;

        try {
            const response = await fetch("/event_logs.json"); // Ensure this file is served in your React app's public folder
            const jsonData = await response.json();

            console.log("Data to be sent:", jsonData); // Log the data being sent

            // Call the localhost API to store the JSON content in IPFS
            const apiResponse = await fetch("http://localhost:8080/storeAccident", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jsonData),
            });

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text(); // Get the response text for debugging
                throw new Error(`Error from IPFS API: ${apiResponse.statusText} - ${errorText}`);
            }

            const { cid } = await apiResponse.json();
            console.log("Received Accident CID from IPFS:", cid);

            // Store the IPFS hash on the blockchain
            const tx = await dataStorage.storeAccidentData(cid, {
                gasLimit: 500000, // Adjust as necessary
            });
            await tx.wait();

            console.log("Accident Data stored in smart contract:", cid);
            setAccidentIpfsHash(cid);
            setMessage("Accident Data stored successfully!");
        } catch (error) {
            console.error("Error storing Accident Data:", error);
            setMessage(`Error storing Accident Data: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await storeTrafficData();
      };

    // Function to fetch Traffic Data
    const fetchTrafficData = async () => {
        if (!dataStorage) {
          console.error("Contract not initialized.");
          setMessage("Contract not initialized.");
          return;
        }
    
        try {
          // Fetch the IPFS hash from the blockchain
          const ipfsHash = await dataStorage.getTrafficData(); // Ensure this matches your contract's function
          console.log("IPFS Hash retrieved from contract:", ipfsHash);
    
          if (!ipfsHash || ipfsHash === "0x" || ipfsHash === "") {
            setMessage("No Traffic Data found.");
            return;
          }

          setStoredTrafficData(ipfsHash); // Update state with fetched IPFS hash
    
          // Fetch the content from IPFS using the localhost API
          const response = await fetch(
            `http://localhost:8080/retrieveTraffic/${ipfsHash}`
          );
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Error retrieving content from IPFS: ${response.statusText}`
            );
          }
    
          const content = await response.json();
          console.log("Content retrieved from IPFS:", content);
    
          // Display the content on the page
          setMessage("Traffic Data fetched successfully!");
          setStoredTrafficData(JSON.stringify(content, null, 2)); // Convert content to string for display
        } catch (error) {
          console.error("Error fetching data:", error);
          setMessage(`Error fetching data: ${error.message}`);
        }
      };
    
    /*const fetchTrafficData = async () => {
        if (!dataStorage) return;

        try {
            const ipfsHash = await dataStorage.getTrafficData();
            console.log("IPFS Hash retrieved for Traffic Data:", ipfsHash);

            if (!ipfsHash || ipfsHash === "0x" || ipfsHash === "") {
                setMessage("No Traffic Data found.");
                return;
            }

            const response = await fetch(`http://localhost:8080/retrieveTraffic/${ipfsHash}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error retrieving content from IPFS: ${response.statusText} - ${errorText}`);
            }

            const content = await response.json();
            console.log("Content retrieved for Traffic Data:", content);

            if (content && content.vehicles) {
                setStoredTrafficData(content.vehicles); // Set to the vehicles array
            } else {
                setStoredTrafficData([]); // Handle case where vehicles array is not present
            }

            setStoredTrafficData(content); 
            setMessage("Traffic Data fetched successfully!");
        } catch (error) {
            console.error("Error fetching Traffic Data:", error);
            setMessage(`Error fetching Traffic Data: ${error.message}`);
        }
    };*/
    
    // Function to fetch Accident Data
    const fetchAccidentData = async () => {
        if (!dataStorage) return;

        try {
            const ipfsHash = await dataStorage.getAccidentData();
            console.log("IPFS Hash retrieved for Accident Data:", ipfsHash);

            if (!ipfsHash || ipfsHash === "0x" || ipfsHash === "") {
                setMessage("No Accident Data found.");
                return;
            }

            // Fetch data from IPFS
            const response = await fetch(`http://localhost:8080/retrieveAccident/${ipfsHash}`);
            if (!response.ok) throw new Error(`Error retrieving content from IPFS: ${response.statusText}`);

            const content = await response.json();
            console.log("Content retrieved for Accident Data:", content);

            // Assuming content is an array
            setStoredAccidentData(content); 
            setMessage("Accident Data fetched successfully!");
        } catch (error) {
            console.error("Error fetching Accident Data:", error);
            setMessage(`Error fetching Accident Data: ${error.message}`);
        }
    };

    return (
        <div>
          <h1>My DApp</h1>
          {message && <p>{message}</p>}
          <h2>Traffic Data</h2>
          <form onSubmit={handleSubmit}>
            {/* <input
              type="text"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              placeholder="Enter IPFS Hash"
              required
            /> */}
            <button onClick={storeTrafficData}>Store Traffic Data</button>
          </form>
          
          <button onClick={fetchTrafficData}>Fetch Stored Data</button>
          {storedTrafficData && (
            <div>
              <h3>Retrieved Traffic Data:</h3>
              <pre>{storedTrafficData}</pre>{" "}
              {/* Use preformatted text to display JSON content */}
            </div>
          )}
          <h2>Accident Data</h2>
          <button onClick={storeAccidentData}>Store Accident Data</button><br></br>
          <button onClick={fetchAccidentData}>Fetch Accident Data</button>
          <h3>Retrived Accident Data:</h3>
            <pre>
                {Array.isArray(storedAccidentData) && storedAccidentData.length > 0 ? 
                    storedAccidentData.map((data, index) => 
                        <div key={index}>{JSON.stringify(data, null, 2)}</div>) : 
                    ""
                }
            </pre>
        </div>
      );
    }
    
   /* return (
        <div>
            <h1>Traffic and Accident Data Storage</h1>
            <button onClick={storeTrafficData}>Store Traffic Data</button>
            <button onClick={fetchTrafficData}>Fetch Traffic Data</button>
            <button onClick={storeAccidentData}>Store Accident Data</button>
            <button onClick={fetchAccidentData}>Fetch Accident Data</button>
            <p>{message}</p>
            <h2>Stored Accident Data:</h2>
            <pre>
                {Array.isArray(storedAccidentData) && storedAccidentData.length > 0 ? 
                    storedAccidentData.map((data, index) => 
                        <div key={index}>{JSON.stringify(data, null, 2)}</div>) : 
                    "No accident data available."
                }
            </pre>
        </div>
    );
}*/

export default App;
