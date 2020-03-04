import React, { Component } from 'react'
import Router from 'next/router'
import { css } from "@emotion/core"
import ScaleLoader from "react-spinners/ScaleLoader"
import Header from '../components/Header'
import { Modal, Button } from "react-bootstrap";
import { Doughnut } from 'react-chartjs-2';
import 'chartjs-plugin-labels'

var auth = require('firebase/auth');
var database = require('firebase/database');


var firebase = require('firebase/app');
var querystring = require('querystring');
var request = require('request')
var axios = require("axios");
var Chart = require('chart.js');
var client_id = '2923d79235804ea58633989710346f3d';
var client_secret = 'd4813d196edf4940b58ba0aeedbf9ebc';
var redirect_uri = 'https://spotifynd-friends.herokuapp.com/';
var scope = 'user-read-private user-read-email playlist-read-private';
var top100 = '5tNkbVArsyCoI4NeO4QpCx';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

class User extends Component {
    constructor(props) {
        super(props);
        if(!this.props.query.access_token){
            Router.push({pathname: '/'})
        }
        this.state = {
            access_token: this.props.query.access_token,
            refresh_token: '',
            user: '',
            playlists: [],
            playlist: null,
            playlistName: '',
            playlistDescription: '',
            playlistTracks: [],
            top100tracknames: [],
            playlisttracknames: [],
            danceCount: 0,
            energyCount: 0,
            acousticCount: 0,
            liveCount: 0,
            valenceCount: 0,
            trackFeatures: [],
            genres: [],
            artistID: [],
            name: [],
            artist: [],
            top100trackFeatures: [],
            top100genres: [],
            top100artistID: [],
            top100name: [],
            top100artist: [],
            compatibility: -1,
            max: -1,
            mostCompatibleIndex: -1,
            attribute: '',
            attributeScore: -1,
            status: '',
            loading: false,
            listOfUsers: [],
            show: false,
            showChart: false,
            data: {
                
                labels: [
                    'Dancibility',
                    'Energy',
                    'Acousticness',
                    'Liveness',
                    'Valence'
                ],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#66c2a4',
                        '#41ae76',
                        '#238b45',
                        '#006d2c',
                        '#00441b'
                        ],
                        hoverBackgroundColor: [
                        '#edf8fb',
                        '#edf8fb',
                        '#edf8fb',
                        '#edf8fb',
                        '#edf8fb'
                    ]
                }]
            }
        }
        this.chartReference = React.createRef();
        const firebaseConfig = {
            apiKey: "AIzaSyCBmjWVAetSGAQ2E7uE0oh5_lG--ogkWbc",
            authDomain: "spotifynd-friends.firebaseapp.com",
            databaseURL: "https://spotifynd-friends.firebaseio.com",
            projectId: "spotifynd-friends",
            storageBucket: "spotifynd-friends.appspot.com",
            messagingSenderId: "775203379545",
            appId: "1:775203379545:web:2e74554d15a4b1c3675448",
            measurementId: "G-QL50LT5KSH"
        };
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig)
        }
        console.log(firebase)


    }
    getData = () => ({
        labels: [
            'Dancibility',
            'Energy',
            'Acousticness',
            'Liveness',
            'Valence'
        ],
        datasets: [{
            data: [this.state.danceCount,this.state.energyCount, this.state.acousticCount, this.state.liveCount, this.state.valenceCount],
            backgroundColor: [
                '#66c2a4',
                '#41ae76',
                '#238b45',
                '#006d2c',
                '#00441b'
                ],
                hoverBackgroundColor: [
                '#edf8fb',
                '#edf8fb',
                '#edf8fb',
                '#edf8fb',
                '#edf8fb'
                ]
        }]
    })

    static getInitialProps({ query }) {
        console.log("query " + JSON.stringify({ query }))
        return { query }
    }

    showDBusers = () => {
        var dbRef = firebase.database().ref('users')
        console.log(this.state.user)



        dbRef.orderByValue().startAt(0).on("child_added", snapshot => {

            //ignore key if it is you
            if (snapshot.exists() && snapshot.key != this.state.user) {

                console.log(snapshot.key)

                this.setState({ listOfUsers: [...this.state.listOfUsers, snapshot.key] })
                console.log(this.state.listOfUsers)

            }

        });
    }

    writeUserData = (spotifyid) => {
        var database = firebase.database();

        var dbRef = firebase.database().ref('users')
        console.log(this.state.user)

        var user_id = this.state.user

        dbRef.child(user_id).once("value", snapshot => {
            if (snapshot.exists()) {
                const userLocation = snapshot.val().location;
                const userTopPlaylist = snapshot.val().topPlaylist;
                const userSpotifyId = snapshot.val().spotify_id;
                console.log("exists!", userData);


            }
        });

        if (userSpotifyId == null && userTopPlaylist == null && userLocation == null) {
            console.log("had to create one")
            firebase.database().ref('users/' + spotifyid).set({
                spotify_id: spotifyid,
                location: '',
                topPlaylist: ''


            }, function (error) {
                if (error) {
                    // The write failed...
                } else {
                    // Data saved successfully!
                }
            }

            );
            //Add an alert to go to settings right here after creating there
            //this.AlertDismissible();

        }
    }


    componentDidMount = () => {
        this.getUserPlaylists();
        this.get100();
    }


    getUserPlaylists = () => {

        let url = window.location.href;
        if (url.indexOf('localhost') > -1) {
            redirect_uri = 'http://localhost:3000/index'
        }

        let access_token = this.state.access_token
        var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };
        if (access_token != "") {
            // use the access token to access the Spotify Web API
            request.get(options, (error, response, body) => {
                console.log('Access token:' + access_token)
                console.log(body);
                this.setState({ user: body.id })

                // var aDatabase = firebase.database();
                // var mDatabase = aDatabase.ref();
                //
                // var myRef = mDatabase.child(this.state.user).child('spotify_id');
                //  console.log("HEREE")
                //
                //  if (myRef == null) {
                //     this.writeUserData(this.state.user);
                //   }
                var exist;
                firebase.database().ref(`users/${this.state.user}/location`).once("value", snapshot => {
                    if (snapshot.exists()) {
                        //checking if the account alrady exists
                        console.log("exists!");
                        firebase.database().ref(`users/${this.state.user}/topPlaylist`).once("value", snapshot => {
                            if (snapshot.exists()) {
                                console.log("top playlist also exists")
                            }
                            else {
                                console.log("top playlist doesnt exist but location does")
                                this.handleModal();
                            }
                        });

                    }
                    else {

                        console.log("does not exist");
                        //if accont doesn't exit then open Modal
                        this.handleModal();
                    }
                });

                this.showDBusers()
                console.log('user: ' + this.state.user)
                var playlistOptions = {
                    url: 'https://api.spotify.com/v1/users/' + this.state.user + '/playlists',
                    qs: { limit: '50' },
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                console.log('user right before playlist: ' + this.state.user)

                // use the access token to access the Spotify Web API
                request.get(playlistOptions, (error, response, body) => {
                    console.log(body);
                    this.setState({ playlists: body.items })
                    for (var i = 0; i < this.state.playlists.length; i++) {
                        this.state.playlists[i].key = i.id
                        console.log(this.state.playlists[i].key)
                    }
                    console.log('this.state.playlists' + this.state.playlists)

                    let playlistsLeft = body.total - 50;
                    let numRequests = 1;
                    while (playlistsLeft > 0) {
                        var playlistOptions = {
                            url: 'https://api.spotify.com/v1/users/' + this.state.user + '/playlists',
                            qs: { limit: '50', offset: 50 * numRequests },
                            headers: { 'Authorization': 'Bearer ' + access_token },
                            json: true
                        };

                        request.get(playlistOptions, (error, response, body) => {
                            this.setState({ playlists: this.state.playlists.concat(body.items) })
                        });

                        playlistsLeft -= 50;
                        numRequests++
                    }
                });
            });
        }
    }
    assignPlaylistTracksName = (items) => {
        if (typeof (items) != 'undefined') {
            if (items != 0) {
                this.state.playlisttracknames = items.map((i) =>
                    <li>{i.track.id}</li>
                )
            } else {
                this.state.playlisttracknames = <p>No playlists to display</p>
            }
            console.log("playlist track names: " + this.state.playlisttracknames.length)
        }
    }
    assignTrackFeatures = (items) => {
        if (typeof (items) != 'undefined') {
            if (items != 0) {
                this.state.trackFeatures = items.map((i) =>
                    <li>{i.track.id}</li>
                )
            } else {
                this.state.playlisttracknames = <p>No playlists to display</p>
            }
        }
    }

    comparePlaylists = async () => {
        //clear arrays
        this.setState({
            trackFeatures: [],
            genres: [],
            artistID: [],
            name: [],
            artist: [],
            top100trackFeatures: [],
            top100genres: [],
            top100artistID: [],
            top100name: [],
            top100artist: [],
            max: -1,
            mostCompatibleIndex: -1,
            danceCount: 0,
            energyCount: 0,
            acousticCount: 0,
            liveCount: 0,
            valenceCount: 0,
            compatibility: 'generating',
            status: '',
            loading: true
        })
        //create arrays with selected playlist attributes
        for (let i = 0; i < this.state.playlisttracknames.length; i++) {
            var id = this.state.playlisttracknames[i].props.children;
            var trackOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/tracks/${id}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            var audioFeaturesOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/audio-features/${id}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            await axios(audioFeaturesOptions)
                .then((body) => {
                    this.setState({ trackFeatures: [...this.state.trackFeatures, body.data] })
                    console.log(this.state.trackFeatures);
                });

            await axios(trackOptions)
                .then((body) => {
                    if (body.data.artists != 0) {
                        this.setState({
                            artistID: [...this.state.artistID, body.data.artists[0].id],
                            artist: [...this.state.artist, body.data.artists[0].name],
                            name: [...this.state.name, body.data.name],
                            status: "Analyzing Playlist 1: " + body.data.name
                        })
                        console.log(this.state.artistID);
                        console.log(this.state.artist)
                        console.log(this.state.name)
                    }
                });
            var artistOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/artists/${this.state.artistID[i]}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            await axios(artistOptions)
                .then((body) => {
                    this.setState({ genres: [...this.state.genres, body.data.genres] })
                    /*this.state.genres = body.genres.map((i) =>
                    <li>{i}</li>)*/
                    console.log(this.state.genres)
                });
        }
        //create arrays for top100playlist attributes
        for (let j = 0; j < this.state.top100tracknames.length; j++) {
            var id = this.state.top100tracknames[j].props.children;
            var trackOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/tracks/${id}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            var audioFeaturesOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/audio-features/${id}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            await axios(audioFeaturesOptions)
                .then((body) => {
                    this.setState({ top100trackFeatures: [...this.state.top100trackFeatures, body.data] })
                });
            console.log(this.state.top100trackFeatures);
            await axios(trackOptions)
                .then((body) => {
                    if (body.data.artists != 0) {
                        this.setState({
                            top100artistID: [...this.state.top100artistID, body.data.artists[0].id],
                            top100artist: [...this.state.top100artist, body.data.artists[0].name],
                            top100name: [...this.state.top100name, body.data.name],
                            status: "Analyzing Playlist 2: " + body.data.name
                        })
                        console.log(this.state.top100artistID);
                    }
                });
            var artistOptions = {
                method: 'GET',
                url: `https://api.spotify.com/v1/artists/${this.state.top100artistID[j]}`,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };
            await axios(artistOptions)
                .then((body) => {
                    this.setState({ top100genres: [...this.state.top100genres, body.data.genres] })
                    /*this.state.genres = body.genres.map((i) =>
                    <li>{i}</li>)*/
                    console.log(this.state.top100genres)
                });
        }
        this.setState({ status: "Calculating score" })
        let compatibility = await this.calculateScore();
        this.setState({
            compatibility: compatibility,
            loading: false
        });
    }

    calculateScore = () => {
        return new Promise(resolve => {
            var playlist1Total = 0;
            var playlist2Total = 0;
            for (let i = 0; i < this.state.playlisttracknames.length; i++) {
                console.log('calculating')
                //var songDifferenceScore = 0;
                var imin = 100;
                console.log(this.state.top100tracknames.length)
                for (let j = 0; j < this.state.top100tracknames.length; j++) {
                    var differenceScore = 0, dance = 0, energy = 0, acoustic = 0, live = 0, valence = 0
                    differenceScore += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability) * 5
                    dance += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy) * 5
                    energy += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness) * 5
                    acoustic += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness) * 5
                    live += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence) * 5
                    valence += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence) * 5
                    differenceScore += 75;
                    if (this.state.artistID[i] == this.state.top100artistID[j])
                        differenceScore -= 20;
                    if (!(this.state.genres[i].length === 0)) {
                        for (let k = 0; k < this.state.genres[i].length; k++) {
                            let found = false;
                            if (!(this.state.top100genres[j].length === 0)) {
                                for (let l = 0; l < this.state.top100genres[j].length; l++) {
                                    if (this.state.genres[i][k] == this.state.top100genres[j][l]) {
                                        differenceScore -= 55;
                                        found = true;
                                        console.log("same genre")
                                        break;
                                    }
                                }
                                if (found == true)
                                    break;
                            }
                        }
                    }
                    if (differenceScore < imin) {
                        imin = differenceScore;
                    }
                }
                var attributeMin = Math.min(dance, energy, acoustic, live, valence)
                switch (attributeMin) {
                    case dance:
                        this.state.danceCount++
                        break;
                    case energy:
                        this.state.energyCount++
                        break;
                    case acoustic:
                        this.state.acousticCount++
                        break;
                    case live:
                        this.state.liveCount++
                        break;
                    case valence:
                        this.state.valenceCount++
                        break;
                }
                imin = 100 - imin;
                console.log(this.state.name[i] + ": " + imin)
                playlist1Total += imin;
                if(this.state.max < imin){
                    this.state.mostCompatibleIndex = i;
                    this.state.max = Math.trunc(imin);
                }
                console.log("playlist1 running total: " + playlist1Total)
            }
            playlist1Total /= this.state.playlisttracknames.length;
            console.log("playlist1 total: " + playlist1Total);
            for (let j = 0; j < this.state.top100tracknames.length; j++) {
                console.log('calculating')
                var jmin = 100;

                for (let i = 0; i < this.state.playlisttracknames.length; i++) {
                    var differenceScore = 0, dance = 0, energy = 0, acoustic = 0, live = 0, valence = 0
                    differenceScore += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability) * 5
                    dance += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy) * 5
                    energy += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness) * 5
                    acoustic += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness) * 5
                    live += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness) * 5
                    differenceScore += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence) * 5
                    valence += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence) * 5
                    differenceScore += 75;
                    if (this.state.artistID[i] == this.state.top100artistID[j])
                        differenceScore -= 20;
                    if (!(this.state.top100genres[j].length === 0)) {
                        for (let l = 0; l < this.state.top100genres[j].length; l++) {
                            let found = false;
                            if (!(this.state.genres[i].length === 0)) {
                                for (let k = 0; k < this.state.genres[i].length; k++) {
                                    if (this.state.genres[i][k] == this.state.top100genres[j][l]) {
                                        differenceScore -= 55;
                                        found = true;
                                        console.log("same genre")
                                        break;
                                    }
                                }
                            }
                            if (found == true)
                                break;
                        }
                    }
                    if (differenceScore < jmin) {
                        jmin = differenceScore;
                    }
                }
                jmin = 100 - jmin;
                console.log(this.state.top100name[j] + ": " + jmin)
                playlist2Total += jmin;
                console.log("playlist2 running total: " + playlist2Total)
            }
            playlist2Total /= this.state.top100tracknames.length;
            console.log("playlist2 total: " + playlist2Total);
            console.log("Your songs are closest by: \n" + this.state.danceCount + "/" + this.state.playlisttracknames.length + " dancibility\n" +
                this.state.energyCount + "/" + this.state.playlisttracknames.length + " energy\n" +
                this.state.acousticCount + "/" + this.state.playlisttracknames.length + " acousticness\n" +
                this.state.liveCount + "/" + this.state.playlisttracknames.length + " liveness\n" +
                this.state.valenceCount + "/" + this.state.playlisttracknames.length + " valence\n"
            )
            if (playlist1Total > playlist2Total)
                resolve(Math.trunc(playlist2Total))
            else
                resolve(Math.trunc(playlist1Total))
        })
    }

    getPlaylistTracks = (i) => {
        this.setState({data: {
            labels: [
                'Dance',
                'Energy',
                'Acoustic',
                'Live',
                'Valence'
            ],
            datasets: [{
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                'Green',
                'Orange',
                'Purple'
                ],
                hoverBackgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                'Grey',
                'Cyan',
                'Brown'
                ]
            }]}})
        console.log(this.state.playlists[i])
        var tracksOptions = {
            url: this.state.playlists[i].tracks.href,
            headers: { 'Authorization': 'Bearer ' + this.state.access_token },
            json: true
        };

        console.log('user right before tracks request: ' + this.state.user)

        // use the access token to access the Spotify Web API
        request.get(tracksOptions, (error, response, body) => {
            console.log(body);
            console.log('this.state.playlists' + this.state.playlists)
            this.assignPlaylistTracksName(body.items);
            this.comparePlaylists();
        });

    }


    refresh = () => {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: this.state.refresh_token,
            },
            json: true
        };

        request.post(authOptions, (error, response, body) => {
            console.log(error);
            if (!error && response.statusCode === 200) {

                this.setState({
                    access_token: body.access_token
                });
            }
        });
        console.log("This is the new access_token" + this.state.access_token);
    }

    get100 = () => {

        let url = window.location.href;
        if (url.indexOf('localhost') > -1) {
            redirect_uri = 'http://localhost:3000/index'
        }

        let access_token = this.state.access_token

        if (access_token != "") {
            var options = {
                url: 'https://api.spotify.com/v1/playlists/' + top100,
                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                json: true
            };

            request.get(options, (error, response, body) => {
                console.log(error);
                console.log(body);

                this.setState({
                    playlist: body,
                    playlistName: body.name,
                    playlistDescription: body.description,
                    playlistTracks: body.tracks.items
                })

            });
        }
    }



    assigntop100tracknames = () => {
        if (typeof (this.state.playlistTracks) != 'undefined') {
            if (this.state.playlistTracks != 0) {
                this.state.top100tracknames = this.state.playlistTracks.map((i) =>
                    <li>{i.track.id}</li>
                )
            } else {
                this.state.top100tracknames = <p>No playlists to display</p>
            }
        }
    };

    goToSettings = () => {
        let access_token = this.state.access_token;
        Router.push({
            pathname: '/settings',
            query: { access_token }
        }, '/settings'
        )
    }

    handleModal = () => {
        this.setState({
            show: !this.state.show
        })
    }

    render() {

        let playlists;
        if (typeof (this.state.playlists) != 'undefined') {
            if (this.state.playlists.length != 0) {
                playlists = this.state.playlists.map((i, index) =>
                    <div>
                        <li>
                            {i.name}
                            <button className="click" onClick={() => this.getPlaylistTracks(index)}>
                                Select
                        </button>
                        </li>
                    </div>
                )
            } else {
                playlists = <p>No playlists to display</p>
            }
        }

        let list_ofUsers;

        if (typeof (this.state.listOfUsers) != 'undefined') {
            if (this.state.listOfUsers.length != 0) {
                list_ofUsers = this.state.listOfUsers.map((i, index) =>
                    <div>
                        <li>
                            {i}
                            <Button className="button" /*onClick={() => redirect to user page } */>
                                Select User
                        </Button>
                        </li>
                    </div>
                )
            } else {
                playlists = <p>No user to choose from</p>
            }
        }


        this.assigntop100tracknames();
        var message = ''
        var status = ''
        let details;
        if (this.state.compatibility < 0) {
            message = ''
        } else if ((this.state.compatibility) == 'generating') {
            message = `Generating compatibility. Status:`
            status = `${this.state.status}`
        } else if (this.state.compatibility > 0) {
            status = ''
            message = `These playlists are ${this.state.compatibility}% compatible!`
            message += "\n" + this.state.name[this.state.mostCompatibleIndex] + " by " + this.state.artist[this.state.mostCompatibleIndex] + ` is the most compatible song by ${this.state.max}%.`
                details = <Button onClick={() => this.setState({data: this.getData()})}>
                    Details
                </Button>
        }


        return (


            <div>
                <head>
                    <link
                        rel="stylesheet"
                        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                        crossorigin="anonymous"
                    />
                </head>
                <div>

                    {/* <Button onClick= {()=>{this.handleModal()}}> open modal </Button>*/}

                    <Modal show={this.state.show} onHide={() => { this.handleModal() }} backdrop="static" keyboard={false} >
                        <Modal.Header > Hi {this.state.user}!! Welcome to our Spotifynd Friends </Modal.Header>
                        <Modal.Body>
                            Before you do anything else, there are a few steps you need to take.
                            1. Go to Settings
                            2. Set your personal location and choose your favorite playlist.
                            The location will help us connect you with people also in your area and the playlist will
                            be displayed to these people!


                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={() => { this.goToSettings() }}>
                                Settings
                        </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <Header props={this.state.access_token} />
                <button onClick={() => this.goToSettings()}>
                    Settings
                  </button>
                <p>This is where user information will be displayed.</p>
                <p>Access Token: {this.state.access_token}</p>
                <p>User ID: {this.state.user}</p>
                <p>Playlists:</p>
                <ul>{playlists}</ul>

                <p>Compatible Users:</p>
                <ul>{list_ofUsers}</ul>

                <div className="sweet-loading">
                    <ScaleLoader
                        css={override}
                        size={5}
                        height={30}
                        width={10}
                        radius={5}
                        //size={"150px"} this also works
                        color={"#36D7B7"}
                        loading={this.state.loading}
                    />
                </div>
                <p>{message}</p>
                <p>{status}</p>
                {details}
                <div>
                    <Doughnut data={this.state.data}
                      width={500}
                      height={500}
                      options={{ 
                          maintainAspectRatio: false,
                          plugins: {
                                    labels: { render: 'label',
                                        fontColor: 'white'}
                          },
                          legend: {
                            display: false
                          }
                      }}
                    />
                </div>
            </div>

        )
    }
};

export default User
