require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const booksCollection = client.db("BestReaders").collection("books");
    const commentsCollection = client.db("BestReaders").collection("comments");

    //@ Find all books:
    app.get("/all-books", async (req, res) => {
      const book = await booksCollection.find({}).toArray();
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    });

    //@ Find all books:
    app.get("/comments/:id", async (req, res) => {
      const id = req.params.id;
      const book = await commentsCollection.find({ id: id }).toArray();
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    });

    //@ Find matched email books:
    app.get("/matched-books/:email", async (req, res) => {
      const email = req.params.email;
      const book = await booksCollection.find({ email }).toArray();
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Can't find any books" });
      }
    });

    //@ Find recent added books:
    app.get("/recent-books", async (req, res) => {
      const book = await booksCollection
        .find({})
        .sort({ timestamp: "descending" })
        .limit(10)
        .toArray();
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    });

    //@ Find matched with id book:
    app.get("/singleBook/:id", async (req, res) => {
      const id = req.params.id;
      const book = await booksCollection.findOne({
        _id: new ObjectId(id),
      });
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    });

    //@ Create new book:
    app.post("/add-book", async (req, res) => {
      const currentTime = new Date();
      req.body.timestamp = currentTime.toISOString();
      const book = await booksCollection.insertOne(req.body);
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Can't created new books" });
      }
    });

    //@ Create new comment:
    app.post("/create-comment", async (req, res) => {
      const currentTime = new Date();
      req.body.timestamp = currentTime.toISOString();
      const comment = await commentsCollection.insertOne(req.body);
      if (comment) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({ message: "Can't post a comment" });
      }
    });

    //@ Update matched with email book:
    app.patch("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;

      try {
        const book = await booksCollection.updateOne({ id }, { $set: body });

        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ message: "Can't update books" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    //@ Update matched with email book:
    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.query.id;
      const book = await booksCollection.deleteOne({
        id,
      });
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Can't delete books" });
      }
    });
  } finally {
    await client.close();
  }
}
run().catch((error) => console.error(error));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
