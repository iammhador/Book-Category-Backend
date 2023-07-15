require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

//# Middleware:
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();
    const productsCollection = client.db("BestReaders").collection("books");

    app.get("/all-books", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    app.get("/recent-books", async (req, res) => {
      const result = await productsCollection
        .find({})
        .sort({ timestamp: "descending" })
        .limit(10)
        .toArray();
      res.send(result);
    });

    app.post("/add-book", async (req, res) => {
      const currentTime = new Date();
      req.body.timestamp = currentTime.toISOString();
      const result = await productsCollection.insertOne(req.body);
      res.send(result);
    });
  } finally {
    await client.close();
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
