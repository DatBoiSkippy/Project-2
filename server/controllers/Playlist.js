const models = require('../models');
const Playlists = models.Playlists;
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/playlistItems';

const makerPage = async (req, res) => {
    return res.render('app');
}

//Change to SetPlayList Later
const getPlayList = async (req, res) => {

    if (!req.body.name || !req.body.id) {
        return res.status(400).json({ error: 'Name, and playlist ID are required!' });
    }

    let playlistData = {};

    try {
        const url = await fetch(`${YOUTUBE_API}?part=snippet&playlistId=${req.body.id}&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`);
        const data = await url.json();
        playlistData = {
            name: req.body.name,
            playlist: req.body.id,
            owner: req.session.account._id,
            videos: data.items,
        };
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving info' });
    }

    try {
        const addPlayList = new Playlists(playlistData);
        await addPlayList.save();
        return res.status(201).json({
            name: addPlayList.name,
            playlist: addPlayList.id,
            videos: addPlayList.videos
        });
    } catch (err) {
        console.log(err);
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Playlist already exists!' });
        }
        return res.status(500).json({ error: 'An error occurred making playlist!' });
    }
}

//Queries information from the database
//looks for name, playlist ID, and how many videos there are in the playlist
const setPlayList = async (req, res) => {
    try {
        const query = { owner: req.session.account._id };
        const docs = await Playlists.find(query).select('name playlist videos').lean().exec();
        return res.json({ playlists: docs });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error retrieving playlists!' });
    }
};


module.exports = {
    makerPage,
    getPlayList,
    setPlayList,
};
