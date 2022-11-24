const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

const categories = require("./category.json");
const allProducts = require("./allProducts.json");


app.get('/categories', (req, res) => {
    res.send(categories);
});

app.get('/products', (req, res) => {
    res.send(allProducts);
});

// get product by brand 
app.get('/products/:brand', (req, res) => {
    const brand = req.params.brand;
    const brandProducts = allProducts.filter(pd => pd.brand === brand);
    res.send(brandProducts);
});








app.get('/', async (req, res) => {
    res.send('Reseliya web Server is running');
});

app.listen(port, () => {
    console.log(`Reseliya Web Server is running on PORT :${port}`)
});