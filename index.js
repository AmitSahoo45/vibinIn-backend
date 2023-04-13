const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { PostsRouter, UserRouter, ConnectionRouter } = require('./routes')

const auth = require('./middleware/auth')

const app = express();

app.use(bodyParser.json({
    limit: '30mb',
    extended: true
}));

app.use(bodyParser.urlencoded({
    limit: '30mb',
    extended: true
}));

app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to VibIn API')
})
app.use('/users', UserRouter)
app.use('/posts', PostsRouter)
app.use('/connection', auth, ConnectionRouter)


const CONNECTION_URL = process.env.MONGO_URI
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    })


