const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * @type {Array<{ id: string; username: string; name: string; todos: Array<{ id: string; title: string; done: boolean; deadline: string; created_at: string; }> }>} users
 */
let users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.headers.username;
  if (!username) {
    return response.status(404).json({
      error: "Username is missing",
    });
  }

  const haveUserWithThisUsername = users?.find(
    (item) => item?.username === username
  );

  if (!haveUserWithThisUsername) {
    return response.status(401).json({
      error: "Don't find any user with that username",
    });
  }

  next();
}

app.post("/users", (request, response) => {
  // Complete aqui
  const { name, username } = request.body;
  const haveUser = users?.find((user) => user?.username === username);

  if (haveUser) {
    return response.status(400).json({
      error: "User already created",
      user: haveUser,
    });
  }

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userData);

  return response.status(201).json(userData);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const username = request.headers.username;

  const user = users?.find((user) => user?.username === username);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const username = request.headers.username;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const userUpdated = users?.map((user) =>
    user?.username === username
      ? {
          ...user,
          todos: [...user.todos, newTodo],
        }
      : user
  );

  users = userUpdated;

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  // Complete aqui
  const username = request.headers.username;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const user = users?.find((user) => user?.username === username);
  const todoToUpdate = user?.todos?.find((todo) => todo?.id === id);

  if (!todoToUpdate) {
    return response.status(404).json({
      error: "Didn't find any todo with that id",
    });
  }

  const newTodo = {
    id: id,
    created_at: todoToUpdate.created_at,
    done: todoToUpdate.done,
    title,
    deadline: new Date(deadline),
  };

  const userUpdated = users?.map((user) =>
    user?.username === username
      ? {
          ...user,
          todos: user.todos?.map((todo) => (todo?.id === id ? newTodo : todo)),
        }
      : user
  );

  users = userUpdated;

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const username = request.headers.username;
  const { id } = request.params;

  const user = users?.find((user) => user?.username === username);
  const todoToUpdate = user?.todos?.find((todo) => todo?.id === id);

  if (!todoToUpdate) {
    return response.status(404).json({
      error: "Didn't find any todo with that id",
    });
  }

  const newTodo = {
    ...todoToUpdate,
    done: true,
  };

  const userUpdated = users?.map((user) =>
    user?.username === username
      ? {
          ...user,
          todos: [...user.todos, newTodo],
        }
      : user
  );

  users = userUpdated;

  return response.json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const username = request.headers.username;
  const { id } = request.params;

  const user = users?.find((user) => user?.username === username);
  const haveTodoWithThisId = user?.todos?.find((todo) => todo?.id === id);

  if (!haveTodoWithThisId) {
    return response.status(404).json({
      error: "No todo found to delete",
    });
  }

  console.log("a", username);
  console.log("id", id);

  const userUpdated = users?.map((item) =>
    item?.username === username
      ? {
          ...item,
          todos: item.todos?.filter((todo) => todo?.id !== id),
        }
      : item
  );

  console.log(JSON.stringify(userUpdated));

  users = userUpdated;

  return response.status(204).json({});
});

module.exports = app;
