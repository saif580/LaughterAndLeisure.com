if(process.env.NODE_ENV!=="production") {
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const expressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user');
const mongoSanitize=require('express-mongo-sanitize');
const helmet=require('helmet');

const userRoutes=require('./routes/users');
const destinationRoutes=require('./routes/destination');
const reviewsRoutes=require('./routes/reviews');

const mongoDBStore=require("connect-mongo")(session);

const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/laughterandleisure';

mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We are Connected");
});

const app=express();

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());

const store=new mongoDBStore({
    url:dbUrl,
    secret:process.env.COOKIE_SECRET,
    touchAfter:24*60*60
});
store.on("error",function(e){
    console.log("Session error",e)
})
const sessionConfig={
    store,
    name:'laughterandleisure',
    secret:process.env.COOKIE_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
    "https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/db3kjpvkf/",
                "https://images.unsplash.com/",
                "https://images.pexels.com/"
            ],                                             
            mediaSrc:["http://localhost:3000/bgvideo.mp4","https://enigmatic-wildwood-38855.herokuapp.com/bgvideo.mp4","https://desolate-waters-10446-d18a6bc0f7a7.herokuapp.com/"],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);



app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
});

app.get('/fakeuser',async(req,res)=>{
    const user=new User({email:'abc@gmail.com',username:'abc'});
    const newUser=await User.register(user,'abc123');
    res.send(newUser);
})

app.use('/',userRoutes)
app.use('/destination',destinationRoutes);
app.use('/destination/:id/reviews',reviewsRoutes);

app.get('/',(req,res)=>{
    res.render('home.ejs');
})


app.all('*',(req,res,next)=>{
    next(new expressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
    const {statusCode=500,message="Something Went Wrong"}=err;
    res.status(statusCode).render('error.ejs',{err});
})

const port=process.env.PORT||3000;
app.listen(port,()=>{
    console.log(`Serving on port ${port}`);
})