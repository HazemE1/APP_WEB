const express = require("express");
const path = require("path");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alltpp-default-rtdb.europe-west1.firebasedatabase.app/"
});

var db = admin.database();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", {
        page_name: "Home",

    });
});

app.get("/lager", async(req, res) => {

    const dir = {};
    await db.ref("Ingredient").once("value", async ds => {
        for (child in ds.toJSON()) {
            var name = child;
            var currentAmount = ds.toJSON()[child]["currentAmount"];
            var recommendAmount = ds.toJSON()[child]["recommendedAmount"];
            dir[child] = {
                "name": name,
                "amount": currentAmount,
                "ramount": recommendAmount
            }
        }
    })

    res.render("lager", {
        page_name: "Lager",
        dir
    });
});

app.get("/order", async(req, res) => {
    const dir = {};
    await db.ref("orders").once("value", async ds => {
        for (child in ds.toJSON()) {
            for (n in ds.toJSON()[child]["orderItems"]) {
                var name = ds.toJSON()[child]["orderItems"][n]["ingredient"]["name"];
                var quan = ds.toJSON()[child]["orderItems"][n]["quantity"];
                var unit = ds.toJSON()[child]["orderItems"][n]["ingredient"]["unit"];

                dir[name] = {
                    "name": name,
                    "quantity": quan,
                    "unit": unit,
                    "supplier": child
                }
            }
        }
    })

    res.render("orders", {
        dir,
        page_name: "Order"

    });
});

app.get("/om", (req, res) => {
    res.render("omoss", {
        page_name: "Om Oss"
    })
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
});