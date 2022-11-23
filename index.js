const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;



app.use(express.json());
app.use(cors());



app.get('/', async (req, res) => {
    res.send('Reseliya web Server is running');
});

app.listen(port, () => {
    console.log(`Reseliya Web Server is running on PORT :${port}`)
});