const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

let user = {
  username: "admin",
  password: "hashtoken",
  id: "dummyid",
  email: "admin@gmail.com",
};

const jwtSecret = "secret";

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/forgot-password", (req, res, next) => {
  res.render("forgot-password");
});

app.post("/forgot-password", (req, res, next) => {
  const { email } = req.body;
  if (email !== user.email) {
    res.send("Email is incorrect");
    return;
  }

  const secret = jwtSecret + user.password;
  const payload = {
    email: user.email,
    id: user.id,
  };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  const link = `http://localhost:3000/reset-password/${user.id}/${token}`;
  res.render("forgot-password-confirmation", { token });
  res.send(email);
});

app.get("/reset-password/:id/:token", (req, res, next) => {
  const { id, token } = req.params;

  if (id !== user.id) {
    res.send("Invalid token");
    return;
  }

  const secret = jwtSecret + user.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { email: user.email });
  } catch (err) {
    res.send("Invalid token");
  }
});

app.post("/reset-password", (req, res, next) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  if (id !== user.id) {
    res.send("Invalid token");
    return;
  }
  const secret = jwtSecret + user.password;
  try {
    const payload = jwt.verify(token, secret);
    user.password = password;

    res.send(user);
  } catch (err) {
    res.send("Invalid token");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
