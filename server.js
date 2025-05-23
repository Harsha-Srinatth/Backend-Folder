const mongoose = require('mongoose')
const express = require('express')
const dotEnv = require('dotenv')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes.js');
const fs = require('fs');
const path = require('path');   
const app = express();

const uploadDir = process.env.UPLOADS_PATH || path.join(__dirname,'/uploads');

app.use('/uploads', 
    express.static(uploadDir));
app.use(cors({
    origin:'https://react-first-p1.vercel.app',
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));
dotEnv.config();

if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive:true });
    console.log("UPload Folder Created.");
}

mongoose.connect(process.env.MONGO_URL,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=>{
    console.log("mongoDB connected successfully!")
})
.catch(()=>{
    console.log(" server connection error")
})

app.use('/', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server started and running at ${PORT}`)
})
