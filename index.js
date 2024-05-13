const express = require("express")
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require("./models/user")
const jwt = require("jsonwebtoken")
require('dotenv').config()
const fs = require('fs')
const verifyToken = require("./middleware/authJWT")


const app = express()
app.use(express.json());


// register api

app.post("/api/register", (req,res) => {
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        preference: req.body.preference        
    })
    user.save().then(data => {
        return res.status(200).json({message: "User registered successfully"})
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error: err})
    })
})


// login api

app.post('/api/login', (req,res) => {
    let emailPassed = req.body.email
    let passwordPassed = req.body.password
    User.findOne({
        email: emailPassed
    }).then((user)=> {  
        if(!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        var isPasswordValid = bcrypt.compareSync(passwordPassed, user.password)
        if(!isPasswordValid){
            return res.status(401).send({
                message: "Invalid Password"
            })
        }else{
            var token = jwt.sign({
                id: user.id
            }, process.env.API_SECRET,{
                expiresIn: 86400
            });
            return res.status(200).send({
                user:{
                    id: user.id
                },
                message: "Login successfull",
                accessToken: token
            })
        }

    }).catch(err => {

    })
})


// Get news api
// Define a function to fetch news articles from GNews API
async function fetchNewsArticles(query, lang, country, max, apiKey) {
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=${lang}&country=${country}&max=${max}&apikey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.articles; // Return only the articles from the response
    } catch (error) {
        console.error('Error fetching news articles:', error);
        throw new Error('Failed to fetch news articles');
    }
}

app.post('/api/preference', verifyToken, async (req, res) => {
    try {
        // Find user's news preferences
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's preference from the request body
        const userPreference = req.body.preference;

        // Ensure that the user's preference is provided and matches the available options
        if (!userPreference || !['technology', 'sports'].includes(userPreference)) {
            return res.status(400).json({ message: 'Invalid or missing preference' });
        }

        // Fetch news articles based on user preferences
        let newsArticles;
        if (userPreference === 'sports') {
            newsArticles = await fetchNewsArticles('sports', 'en', 'us', 10, process.env.NEWS_API);
        } else if (userPreference === 'technology') {
            newsArticles = await fetchNewsArticles('technology', 'en', 'us', 10, process.env.NEWS_API);
        }

        // Return the fetched news articles
        res.status(200).json(newsArticles);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



try{
    mongoose.connect("mongodb://0.0.0.0:27017/news");
}catch{
    console.log("Failed while connecting to mongodb")
}



app.listen(8000, ()=>{
    console.log(`Server is running on port 8000!`)
})