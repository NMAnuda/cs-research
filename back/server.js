const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const db_connection = require('./utils/db');
const dash_router = require('./routers/Pdashboard');

dotenv.config();

const app = express();


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3080;

db_connection().then(() => {
    console.log("MongoDB connection established");
    app.use('/', dash_router);

    app.listen(PORT, () => {
        console.log(`Backend server running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to start the server due to DB error:", err);
});
