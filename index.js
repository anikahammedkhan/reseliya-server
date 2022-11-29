const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET);


app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dasuc0o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const categories = client.db("reseliya").collection("categories");
        const allProducts = client.db("reseliya").collection("allProducts");
        const usersCollection = client.db("reseliya").collection("users");
        const bookingCollection = client.db("reseliya").collection("bookings");
        const paymentsCollection = client.db("reseliya").collection("payments");

        // load all category data
        app.get('/categories', (req, res) => {
            categories.find()
                .toArray((err, items) => {
                    res.send(items);
                })
        })

        // all Products data and status available
        app.get('/products', (req, res) => {
            allProducts.find({ status: 'available' })
                .toArray((err, items) => {
                    res.send(items);
                })
        });

        // get prodduct by brand and status available
        app.get('/products/:brand', (req, res) => {
            allProducts.find({ brand: req.params.brand, status: 'available' })
                .toArray((err, items) => {
                    res.send(items);
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
        // update product by _id from body data
        app.patch('/product/:id', (req, res) => {
            const id = req.params.id;
            const product = req.body;
            allProducts.updateOne({ _id: ObjectId(id) }, {
                $set: { ...product }
            })
                .then(result => {
                    res.send(result.modifiedCount > 0);
                })
        });

        // get all product by seller_email
        app.get('/products/seller/:email', (req, res) => {
            const email = req.params.email;
            allProducts.find({ seller_email: email })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });


        // add product at allProducts collection 
        app.post('/addProduct', (req, res) => {
            const product = req.body;
            allProducts.insertOne(product)
                .then(result => {
                    res.send(result);
                })
        });

        // post bookings data
        app.post('/bookings', (req, res) => {
            const newBooking = req.body;
            bookingCollection.insertOne(newBooking)
                .then(result => {
                    res.send(result);
                })
        });



        // save users data and replace if already exist
        app.put('/users', async (req, res) => {
            const user = req.body;
            const email = user.email;
            const result = await usersCollection.replaceOne({ email: email }, user, { upsert: true });
            res.send(result);
        });

        // get all user  
        app.get('/users', (req, res) => {
            usersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

        // get user by role from users collection 
        app.get('/users/:role', (req, res) => {
            const role = req.params.role;
            usersCollection.find({ role })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });

        // get order by email 
        app.get('/orders/:email', (req, res) => {
            const email = req.params.email;
            bookingCollection.find({
                buyerEmail
                    : email
            })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });
        // get single order by _id 
        app.get('/order/:id', (req, res) => {
            const id = req.params.id;
            bookingCollection.find({ _id: ObjectId(id) })
                .toArray((err, documents) => {
                    res.send(documents[0]);
                })
        });

        // delete order by _id
        app.delete('/orders/:id', (req, res) => {
            const id = req.params.id;
            console.log(id);
            bookingCollection.deleteOne({ _id: ObjectId(id) })
                .then(result => {
                    console.log(result);
                    res.send(result);
                })
        });
        // get odrer by seller email 
        app.get('/mybuyer/:email', (req, res) => {
            const email = req.params.email;
            bookingCollection.find({
                sellerEmail: email
            })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        });


        // payment gateway
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.productPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'usd',
                "payment_method_types": ["card"],
            });
            res.json({
                clientSecret: paymentIntent.client_secret,
            });
        });

        // save payment data
        app.post('/payments', (req, res) => {
            const payment = req.body;
            console.log(payment);
            paymentsCollection.insertOne(payment)
                .then(result => {
                    const id = payment._id;
                    const filter = { _id: ObjectId(id) };
                    const update = { $set: { payment: true, transactionId: payment.transactionId } };
                    const updateResult = bookingCollection.updateOne(filter, update);
                    res.send(result);
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