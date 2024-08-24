import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not set
const app: Express = express();
const secretKey="Se3c4r5e6t7k8e9y";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const auth=(req:Request,res:Response,next:NextFunction)=>{
  const jwtKey=req.headers.authorization;
  if(jwtKey){
   const token=jwtKey.split(' ')[1];
   jwt.verify(token,secretKey,(err,user)=>{
    if(err){
      return res.sendStatus(403);
    }
    req.user=user;
    next();
   })
  }
  else{
    return res.sendStatus(403);
  }
}

type TODO={
  id:number;
  todo:string;

}

type USER = {
  username: string;
  password: string;
  confirmPassword: string;
  todos:TODO[];
};

let users: USER[] = [];

app.use(express.json());
// Route for signup
app.post("/signup", (req: Request, res: Response) => {
  const { username, password, confirmPassword } = req.body as {
    username: string;
    password: string;
    confirmPassword: string;
  };
  let user_find = users.find((u: USER) => u.username === username);
  if (user_find) {
    res.send("User already exists");
  } else {
    if (password === confirmPassword) {
      users.push({username,password,confirmPassword,todos:[]});
      res.send("User created successfully");
    }
  }
});

/* The `app.post("/login", ...)` route in the provided TypeScript code is handling the user login
functionality. Here is a breakdown of what the code is doing: */
app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };
  const user_find = users.find((u: USER) => u.username === username);

  if (user_find) {
    if (user_find.password === password) {
      jwt.sign({username},secretKey,{expiresIn:'1h'});
      res.send("User succesfully logged In");
    } else {
      res.send("Wrong credentials");
    }
  } else {
    res.send("User not found");
  }
});

app.get("/users", (req: Request, res: Response) => {
  res.send(users);
});

/* The `app.post('/create/:user', auth, (req: Request, res: Response) => { ... }` route in the provided
TypeScript code is responsible for creating a new todo item for a specific user. Here is a breakdown
of what the code is doing: */
app.post('/create/:user',auth,(req:Request,res:Response)=>{
  const {todo}=req.body as {
    todo:string;
  }
  const user_find=users.find((u:USER)=>u.username===req.params.user);
  if(user_find){
    let _id=Math.floor(Math.random() * 10000) + 1;
    user_find.todos.push({id: _id,todo});
    res.send("Todo uploaded successfully");
  }
  else{
    res.send("User not found");
  }
})

/* The `app.post('/:todoId', auth, (req: Request, res: Response) => { ... }` route in the provided
TypeScript code is handling the deletion of a specific todo item based on the `todoId` parameter
passed in the URL. Here is a breakdown of what the code is doing: */
app.post('/:todoId',auth,(req:Request,res:Response)=>{
  const todoID=parseInt(req.params.todoId);
const user_find=users.find((u:USER)=>u.todos.some(todo=>todo.id===todoID));
if(user_find){
  const todo_index=user_find.todos.findIndex(todo=>todo.id===todoID);
  if(todo_index!==-1){
    user_find.todos.splice(todo_index,1);
    res.send("To do deleted successfully");
  }
  else{
    res.send("To do not found")
  }
}
else{
 
  res.send("User not found");
}
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
