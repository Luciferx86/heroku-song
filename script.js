const express = require('express'); //Import Express
const Joi = require('joi'); //Import Joi
const app = express(); //Create Express Application on the app variable
const fs = require('fs');//Import fs 
app.use(express.json()); //used the json file


//root of API
// Display the Message when the URL consist of '/'
app.get('/', (req, res) => {
    res.send("Welcome to Akshay's REST API!");
});
// Returns the result of all songs in the DB
app.get('/api/songs', (req, res) => {
    //reading DB
    var jsonString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(jsonString);
    var allSongs = parsedJson.allSongs;
    for (var i = 0; i < allSongs.length; i++) {
        var allRatings = allSongs[i].ratings;
        //concluding avgRating and adding to object
        delete allSongs[i].ratings;
        allSongs[i].avgRating = getAverageRating(allRatings) || 0;
    }
    //soting the songs based on avg rating
    var sortedSongs = [...allSongs].sort(sortOnRating);
    function sortOnRating(a, b) {
        if (a.avgRating > b.avgRating) return -1;
        if (a.avgRating < b.avgRating) return 1;
        return 0;
    }
    //sending the final result
    res.send(sortedSongs);
});

app.get('/api/songsFromArtist', (req, res) => {
    const artist = req.get("artistName");
    const sungSongs = getSungSongs(artist);
    res.send(sungSongs);
});

// Returns the result of all artists in the DB
app.get('/api/artists', (req, res) => {
    //Reading artists from DB
    var jsonString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(jsonString);
    res.send(parsedJson.allArtists);
});


//CREATE New Song
app.post('/api/songs', (req, res) => {

    //validating received song object
    const { error } = validateSong(req.body);
    if (error) {
        res.status(400).send(error.details[0].message)
        return;
    }

    //Reading songs from DB
    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJsonSong = JSON.parse(allSongsString);
    const allSongs = parsedJsonSong.allSongs;
    //Creating new Song object
    const song = {
        id: allSongs.length + 1,
        songName: req.body.songName,
        releaseDate: req.body.releaseDate,
        imageURL: req.body.imageURL,
        ratings: [],
        artists: req.body.artists
    };
    //Adding new object to all songs
    allSongs.push(song)


    const finalObjSong = {
        allSongs: allSongs
    }

    //Writing final object back to DB
    const stringToWriteSong = JSON.stringify(finalObjSong, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWriteSong);
    } catch (err) {
        console.log(err);
    }

    //now adding to sungSongs of all artists in the song
    //Reading artists from DB
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

    //Writing final object to DB
    const stringToWriteArtist = JSON.stringify(finalObjArtist, null, 2);

    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWriteArtist);
    } catch (err) {
        console.log(err);
    }
    res.send(song);
});

//Rating a song 
app.post('/api/songs/rate', (req, res) => {

    //Validating received rating object
    const error = validateRating(req.body.rating);
    if (!error) {
        res.status(400).send("invalid rating");
        return;
    }

    //Reading songs from DB
    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(allSongsString);

    const allSongs = parsedJson.allSongs;
    const rating = req.body.rating;
    const songId = req.body.id;

    //Adding Rating
    for (var i = 0; i < allSongs.length; i++) {
        if (allSongs[i].id == songId) {
            allSongs[i].ratings.push(rating);
            break;
        }
    }

    const finalObj = {
        allSongs: allSongs
    }

    //Writing final object to DB
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send({ id: songId, rating });
});

//CREATE New Artist
app.post('/api/artists', (req, res) => {

    //Validating received artist object
    const { error } = validateArtist(req.body);
    if (error) {
        res.status(400).send(error.details[0].message)
        return;
    }

    //Reading all artists from DB
    var allArtistsString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(allArtistsString);

    const allArtists = parsedJson.allArtists;

    //Creating new Artist object
    const artist = {
        id: allArtists.length + 1,
        artistName: req.body.artistName,
        artistDOB: req.body.artistDOB,
        bio: req.body.bio,
        sungSongs:[]
    };

    //Pushing object to all artists
    allArtists.push(artist)

    const finalObj = {
        allArtists: allArtists
    }

    //Writing final object to DB
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(artist);
});


//Delete Request Handler

//DELETE a song
app.delete('/api/songs/:id', (req, res) => {

    const id = req.params.id;

    //Reading all songs from DB
    var allSongsString = fs.readFileSync('./songs/allSongs.json');
    const parsedJson = JSON.parse(allSongsString);

    var allSongs = parsedJson.allSongs;
    var deletedElement;
    var deletedIndex;

    for (var i = 0; i < allSongs.length; i++) {
        if (allSongs[i].id == id) {
            //deleting this song based on id
            deletedIndex = i;
            deletedElement = allSongs[i];
            allSongs.splice(i, 1);
            break;
        }
    }

    //Re-assigning new IDs to remaining songs
    if (deletedIndex) {
        for (var i = deletedIndex; i < allSongs.length; i++) {
            allSongs[i].id = allSongs[i].id - 1;
        }
    }

    const finalObj = {
        allSongs: allSongs
    }

    //Writing final object to DB
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./songs/allSongs.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(deletedElement || "Invalid ID");
});


//DELETE an Artist
app.delete('/api/artists/:id', (req, res) => {

    const id = req.params.id;

    //Reading all artists from DB
    var allArtistString = fs.readFileSync('./artists/allArtists.json');
    const parsedJson = JSON.parse(allArtistString);

    var allArtists = parsedJson.allArtists;
    var deletedElement;
    var deletedIndex;

    for (var i = 0; i < allArtists.length; i++) {
        if (allArtists[i].id == id) {
            //deleting this artists based on artist
            deletedIndex = i;
            deletedElement = allArtists[i];
            allArtists.splice(i, 1);
            break;
        }
    }

    //Re-assigning new IDs to remaining artists
    if (deletedIndex) {
        for (var i = deletedIndex; i < allArtists.length; i++) {
            allArtists[i].id = allArtists[i].id - 1;
        }
    }

    const finalObj = {
        allArtists: allArtists
    }

    //Writing final object to DB
    const stringToWrite = JSON.stringify(finalObj, null, 2);
    try {
        fs.writeFileSync('./artists/allArtists.json', stringToWrite);
    } catch (err) {
        console.log(err);
    }
    res.send(deletedElement || "Invalid ID");
});


//Validate Information

//function to validate song
function validateSong(song) {
    const schema = {
        songName: Joi.string().min(3).required(),
        releaseDate: Joi.string().min(3).required(),
        imageURL: Joi.string().empty().optional().valid(''),
        artists: Joi.array().required().min(1)
    };
    return Joi.validate(song, schema);
}

//function to validate rating
function validateRating(rating) {

    if (rating < 0 || rating > 5) {
        return false;
    }
    return true;
}

//function to validaet artist
function validateArtist(artist) {
    const schema = {
        artistName: Joi.string().min(3).required(),
        artistDOB: Joi.string().min(3).required(),
        bio: Joi.string().min(3).required()
    };
    return Joi.validate(artist, schema);

}

//get all sung songs from a particular artist
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

//get average rating from all ratings
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