

export default function spazaRoutes(spazaSuggest){
    async function showLogin(req,res,next){
        try{
           res.render('index')
        }catch(err){
            next(err)
        }
    }
    async function showRegister(req,res,next){
        try{
          res.render('register')
        }catch(err){
            next(err)
        }
    }
    async function showSuggest(req,res,next){
        try{
           const clientId = req.session.user.id
           
        res.render('suggest',{
            places: await spazaSuggest.areas(),
            suggestions: await spazaSuggest.suggestions(clientId)
        })
        }catch(err){
            next(err)
        }
    }
    async function registerClient(req,res,next){
        try{
          let username = req.body.clientname;
          if(!username){
            req.flash('register','Please enter your name')
            return res.redirect('/register');
          }
         let code = await spazaSuggest.registerClient(username);
          req.flash('register',`Successful,Login using the code : ${code} `)
          res.redirect('/register')
        }catch(err){
            next(err)
        }
    }
    async function loginClient(req,res,next){
        try{
          let code = req.body.clientCode
          let results = await spazaSuggest.clientLogin(code)
          if(!results){
            res.redirect('/')
          }else{
            req.session.user = results
            res.redirect('/suggest')
          }
        }catch(err){
            next(err)
        }
    }
    async function suggest(req,res,next){
        try{
          let name = req.body.places;
          let suggestion = req.body.productname;
          let clientId = req.session.user.id;
          let results = await spazaSuggest.findAreaByName(name);
              console.log(results) 
              await spazaSuggest.suggestProduct(results.id, clientId, suggestion);
              res.redirect('/suggest')

        }catch(err){
            next(err)
        }
    }
    return {
        showLogin,
        showRegister,
        showSuggest,
        registerClient,
        loginClient,
        suggest
    }
}