export default function spazaRoutes(spazaSuggest) {
  async function showLogin(req, res, next) {
    try {
      res.render("index");
    } catch (err) {
      next(err);
    }
  }
  async function showRegister(req, res, next) {
    try {
      res.render("register");
    } catch (err) {
      next(err);
    }
  }
  async function showSuggest(req, res, next) {
    try {
      const clientId = req.session.user.id;

      res.render("suggest", {
        places: await spazaSuggest.areas(),
        suggestions: await spazaSuggest.suggestions(clientId),
      });
    } catch (err) {
      next(err);
    }
  }
  async function registerClient(req, res, next) {
    try {
      let username = req.body.clientname;
      if (!username) {
        req.flash("register", "Please enter your name");
        return res.redirect("/register");
      }
      let code = await spazaSuggest.registerClient(username);
      req.flash("register", `Successful,Login using the code : ${code} `);
      res.redirect("/register");
    } catch (err) {
      next(err);
    }
  }
  async function loginClient(req, res, next) {
    try {
      let code = req.body.clientCode;
      let results = await spazaSuggest.clientLogin(code);
      if (!results) {
        results = await spazaSuggest.spazaLogin(code);
        if (!results) {
          res.redirect("/");
        } else {
          req.session.spaza = results;
          res.redirect("/areaSuggestions");
        }
      } else {
        req.session.user = results;
        res.redirect("/suggest");
      }
    } catch (err) {
      next(err);
    }
  }
  async function suggest(req, res, next) {
    try {
      let name = req.body.places;
      let suggestion = req.body.productname;
      let clientId = req.session.user.id;
      let results = await spazaSuggest.findAreaByName(name);
      console.log(results);
      await spazaSuggest.suggestProduct(results.id, clientId, suggestion);
      res.redirect("/suggest");
    } catch (err) {
      next(err);
    }
  }
  async function showShopRegister(req, res, next) {
    try {
      res.render("spaza", {
        areas: await spazaSuggest.areas(),
      });
    } catch (err) {
      next(err);
    }
  }
  async function registerShop(req, res, next) {
    try {
      let name = req.body.shopname;
      let area = req.body.shoparea;
      if (!name || !area) {
        return res.redirect("/spazaRegister");
      } else {
        let results = await spazaSuggest.findAreaByName(area);
        let code = await spazaSuggest.registerSpaza(name, results.id);
        req.flash("registerShop", `Successful,Login using the code : ${code}`);
        res.redirect("/spazaRegister");
      }
    } catch (err) {
      next(err);
    }
  }
  async function showAreaSuggestions(req, res, next) {
    try {
      let areaId = req.session.spaza.area_id;
      let spazaId = req.session.spaza.id;
      res.render("areaSuggestions", {
        suggestions: await spazaSuggest.suggestionsForArea(areaId),
        accepted: await spazaSuggest.acceptedSuggestions(spazaId),
        area: req.session.spaza.shop_name,
      });
    } catch (err) {
      next(err);
    }
  }
  async function accept(req, res, next) {
    try {
      let suggestionId = req.params.id;
      let spazaId = req.session.spaza.id;
      await spazaSuggest.acceptSuggestion(suggestionId, spazaId);

      res.redirect("/areaSuggestions");
    } catch (err) {
      next(err);
    }
  }
  async function logout(req, res, next) {
    try {
      if (req.session.spaza) {
        delete req.session.spaza;
      } else if (req.session.user) {
        delete req.session.user;
      }
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
  return {
    showLogin,
    showRegister,
    showSuggest,
    registerClient,
    loginClient,
    suggest,
    showShopRegister,
    registerShop,
    showAreaSuggestions,
    accept,
    logout,
  };
}
