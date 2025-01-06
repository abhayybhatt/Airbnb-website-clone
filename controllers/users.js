const User = require('../models/user');

module.exports.renderSignUpForm = (req,res)=>{
    res.render('users/signup.ejs');
};

module.exports.signUp = async(req,res)=>{
    try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser); //ab user save ho chuka hai database mein, we can use passport's login() method now.
    // Login after SignUp: Passport's login method automatically establishes a login session. We can invoke login to automatically login a user. 
    req.login(registeredUser, (err) =>{
        if(err){
            return next(err);
        }
        req.flash('success', 'Registration successful, Welcome to Wanderlust!');
        res.redirect('/listings');
    });//agr kisi user ne signUp kr liya hai to automatically wo login bhi ho jayega usi session mein iski help se. 
    // passport.authenticate() method automatically invokes req.login() method. When users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
    } catch(e){
        req.flash('error', e.message);
        res.redirect('/signup'); //jab wrapAsync use kr liya tha, to try-catch kyu diya? -> isliye kyuki agr koi bhi error aa rhi thi to bas ek error page show ho rha tha aur fir wapi url daalna padta user ko, isliye ab ise use krne se agr error aayi to wo flash message ke form mein show hogi, aur wapis signup page mein ham redirect ho jayenge to try again.
    }
};

module.exports.renderLoginForm = (req,res)=>{
    res.render('users/login.ejs');
};

module.exports.login = async (req,res)=>{ //passport.authenticate() ek middleware hai jo check krega ki jo user credentials enter kiye gaye hai login form mein wo actual mein database mien exist krte bhi hai ya nhi. Parameters mein local hai indicating that we are using LocalStrategy here aur ek option hai failureRedirect krke jo ki isliye use kiya hai ki agr incorrect credentials ya password enter krta hai jo ki database mein exist nhi krte to usko wapis /login page mein apan redirect kr rhe hai, aur failureFlash ko true krne se agr koi bhi error aati hai during login, to us error ko wo apne login page mein flash kr dega.
    req.flash('success', 'Welcome back to Wanderlust!'); // yeh async function ki line tabhi chalegi jab saare apne passport middleware ke checks pass ho jayenge.
    // res.redirect(req.session.redirectUrl); //pr passport login method mein jaise hi login ho jaata hai to wo us session object ko delete kr deta hai, isliye isko value yha undefined ho jayegi, aise mein we can create its local variable so that it remains accessible.
    // res.redirect(res.locals.redirectUrl);//pr ab ek aur problem hai! agr direct ham sirf logIn krte hai, to aise mein yeh url empty hoga aur ham /listings yaani homepage pr nhi redirect ho payenge. Isliye we'll take this approach:
    let redirectUrl = res.locals.redirectUrl || '/listings';//yaani agr res.locals.redirectUrl empty nhi hai, to uski value aayengi, nhi to '/listings' value jayegi hamare redirectUrl mein aur isi ko apan ab res.redirect mein bhej denge.
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next)=>{
    req.logout((err)=>{ //passport ka hi method hai .logout(), ye hamesha kuch na kuch parameter mein leta hai, jaise yha ek err ka paramter de diya jo ki logout error ko check krega(if any exists). 
        if(err){
            return next(err);
        }
        req.flash('success', 'You are logged out!');
        res.redirect('/listings');
    });
};