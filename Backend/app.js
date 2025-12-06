const express = require('express');
const app = express();

const rangerModel = require('./rangermodel')

app.get('/',(req,res)=>{
    res.send("hey")
});

app.get('/create',async (req,res)=>{
    res.send("create request sent");
});
app.get('/update',async (req,res)=>{
    res.send("update request sent");
});
app.get('/verify',async (req,res)=>{
    res.send("Verify request is sent");
});
app.listen(3000);