const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dasuc0o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const categories = client.db("reseliya").collection("categories");
        const allProducts = client.db("reseliya").collection("allProducts");
        const usersCollection = client.db("reseliya").collection("users");

        // load category data
        app.get('/categories', (req, res) => {
            categories.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        })

        // all Products 
        app.get('/products', (req, res) => {
            allProducts.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

        // get product by brand 
        app.get('/products/:brand', (req, res) => {
            const brand = req.params.brand;
            allProducts.find({ brand: brand })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });
        // get single product by _id 
        app.get('/product/:id', (req, res) => {
            const id = req.params.id;
            allProducts.find({ _id: ObjectId(id) })
                .toArray((err, documents) => {
                    res.send(documents[0]);
                })
        });

        // save users data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // get all user  
        app.get('/users', (req, res) => {
            usersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

    }
    catch (err) {
        console.log(err);
    }
    finally {

    }
}

run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Reseliya web Server is running');
});

app.listen(port, () => {
    console.log(`Reseliya Web Server is running on PORT :${port}`)
});