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
    var allSongs = parsedJson.allSongs;
    for (var i = 0; i < allSongs.length; i++) {
        var allRatings = allSongs[i].ratings;
        console.log("AllRatings:" + allRatings);
        delete allSongs[i].ratings;
        allSongs[i].avgRating = getAverageRating(allRatings) || 0;
        console.log("AvgRating:" + getAverageRating(allRatings));
    }
    var sortedSongs = [...allSongs].sort(sortOnRating);
    function sortOnRating(a, b) {
        if (a.avgRating > b.avgRating) return -1;
        if (a.avgRating < b.avgRating) return 1;
        return 0;
    }
    res.send(sortedSongs);
});


app.get('/api/songsFromArtist', (req, res) => {
    const artist = req.get("artistName");
    console.log("Artist Name : " + artist);
    const sungSongs = getSungSongs(artist);
    res.send(sungSongs);
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
    const parsedJsonSong = JSON.parse(allSongsString);
    const allSongs = parsedJsonSong.allSongs;
    const song = {
        id: allSongs.length + 1,
        songName: req.body.songName,
        releaseDate: req.body.releaseDate,
        imageURL: req.body.imageURL,
        ratings: [],
        artists: req.body.artists
    };
    allSongs.push(song)


    const finalObjSong = {
        allSongs: allSongs
    }
    const stringToWriteSong = JSON.stringify(finalObjSong, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWriteSong);
    } catch (err) {
        console.log(err);
    }

    //now adding song to artist sungSongs
    var allArtistsString = fs.readFileSync('./artists/allArtists.json');
    const parsedJsonArtists = JSON.parse(allArtistsString);
    const allArtists = parsedJsonArtists.allArtists;

    const artistsInSong = req.body.artists;
    for (var i = 0; i < allArtists.length; i++) {
        for (var j = 0; j < artistsInSong.length; j++) {
            if (allArtists[i].artistName == artistsInSong[j]) {
                allArtists[i].sungSongs.push(song.songName);
            }
        }
    }

    const finalObjArtist = {
        allArtists: allArtists
    }
    const stringToWriteArtist = JSON.stringify(finalObjArtist, null, 2);

    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWriteArtist);
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
    res.send({ id: songId, rating });
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

    const id = req.params.id;
    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(allSongsString);

    var allSongs = parsedJson.allSongs;
    var deletedElement;
    var deletedIndex;

    for (var i = 0; i < allSongs.length; i++) {
        if (allSongs[i].id == id) {
            deletedIndex = i;
            deletedElement = allSongs[i];
            allSongs.splice(i, 1);
            break;
        }
    }
    if (deletedIndex) {
        for (var i = deletedIndex; i < allSongs.length; i++) {
            allSongs[i].id = allSongs[i].id - 1;
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
    res.send(deletedElement || "Invalid ID");
});

app.delete('/api/artists/:id', (req, res) => {

    const id = req.params.id;
    var allArtistString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(allArtistString);

    var allArtists = parsedJson.allArtists;
    var deletedElement;
    var deletedIndex;

    for (var i = 0; i < allArtists.length; i++) {
        if (allArtists[i].id == id) {
            deletedIndex = i;
            deletedElement = allArtists[i];
            allArtists.splice(i, 1);
            break;
        }
    }

    if (deletedIndex) {
        for (var i = deletedIndex; i < allArtists.length; i++) {
            allArtists[i].id = allArtists[i].id - 1;
        }
    }

    const finalObj = {
        allArtists: allArtists
    }
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(deletedElement || "Invalid ID");
});


//Validate Information
function validateSong(song) {
    const schema = {
        songName: Joi.string().min(3).required(),
        releaseDate: Joi.string().min(3).required(),
        imageURL: Joi.string().empty().optional().valid(''),
        artists: Joi.array().required().min(1)
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
        bio: Joi.string().min(3).required()
    };
    return Joi.validate(artist, schema);

}

function getSungSongs(artist) {
    console.log("ArtistName : " + artist);
    var sungSongs = []
    var jsonString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(jsonString);
    console.log(parsedJson.allSongs);
    const allSongs = parsedJson.allSongs;
    for (var i = 0; i < allSongs.length; i++) {
        // console.log(allSongs[i]);
        // console.log(allSongs[i].artists);
        if (allSongs[i].artists.includes(artist)) {
            sungSongs.push(allSongs[i].songName);
        }
    }
    return sungSongs;
}

function getAverageRating(ratings) {
    var avgRating = 0;
    for (var i = 0; i < ratings.length; i++) {
        avgRating += ratings[i];
    }

    if (avgRating > 0) {
        return (avgRating / ratings.length).toFixed(1);
    }else{
        return 0.0.toString()
    }
}

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));