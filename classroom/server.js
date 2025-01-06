const express = require('express');
const app = express();
const users = require('./routes/user.js');
const posts = require('./routes/post.js');
// const cookieParser = require('cookie-parser');
const session = require('express-session'); //ye session ek middleware hai.
const flash = require('connect-flash');
const path = require('path');

app.set ('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

const sessionOptions = {secret: 'secretString', resave: false, saveUninitialized: true};
app.use(session(sessionOptions)); //although not a good idea to write a general string as a key, instead one should use complex strings like environment variables and should regularly update their secret to ensure security. Pr samajhne  mein aasaan hai abhi ye isliye use kiya hai.
app.use(flash());
app.use((req,res,next)=>{ //aisa kuch kaam ho jo baar baar repeat krna hota hai har request ke liye to we can use middlewares.
    res.locals.successMsg = req.flash('success'); //to apne page.ejs mein successMsg naam se iske message ko access kr sakte hai.
    res.locals.errorMsg = req.flash('error'); 
    next();
});

app.get('/register', (req,res)=>{
    let {name = 'anonymous'} = req.query;//query string se name extract kr lenge. default name: anonymous.
    // console.log(req.session); 
    req.session.name = name; //req.session mein name jaisi koi field nhi hoti hai pr apan create kr sakte hai in this manner. Maze ki baat ye hai ki isi same value ko apan dusri request mein bhi use kr sakte hai! jo ki apan ne /hello wali get request mein use kra hai.
    // res.send(name);
    // console.log(req.session.name);
    if(name === 'anonymous'){
        req.flash('error', 'user not registered.');
    } else{
        req.flash('success', 'user registered successfully!'); // 2 parameters rehte hai req.flash mein -> key(ek aisi string jiski help se apne message ko identify kiya jaa sake) and actual flash message. Ab message ko actual mein apne browser pr render krane ke liye we use views -> app.set ('view engine', 'ejs'); & app.set('views', path.join(__dirname,'views')); Aur isko ejs ke render ke through bhej denge using its 'key'.
    }
    res.redirect('/hello');
});
app.get('/hello', (req,res)=>{
    // res.send(`hello, ${req.session.name}!`); //kyuki alag alag routes hai, lekin single session hai.
    // console.log(req.flash('success'));
    // res.locals: Use this property to set variables accessible in templates rendered with res.render. The variables set on res.locals are available within a single request-response cycle, and will not be shared between requests. yaani res.render se jo templates ko apan render karate hai unke andar agr kuch variables ko apan ko use krna hai to use apan res.locals ke andar save kr sakte hai.

    res.render('page.ejs', {name: req.session.name,}); //to req.flash ko bhi dusre route mein se access kr liya hai! Interesting part: page refresh krne ke baad ye flash message gayab ho jayega.
    // flash messages: helpful for authentication. To check whether user is logged in and has registered or not in oour website.
});

// app.get('/test',(req,res)=>{ 
//     res.send('test successful.');
// });

// app.get('/reqcount', (req,res)=>{ //ab aisi har ek request ke saath koi connect.sid krke koisi session id assign ho jayegi. Agr same browser mein different tabs mein same link ko access krenge to same session id assign hoti hai pr dusre web browser se dekhte hai to alag session id assign ho jaati hai.
//     if(req.session.count){ //agr req.session.count exist krta hai to uski value fir increase kr do by 1, lekin exist nhi krta to initialize krwado by 1.
//         req.session.count ++; //req.session ek single session ko track krta hai, aur uske andar no. of counts ya request check krni hai isliye count variable bana liya.
//     }else{
//         req.session.count = 1;
//     }
//     res.send(`You sent a request ${req.session.count} times.`); //Note: ye no. of count server storage mein store hoti hai yaani MemoryStore. Development krte time to theek hai, but during its production/deployment environment, we won't use MemoryStore(a temporary JavaScript-based memory store) as it can have chances of data leak. Instead we use other compatible session stores like: cassandra-store, cluster-store, connect-arango, connect-dynamodb, connect-redis,connect-mongo etc. are temporary some temporary well-known data stores.
// });

// app.use(cookieParser('secretcode')); //yeh cookie ki value ko alag format mein convert kr dega raw format mein. Wo alag baat hai ki cookie sign krne ke baad bhi uski value to hamein visible hi rehti hai! Purpose signed cookie ka yhi rehta hai ki cookie ke saath kisi ne tampering na kri ho, jab usko apan verify krte hai tab pata chalta hai.

// app.get('/getsignedcookie', (req,res)=>{
//     res.cookie('made-in', 'India', {signed: true});
//     res.send('signed cookie sent!');
// });

// app.get('/verify', (req,res)=>{
//     // console.log(req.cookies);//req.cookies hamesha unsigned cookies ko hi print krta hai, isliye console mein {} bana aayega.
//     console.log(req.signedCookies);//iski help se signedCookies print ho jaati hai. Agr cookie ke saath tampering hoti hai to sirf empty object '{}' return hota hai, indicating that cookie value hai been tampered with. Aur agr us text mein jo value hoti hai usko hi agr sirf replace krte hai to {'made-in' : false} return hota hai, indicating ki uski value change kr di gyi hai.
//     res.send('verified.');
// });

// app.get('/getcookies', (req,res)=>{
//     res.cookie('greet', 'namaste'); //name-value pair. name: greet and value: namaste. Ek baar cookie mil jaati hai, to fir wo browser mein saved rehti hai, bhale hi apan dusre routes mein chale jaye tab bhi.
//     res.cookie('madeIn', 'India');
//     res.send('Sent you some cookies!');
// });

// app.get('/greet', (req,res)=>{
//     let {name = 'anonymous'} = req.cookies; //cookies se name: name ki value nikaal rhe hai. Agr name nhi hai to default value anonymous ho jayegi.
//     res.send(`Hi, ${name}!`);
// });

// // To authorization aur authentication related jo bhi cheezein hoti hai websites mein, usmein we use cookies.

// app.get('/', (req,res) => {
//     console.dir(req.cookies);//directly request se cookies ko parse kr paana possible nhi hota hamare server mein, isliye ye undefined show hoga. Is cheez ko fix krne ke liye we use cookie-parser middleware. It is an npm package: npm i cookie-parser
//     res.send('Hi, I am root.');
// });

// app.use('/users', users); //router ke path se common cheez nikalenge aur usko yha daal denge. Yha pr common path '/users' hai in user.js ke routes. Ab jitne bhi requests /users se aayenge, unki mapping users se hogi.
// app.use('/posts', posts);

app.listen(3000, ()=>{
    console.log('Server is listening on the port 3000.');
});

// In short: Bahut saare related paths ko segregate krne ka achha tarika hai hamara Express router. 

// Cookies:
// Web Cookies: HTTP cookies are small blocks of data created by a web server while a user is browsing a website and
// placed on the user's computer or other device by the user's web browser. We'll be using cookies for Personalization or user preferences.
// Visit: en.wikipedia.org/wiki/HTTP_cookie  for more info. Cookies are stores as Name-Value pair, similar to Key-Value pair.
// With the help of Express, ham cookies ko send kr sakte hai. Browser mein dekhne ke liye go to Inspect-> >> -> Application-> select Cookies option.
// cookieParser ki help se dusre pages us cookie ko access + parse(read) kr paate hai. 

// Signed Cookies: Ek hoti hai normal cookie jiske andar name value pair hota hai, dusri aisi cookie hoti hai jike upar kuch sign/stamp lag jaata hai. Normal cookies ke saath easily tampering ki jaa sakti hai, yaani uske name value pairs ko change kr sakte hai apan through inspect option in browser.
// Isliye cookies ko tampering aur unintentional changes se bachane ke liye ham cookies ko sign krte hai. Aur signed cookies ko send krte hai fir verify bhi krte hai ki kya wo ek signed cookie hai, kya wo sahi se signed hai.
// 2 Step process for signed cookie: 1. Send signed cookie and 2. Verify signed cookie. 

// What is State?
// Stateful Protocol: Stateful Protocol require server to save the status and session information. eg - ftp
// Stateless Protocol: Stateless Protocol does not require the server to retain the server or status information  eg - http

// jaise ki ecommerce website mein apan bina login kre ek page se dusre page jaate hai aur items ko cart mein daalte jaate hai, without logging in, pr http stateless hai, to use to bhula dena chahiye cart information, jab ek se dusre page mein switch krte hai? Pr aisa nhi hota, due to Express sessions. 
// Express Sessions: An attempt to make our session stateful. Yaani sessions se related kuch information ko server-side mein save karana. Ye session kuch bhi ho sakta hai jaise ki amazon website pr bina login kre items cart mein add krte jaana, aur cart mein fir payment krne ke just pehle wo bolega ki aapka account banao.
// aise mein har user ko session id mil jaati hai. Jo session id hai wo client ko bhij jaati hai using cookies aur baaki ka data server mein "temporary storage" mein rehta hai, database mein store nhi karate kyuki DB is used to store only permanent information. Browser yaani client ke andar information(sessionID) cookies ke form mein store kari jaati hai.
// Aur ham sirf sessionID akeli isliye bhejte hai kyuki cookies ki bhi kuch limit hoti hai information store krne ki. Aur saath hi saath cookies ke andar stored information secure bhi nhi rehti, isliye cookies mein chhoti aur kam information store kara rhe hai.
// express-session bhi ek npm package hota hai!
// npm i express-session
// note: sessionID ek signed cookie hoti hai.

// connect-flash: The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. Yaani flash messages, jo single time appear krte hai aur page refresh  krne pr gayab ho jaate hai. In flash messages ke alag alag triggers hote hai. Ye bhi ek npm package hai aur ye bhi ek middleware hai! flash is typically used in combination with redirects. Bina Express session ko use kre we cannot use connect-flash. npm i connect-flash