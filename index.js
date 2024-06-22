const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrehthd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const userDatabase = client.db("jobDB").collection("userInfo");
        const jobDatabase = client.db("jobDB").collection("allJob");
        const bidDatabase = client.db("jobDB").collection("allBid");

        app.post("/user", async (req, res) => {
            const info = req.body;
            const result = await userDatabase.insertOne(info);
            res.send(result);
        })
        app.get("/user/:id", async (req, res) => {
            const email = req.params.id;
            const query = { email: email };
            const result = await userDatabase.findOne(query);
            res.send(result);
        })

        app.post("/job", async (req, res) => {
            const data = req.body;
            const result = await jobDatabase.insertOne(data);
            res.send(result);
        })

        app.get("/job", async (req, res) => {
            const data = await jobDatabase.find().toArray();
            res.send(data);
        })

        app.get("/job/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await jobDatabase.findOne(filter);
            res.send(result);
        })

        app.get("/posted/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { uid: id };
            const result = await jobDatabase.find(filter).toArray();
            res.send(result);
        })
        app.delete("/job/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await jobDatabase.deleteOne(filter);
            res.send(result);
        })
        app.put("/job/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newData = {
                $set: {
                    jobTitle: data.jobTitle,
                    deadline: data.deadline,
                    description: data.description,
                    maxPrice: data.maxPrice,
                    minPrice: data.minPrice,
                    category: data.category
                }
            }
            const result = await jobDatabase.updateOne(filter, newData, options);
            res.send(result);
        })

        //bid end points------------------
        app.post("/bid", async (req, res) => {
            const data = req.body;
            const result = await bidDatabase.insertOne(data);
            res.send(result);
        })
        app.get("/bid", async (req, res) => {
            const query = req.query.uid;
            const filter = { uid: query };
            const data = bidDatabase.find(filter);
            const result = await data.toArray();
            res.send(result);
        })
        app.get("/request", async (req, res) => {
            const query = req.query.buyerEmail;
            const filter = { buyerEmail: query };
            const data = bidDatabase.find(filter);
            const result = await data.toArray();
            res.send(result);
        })
        app.put("/bid/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const newStatus = {
                $set: {
                    status: data.status
                }
            }
            const result = await bidDatabase.updateOne(filter, newStatus, options);
            res.send(result);
        })
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`the app is running on port ${port}`);
})