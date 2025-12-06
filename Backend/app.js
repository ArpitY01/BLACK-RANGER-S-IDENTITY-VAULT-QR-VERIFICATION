const express = require('express');
const app = express();

const rangerModel = require('./rangermodel')
app.use(express.urlencoded());

app.get('/',(req,res)=>{
    let a = [
        {
            name:"a"
        },
        {
            name:"b"

        },
        {
            name:"c"

        }
    ]
    res.send(a)
});

app.get('/create',async (req,res)=>{
    const a = await fetch('/',{method:"GET"});
    res.send("huhu "+ a);
});
app.get('/update',async (req,res)=>{
    res.send("update request sent");
});
app.get('/verify',async (req,res)=>{
    res.send("Verify request is sent");
});
app.listen(3000);