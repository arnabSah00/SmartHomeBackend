require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const registerRoutes = require('./routes/registerRouter');
const loginRoutes=require('./routes/loginRouter');
const logoutRoutes=require('./routes/logoutRouter');
const userRoutes=require('./routes/userRouter');
const passport = require('./config/passport'); // Adjust the path as necessary
const houseRoutes=require('./routes/houseRouter');
const roomRoutes=require('./routes/roomRouter');
const deviceRoutes=require('./routes/deviceRouter');
const copyUserRoutes=require('./routes/copyUserRouter');
const historyRoutes = require('./routes/history'); // Import the history routes

const app = express();
const port = process.env.PORT;

// Configure CORS to allow requests from your React app
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your React app's URL
  credentials: true
}));
  

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Session management with connect-mongo
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS,
        maxAge: 30 * 24 * 60 * 60 * 1000 
    }, // 30 days
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    })
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Use the user routes
app.use('/api', registerRoutes);
app.use('/api',loginRoutes);
app.use('/api',logoutRoutes);
app.use('/api',userRoutes);
app.use('/api',houseRoutes);
app.use('/api',roomRoutes);
app.use('/api',deviceRoutes);
app.use('/api',copyUserRoutes);
// Include the history routes
app.use('/api/history', historyRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
