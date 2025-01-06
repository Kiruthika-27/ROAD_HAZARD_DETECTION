import express from "express";
import cors from "cors";
import { unixfs } from "@helia/unixfs";
import { FsBlockstore } from "blockstore-fs";
import { createHelia } from "helia";
import fs from "fs/promises";
import path from "path";

const app = express();
const port = 8080;

// Use a filesystem blockstore for persistence.
const blockstorePath = path.resolve("D:/Documents/Road/Road_Hazard_Detection/AccidentDetect"); 
const blockstore = new FsBlockstore(blockstorePath);

// File to store CIDs.
const cidFilePath = path.join(blockstorePath, "cids.json");

console.log("CID file path:", cidFilePath);

// Initialize Helia node with a persistent blockstore
const heliaPromise = createHelia({ blockstore });

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Helper: Save CID to file
const saveCIDToFile = async (cid, type) => {
  try {
    let cidList = {};
    try {
      const fileContent = await fs.readFile(cidFilePath, "utf-8");
      if (fileContent) {
        cidList = JSON.parse(fileContent);
      }
    } catch (err) {
      console.log("CID file does not exist. Creating a new one.");
    }
    cidList[type] = cidList[type] || [];
    cidList[type].push(cid);
    await fs.writeFile(cidFilePath, JSON.stringify(cidList, null, 2));
  } catch (error) {
    console.error("Error saving CID to file:", error);
  }
};

// Helper: Load CIDs from file
const loadCIDsFromFile = async (type) => {
  try {
    const fileContent = await fs.readFile(cidFilePath, "utf-8");
    if (!fileContent) {
      console.log("CID file is empty.");
      return [];
    }
    const cidList = JSON.parse(fileContent);
    return cidList[type] || [];
  } catch (err) {
    console.log("CID file does not exist. Creating a new one.");
    return [];
  }
};

// Test route to check server status
app.get("/test", (req, res) => {
  res.json({ message: "Server is running!" });
});

// POST route to store traffic content
app.post("/storeTraffic", async (req, res) => {
  console.log("Received traffic data:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const helia = await heliaPromise;
    const fsSystem = unixfs(helia);
    const jsonString = JSON.stringify(req.body);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    const cid = await fsSystem.addBytes(bytes);
    console.log("Stored Traffic CID:", cid.toString());
    await saveCIDToFile(cid.toString(), "traffic");
    res.json({ cid: cid.toString() });
  } catch (error) {
    console.error("Error storing traffic data:", error);
    res.status(500).json({ error: "Error storing data: " + error.message });
  }
});

// POST route to store accident content
app.post("/storeAccident", async (req, res) => {
  console.log("Received accident data:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const helia = await heliaPromise;
    const fsSystem = unixfs(helia);
    const jsonString = JSON.stringify(req.body);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(jsonString);
    const cid = await fsSystem.addBytes(bytes);
    console.log("Stored Accident CID:", cid.toString());
    await saveCIDToFile(cid.toString(), "accident");
    res.json({ cid: cid.toString() });
  } catch (error) {
    console.error("Error storing accident data:", error);
    res.status(500).json({ error: "Error storing data: " + error.message });
  }
});

// GET route to retrieve traffic data by CID
app.get("/retrieveTraffic/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return res.status(400).json({ error: "CID is required" });
  }

  try {
    const cids = await loadCIDsFromFile("traffic");

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
    console.log("Retrieved traffic content:", parsedContent);
    res.json(parsedContent);
  } catch (error) {
    console.error(`Error retrieving traffic data for CID "${cid}":`, error);
    res.status(500).json({ error: "Error retrieving data: " + error.message });
  }
});

// GET route to retrieve accident data by CID
app.get("/retrieveAccident/:cid", async (req, res) => {
  const { cid } = req.params;

  if (!cid) {
    return res.status(400).json({ error: "CID is required" });
  }

  try {
    const cids = await loadCIDsFromFile("accident");

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
    console.log("Retrieved accident content:", parsedContent);
    res.json(parsedContent);
  } catch (error) {
    console.error(`Error retrieving accident data for CID "${cid}":`, error);
    res.status(500).json({ error: "Error retrieving data: " + error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
