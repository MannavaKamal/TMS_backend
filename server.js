const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const cors = require('cors');
const parser = require('body-parser');
const mongoose = require('mongoose');
const app1 = express();
app1.use(express.json({ limit: "50mb" })); 
app1.use(express.urlencoded({ limit: "50mb", extended: true }));
app1.use(parser.json());
app1.use(express.json());
app1.use(cors())


// database
mongoose.connect('mongodb+srv://2200032973:jJ4ixc5JEMXC8Dhi@cluster0.s8i0c8m.mongodb.net/TMS',{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));
const userSchema = new mongoose.Schema({   
    name: String,
    email: String,
    password:String,
   image: String,
    Tasks: Array,  
});
const User = mongoose.model('user', userSchema);
app1.use(session({
  resave:true,
  saveUninitialized:true,
  secret:"for my project",
}))

app1.post('/userSignup',async(req,res)=>{   // usersignup 
   User.insertMany(req.body)
   return res.json({"code":1})

 })

 
 app1.post('/userLogin',async(req,res)=>{  // userLogin

  const ret = await User.findOne({email:req.body.email}) 
if(ret !== null && ret.password === req.body.password){  
  return res.json({"code":1,
    "cre":ret
  })
}
else{
  return res.json({"code":0})
}
})

app1.post("/tasks",async(req,res)=>{ // add task to an user
  const {id,task} = req.body
  let user =  await User.findById(id)
  user.Tasks.push(task)
  await user.save();
  return res.json({"code":1})
 })

app1.get("/tasks",async(req,res)=>{   // to retrive all tasks of an user
  const {id} = req.query
  let ret =  await User.findById(id)  
  return res.json(ret.Tasks)
 })

 app1.delete("/tasks/:id/:index", async (req, res) => {  // delete task of an user based on index
  const {id,index} = req.params
  console.log(id)
  console.log(index)  
  let user =  await User.findById(id)  
  user.Tasks.splice(parseInt(index, 10), 1);
  await user.save()
  return res.json({"code":1})
 })

 app1.put("/tasks/:id/:index", async (req, res) => {  // update task of an user based on index
  const { id, index } = req.params;
  const updatedTask = req.body;
  const user = await User.findById(id);
  user.Tasks[index] = { ...user.Tasks[index], ...updatedTask.task };
   user.markModified("Tasks"); // Mark 'Tasks' array as modified
   await user.save();
  return res.json({"code":1})
 })

app1.patch("/tasks/:id/:index/complete", async (req, res) => { // to mark task has to be completed
  
    const { id, index } = req.params
    console.log(id,index)
    const user = await User.findById(id)
    user.Tasks[index].completed = !user.Tasks[index].completed
    user.markModified("Tasks");    // Mark 'Tasks' as modified so Mongoose knows it has changed
    await user.save()
    return res.json({"code":1})
  })
  
app1.listen(5000,()=> console.log("route server at 5000"))

