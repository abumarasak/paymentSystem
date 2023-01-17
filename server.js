if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const express = require("express");
const fs = require("fs");
const stripe = require("stripe")(stripeSecretKey);
const app = express();
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("./public"));
app.get("/store", (req, res) => {
  fs.readFile("./items.json", (err, data) => {
    if (err) {
      res.status(500).end();
    }
    res.render("store.ejs", {
      items: JSON.parse(data),
      stripeSecretKey: stripeSecretKey,
      stripePublicKey: stripePublicKey,
    });
  });
});

app.post("/purchase", (req, res) => {
  fs.readFile("./items.json", (err, data) => {
    if (err) {
      res.status(500).end();
    }
    const itemsJson = JSON.parse(data);
    const itemsArray = itemsJson.music.concat(itemsJson.merch);
    let total = 0;
    req.body.items.forEach((item) => {
      const itemJson = itemsArray.find((i) => {
        return i.id == item.id;
      });
      total = total + itemJson.price * item.quantity;
    });
    stripe.charges
      .create({
        amount: total,
        source: req.body.stripeTokenId,
        currency: "usd",
      })
      .then(() => {
        console.log("Charge Successful");
        res.json({ message: "Successfully purchased items" });
      })
      .catch(() => {
        console.log("Charge Fail");
        res.status(500).end();
      });
  });
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
