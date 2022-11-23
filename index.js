import express from "express";
import handlebars from "express-handlebars";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "express-flash";
import pgPromise from "pg-promise";
import SpazaSuggest from "./spaza-suggest.js";
import SpazaRoutes from "./routes/spaza-routes.js";

const pgp = pgPromise();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://coder:pg123@localhost:5432/spaza_suggest";

const config = {
  connectionString: DATABASE_URL,
};

if (process.env.NODE_ENV == "production") {
  config.ssl = {
    rejectUnauthorized: false,
  };
}

const db = pgp(config);

const app = express();

app.use(
  session({
    secret: "<add a secret string here>",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.static("public"));
//factory functions
const spazaSuggest = SpazaSuggest(db);
const spazaRoutes = SpazaRoutes(spazaSuggest);
app.get("/", spazaRoutes.showLogin);
app.get("/register", spazaRoutes.showRegister);
app.get("/suggest", spazaRoutes.showSuggest);
app.post("/clientRegister", spazaRoutes.registerClient);
app.post("/clientLogin", spazaRoutes.loginClient);
app.post("/suggest", spazaRoutes.suggest);
app.get("/spazaRegister", spazaRoutes.showShopRegister);
app.post("/spaza", spazaRoutes.registerShop);
app.get("/areaSuggestions", spazaRoutes.showAreaSuggestions);
app.get("/spaza/accept/:id", spazaRoutes.accept);
let port = process.env.PORT || 4002;

app.listen(port, function () {
  console.log("app started at port :", port);
});
