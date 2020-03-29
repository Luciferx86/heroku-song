const express = require('express'); //Import Express
const Joi = require('joi'); //Import Joi
const app = express(); //Create Express Application on the app variable
const fs = require('fs');
app.use(express.json()); //used the json file

//Give data to the server
// const allSongs = [
//     { title: 'George', id: 1 },
//     { title: 'Josh', id: 2 },
//     { title: 'Tyler', id: 3 },
//     { title: 'Alice', id: 4 },
//     { title: 'Candice', id: 5 }
// ]

//Read Request Handlers
// Display the Message when the URL consist of '/'
app.get('/', (req, res) => {
    res.send("Welcome to Akshay's REST API!");
});
// Display the List Of Customers when URL consists of api customers
app.get('/api/songs', (req, res) => {
    var jsonString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(jsonString);
    console.log(parsedJson.allSongs);
    res.send(parsedJson.allSongs);
});

app.get('/api/artists', (req, res) => {
    var jsonString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(jsonString);
    console.log(parsedJson.allArtists);
    res.send(parsedJson.allArtists);
});
// Display the Information Of Specific Customer when you mention the id.
// app.get('/api/songs/:id', (req, res) => {
//     const song = allSongs.find(c => c.id === parseInt(req.params.id));
//     //If there is no valid customer ID, then display an error with the following message
//     if (!song) res.status(404).send('<h2 style="font-family: Malgun Gothic; color: darkred;">Ooops... Cant find what you are looking for!</h2>');
//     res.send(song);
// });

//CREATE Request Handler
//CREATE New Customer Information
app.post('/api/songs', (req, res) => {

    const { error } = validateSong(req.body);
    if (error) {
        res.status(400).send(error.details[0].message)
        return;
    }
    //Increment the customer id


    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(allSongsString);

    const allSongs = parsedJson.allSongs;
    const song = {
        id: allSongs.length + 1,
        songName: req.body.songName,
        releaseDate: req.body.releaseDate,
        imageURL: req.body.imageURL,
        ratings: []
    };
    allSongs.push(song)

    const finalObj = {
        allSongs: allSongs
    }
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(song);
});

app.post('/api/songs/rate', (req, res) => {

    const error = validateRating(req.body.rating);
    if (!error) {
        res.status(400).send("invalid rating");
        return;
    }
    //Increment the customer id


    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(allSongsString);

    const allSongs = parsedJson.allSongs;
    const rating = req.body.rating;
    const songId = req.body.id;

    for (var i = 0; i < allSongs.length; i++) {
        if (allSongs[i].id == songId) {
            allSongs[i].ratings.push(rating);
            break;
        }
    }

    const finalObj = {
        allSongs: allSongs
    }
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send({ songId, rating });
});

app.post('/api/artists', (req, res) => {

    const { error } = validateArtist(req.body);
    if (error) {
        res.status(400).send(error.details[0].message)
        return;
    }
    //Increment the customer id


    var allArtistsString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(allArtistsString);

    const allArtists = parsedJson.allArtists;
    const artist = {
        id: allArtists.length + 1,
        artistName: req.body.artistName,
        artistDOB: req.body.artistDOB,
        bio: req.body.bio
    };
    allArtists.push(artist)

    const finalObj = {
        allArtists: allArtists
    }
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(artist);
});

//Update Request Handler
// Update Existing Customer Information
// app.put('/api/songs/:id', (req, res) => {
//     const song = allSongs.find(c => c.id === parseInt(req.params.id));
//     if (!song) res.status(404).send('<h2 style="font-family: Malgun Gothic; color: darkred;">Not Found!! </h2>');

//     const { error } = validateSong(req.body);
//     if (error) {
//         res.status(400).send(error.details[0].message);
//         return;
//     }

//     song.title = req.body.title;
//     res.send(song);
// });

//Delete Request Handler
// Delete Customer Details
app.delete('/api/songs/:id', (req, res) => {

    const song = allSongs.find(c => c.id === parseInt(req.params.id));
    if (!song) res.status(404).send('<h2 style="font-family: Malgun Gothic; color: darkred;"> Not Found!! </h2>');

    const index = allSongs.indexOf(song);
    allSongs.splice(index, 1);

    res.send(song);
});
//Validate Information
function validateSong(song) {
    const schema = {
        songName: Joi.string().min(3).required(),
        releaseDate: Joi.string().min(3).required(),
        imageURL: Joi.string().empty().optional().valid('')
    };
    return Joi.validate(song, schema);

}

function validateRating(rating) {

    if (rating < 0 || rating > 5) {
        return false;
    }
    return true;
}

function validateArtist(artist) {
    const schema = {
        artistName: Joi.string().min(3).required(),
        artistDOB: Joi.string().min(3).required(),
        bio: Joi.string().empty().required().valid('')
    };
    return Joi.validate(artist, schema);

}

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));