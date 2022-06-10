const express = require('express')
const app = express()

const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const Nexmo = require('nexmo')

const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
}, {debug: true});


const userRouter = require('./routers/user')
const musicRouter = require('./routers/music')
const reportRouter = require('./routers/report')
// const socketRouter = require('./routers/socket')

mongoose
    .connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('mongo connected')
    })
    .catch(err => {
        console.log(err);
        console.log('connect fail')
    });

// mongoose
//     .connect('mongodb://localhost:27017/fs-app')
//     .then(()=>{
//         console.log('mongo connected...')
//     })
//     .catch(err=>{
//         console.log(err)
//     })

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//app.use(express.json());

app.use('/user',userRouter)
app.use('/music',musicRouter)
app.use('/report',reportRouter)
// app.use('/socket',socketRouter)



module.exports = app;