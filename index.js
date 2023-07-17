require("dotenv").config();
const express = require("express");
const port = 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

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
    const wishlistCollection = client.db("BestReaders").collection("wishlist");
    const readingCollection = client.db("BestReaders").collection("reading");
    const finishedCollection = client.db("BestReaders").collection("finished");

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

    //@ Create wishlist :
    app.patch("/wishlist", async (req, res) => {
      try {
        const data = req.body;
        const { email, id } = data;

        const checkEmail = await wishlistCollection.findOne({
          email,
        });

        const checkId = await wishlistCollection.findOne({
          id,
        });

        if (checkEmail && checkId) {
          const wishlistBookData = {
            email,
            id,
            wishlist: true,
          };

          const updateResult = await wishlistCollection.updateOne(
            { id },
            { $set: wishlistBookData }
          );

          res.status(200).json(updateResult);
        } else {
          const insertResult = await wishlistCollection.insertOne(data);
          res.status(200).json(insertResult);
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //@ Create reading :
    app.patch("/reading", async (req, res) => {
      try {
        const data = req.body;
        const { email, id } = data;

        const checkEmail = await readingCollection.findOne({
          email,
        });

        const checkId = await readingCollection.findOne({
          id,
        });

        if (checkEmail && checkId) {
          const readingBookData = {
            email,
            id,
            reading: true,
          };

          const updateResult = await readingCollection.updateOne(
            { id },
            { $set: readingBookData }
          );

          res.status(200).json(updateResult);
        } else {
          const insertResult = await readingCollection.insertOne(data);
          res.status(200).json(insertResult);
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //@ Create finished :
    app.patch("/finished", async (req, res) => {
      try {
        const data = req.body;
        const { email, id } = data;

        const checkEmail = await finishedCollection.findOne({
          email,
        });

        const checkId = await finishedCollection.findOne({
          id,
        });

        if (checkEmail && checkId) {
          const finishedBookData = {
            email,
            id,
            finished: true,
          };

          const updateResult = await finishedCollection.updateOne(
            { id },
            { $set: finishedBookData }
          );

          res.status(200).json(updateResult);
        } else {
          const insertResult = await finishedCollection.insertOne(data);
          res.status(200).json(insertResult);
        }
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    //@ Update matched with email book:
    app.patch("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body.data;

      const data = {
        title: body.title,
        author: body.author,
        genre: body.genre,
        publicationYear: body.publicationYear,
      };
      try {
        const book = await booksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: data }
        );

        if (book) {
          res.status(200).json(book);
        } else {
          res.status(404).json({ message: "Can't update books" });
        }
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    //@ Delete matched with email book:
    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const book = await booksCollection.deleteOne({ _id: new ObjectId(id) });
      if (book.deletedCount > 0) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Can't delete book" });
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
