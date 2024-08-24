"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Load environment variables from .env file
dotenv_1.default.config();
const PORT = process.env.PORT || 3000; // Default to port 3000 if PORT is not set
const app = (0, express_1.default)();
const secretKey = "Se3c4r5e6t7k8e9y";
const auth = (req, res, next) => {
    const jwtKey = req.headers.authorization;
    if (jwtKey) {
        const token = jwtKey.split(' ')[1];
        jsonwebtoken_1.default.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    }
    else {
        return res.sendStatus(403);
    }
};
let users = [];
app.use(express_1.default.json());
// Route for signup
app.post("/signup", (req, res) => {
    const { username, password, confirmPassword } = req.body;
    let user_find = users.find((u) => u.username === username);
    if (user_find) {
        res.send("User already exists");
    }
    else {
        if (password === confirmPassword) {
            users.push({ username, password, confirmPassword, todos: [] });
            res.send("User created successfully");
        }
    }
});
/* The `app.post("/login", ...)` route in the provided TypeScript code is handling the user login
functionality. Here is a breakdown of what the code is doing: */
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user_find = users.find((u) => u.username === username);
    if (user_find) {
        if (user_find.password === password) {
            jsonwebtoken_1.default.sign({ username }, secretKey, { expiresIn: '1h' });
            res.send("User succesfully logged In");
        }
        else {
            res.send("Wrong credentials");
        }
    }
    else {
        res.send("User not found");
    }
});
app.get("/users", (req, res) => {
    res.send(users);
});
/* The `app.post('/create/:user', auth, (req: Request, res: Response) => { ... }` route in the provided
TypeScript code is responsible for creating a new todo item for a specific user. Here is a breakdown
of what the code is doing: */
app.post('/create/:user', auth, (req, res) => {
    const { todo } = req.body;
    const user_find = users.find((u) => u.username === req.params.user);
    if (user_find) {
        let _id = Math.floor(Math.random() * 10000) + 1;
        user_find.todos.push({ id: _id, todo });
        res.send("Todo uploaded successfully");
    }
    else {
        res.send("User not found");
    }
});
/* The `app.post('/:todoId', auth, (req: Request, res: Response) => { ... }` route in the provided
TypeScript code is handling the deletion of a specific todo item based on the `todoId` parameter
passed in the URL. Here is a breakdown of what the code is doing: */
app.post('/:todoId', auth, (req, res) => {
    const todoID = parseInt(req.params.todoId);
    const user_find = users.find((u) => u.todos.some(todo => todo.id === todoID));
    if (user_find) {
        const todo_index = user_find.todos.findIndex(todo => todo.id === todoID);
        if (todo_index !== -1) {
            user_find.todos.splice(todo_index, 1);
            res.send("To do deleted successfully");
        }
        else {
            res.send("To do not found");
        }
    }
    else {
        res.send("User not found");
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
