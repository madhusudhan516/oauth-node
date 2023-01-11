const express = require("express");
const axios = require("axios");

require("dotenv").config();

const app = express();
const port = process.env.port || 5000;

const github_client_id = process.env.github_client_id;
const github_client_secret = process.env.github_client_secret;
console.log({ github_client_id, github_client_secret });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send(`<h1>Welcome Mr.Madhu sudhan</h1>`);
});

app.get("/login/github", (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${github_client_id}&redirect_uri=http://localhost:5000/login/github/callback`;
  res.redirect(url);
});

async function getAccessToken(code) {
  const url = `https://github.com/login/oauth/access_token`;
  try {
    const res = await axios.post(
      url,
      {
        client_id: github_client_id,
        client_secret: github_client_secret,
        code,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log("ERROR", err);
  }
}

async function getUserInfo(access_token) {
  const url = `https://api.github.com/user`;
  try {
    const user = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return user.data;
  } catch (err) {
    console.log("ERROR", err);
  }
}

app.get("/login/github/callback", async (req, res) => {
  const exchange_code = req.query.code;
  const return_response = await getAccessToken(exchange_code);

  const params = new URLSearchParams(return_response);
  const user_data = await getUserInfo(params.get("access_token"));
  res.send(user_data);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
