import express from "express";
import cors from "cors";
import { unixfs } from "@helia/unixfs";
import { FsBlockstore } from "blockstore-fs";
import { createHelia } from "helia";
import fs from "fs/promises";
import path from "path";

const app = express();
const port = 8080;

// Use a filesystem blockstore for persistence
const blockstore = new FsBlockstore("D:/Documents/Road/Road_Hazard_Detection/road_blockstore");

// File to store CIDs
const cidFilePath = path.resolve("D:/Documents/Road/Road_Hazard_Detection/road_blockstore", "cids.json");

// Log the CID file path
console.log("CID file path:", cidFilePath);

// Initialize Helia node with a persistent blockstore
const heliaPromise = createHelia({ blockstore });

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Helper: Save CID to file
const saveCIDToFile = async (cid) => {
  try {
    let cidList = [];
    try {
      const fileContent = await fs.readFile(cidFilePath, "utf-8");
      if (fileContent) {
        cidList = JSON.parse(fileContent);
      }
    } catch (err) {
      console.log("CID file does not exist. Creating a new one.");
    }
    cidList.push(cid);
    await fs.writeFile(cidFilePath, JSON.stringify(cidList, null, 2));
  } catch (error) {
    console.error("Error saving CID to file:", error);
  }
};

// Helper: Load CIDs from file
const loadCIDsFromFile = async () => {
  try {
    const fileContent = await fs.readFile(cidFilePath, "utf-8");
    if (!fileContent) {
      console.log("CID file is empty.");
      return [];
    }
    return JSON.parse(fileContent);
  } catch (err) {
    console.log("CID file does not exist. Creating a new one.");
    return [];
  }
};

// Test route to check server status
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// POST route to store content
app.post("/store", async (req, res) => {
  console.log("Received data:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    console.error("No content provided");
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    const helia = await heliaPromise;
    const fsSystem = unixfs(helia);
    
    const jsonString = JSON.stringify(req.body);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);

    const cid = await fsSystem.addBytes(bytes);
    console.log("Stored CID:", cid.toString());
    await saveCIDToFile(cid.toString());

    res.json({ cid: cid.toString() });
    
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).json({ error: "Error storing data: " + error.message });
  }
});

// GET route to retrieve by CID
app.get("/retrieve/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return res.status(400).json({ error: "CID is required" });
  }

  try {
    const cids = await loadCIDsFromFile();

    if (!cids.includes(cid)) {
      return res.status(404).json({ error: "CID not found in the file." });
    }

    const helia = await heliaPromise;
    const fsSystem = unixfs(helia);

    const decoder = new TextDecoder();
    let text = "";

    for await (const chunk of fsSystem.cat(cid)) {
      text += decoder.decode(chunk, { stream: true });
    }

    if (!text) {
      return res.status(404).json({ error: "Content not found for the given CID." });
    }

    const parsedContent = JSON.parse(text);
    console.log("Retrieved content:", parsedContent);

    res.json(parsedContent);

  } catch (error) {
    console.error(`Error retrieving data for CID "${cid}":`, error);
    res.status(500).json({ error: "Error retrieving data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
