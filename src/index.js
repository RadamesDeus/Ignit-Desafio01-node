const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  let user = users.find((user) => user.username == username);
  if (user) {
    request.user = user;
    return next();
  } else {
    return response.status(404).send({ error: "D'not exist usernames" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  let userFind = users.find((user) => user.username === username);
  if (userFind) {
    return response.status(400).send({ error: "Exist usernames" });
  }

  let user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);
  response.status(200).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  let todos = [...request.user.todos];
  response.status(200).send(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { todos } = request.user;
  let todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };
  todos.push(todo);
  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  let todos = [...request.user.todos];
  let todoFind = todos.find((todo) => todo.id === id);

  if (!todoFind) {
    return response.status(404).send({ error: "D'not exist Todo" });
  }

  todoFind.title = title;
  todoFind.deadline = deadline;
  response.status(200).send(todoFind);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  let todos = [...request.user.todos];

  let todoFind = todos.find((todo) => todo.id === id);
  if (!todoFind) {
    return response.status(404).send({ error: "D'not exist Todo" });
  }

  todoFind.done = true;
  response.status(200).send(todoFind);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  let todos = [...request.user.todos];

  let todoFind = todos.find((todo) => todo.id === id);
  if (!todoFind) {
    return response.status(404).send({ error: "D'not exist Todo" });
  }

  let todoIndex = todos.findIndex((todo) => todo.id === id);
  todos.splice(todoIndex, 1);

  request.user.todos = todos;
  response.status(204).send();
});

module.exports = app;
