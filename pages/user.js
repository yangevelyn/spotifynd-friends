import React, { Component } from 'react'
import Router from 'next/router'

var querystring = require('querystring');
var request = require('request')
var axios = require("axios");
var client_id = '2923d79235804ea58633989710346f3d';
var client_secret = 'd4813d196edf4940b58ba0aeedbf9ebc';
var redirect_uri = 'https://spotifynd-friends.herokuapp.com/';
var scope = 'user-read-private user-read-email playlist-read-private';
var top100 = '37i9dQZF1DXcBWIGoYBM5M';


class User extends Component{
    constructor(props) {
        super(props);
        this.state = {
          access_token: this.props.url.query.access_token,
          refresh_token: '',
          user: '',
          playlists: [],
          playlist: null,
          playlistName: '',
          playlistDescription: '',
          playlistTracks: [],
          top100tracknames: [],
          playlisttracknames: [],
          count: -1,
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
          attributeScore: -1
        }
    }

    componentDidMount = () => {
        this.getUserPlaylists();
        this.get100();
    }

    getUserPlaylists = () => {
        let url = window.location.href;
        if(url.indexOf('localhost') > -1){
            redirect_uri = 'http://localhost:3000/index'
        }
        if (url.indexOf('token') > -1) {
            let access_token = url.split('token=')[1];

            this.setState({access_token})

            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };

            // use the access token to access the Spotify Web API
            request.get(options, (error, response, body) => {
                console.log('Access token:' + access_token)
                console.log(body);
                this.setState({user: body.id})
                console.log('user: ' + this.state.user)
                var playlistOptions = {
                    url: 'https://api.spotify.com/v1/users/' + this.state.user + '/playlists',
                    qs: {limit: '10'},
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                console.log('user right before playlist: ' + this.state.user)

                // use the access token to access the Spotify Web API
                request.get(playlistOptions, (error, response, body) => {
                    console.log(body);
                    this.setState({playlists: body.items})
                    for(var i = 0; i < this.state.playlists.length; i++){
                        this.state.playlists[i].key = i.id
                        console.log(this.state.playlists[i].key)
                    }
                    console.log('this.state.playlists' + this.state.playlists)
                });
            });

        }
    }
    assignPlaylistTracksName = (items) => {
        if(typeof(items) != 'undefined'){
            if(items != 0){
                this.state.playlisttracknames = items.map((i) =>
                <li>{i.track.id}</li>
                )
            }else{
                this.state.playlisttracknames = <p>No playlists to display</p>
            }
        }
    }
    assignTrackFeatures = (items) => {
        if(typeof(items) != 'undefined'){
            if(items != 0){
                this.state.trackFeatures = items.map((i) =>
                <li>{i.track.id}</li>
                )
            }else{
                this.state.playlisttracknames = <p>No playlists to display</p>
            }
        }
    }
    getAudioFeatures = async (options) => {
        await axios(options)
            .then((body) => {
                this.state.trackFeatures = body;
            });
    }
    /*const user_account = async (access_token) => {

        const user = await axios.get("https://api.spotify.com/v1/me", {
          header: {
            "Authorization": "Bearer " + access_token
          }
        })
        .then(response => {
      
          // Return the full details of the user.
          return response;
      
        })
        .catch(err => {
          throw Boom.badRequest(err);
        });
      
        return user;
      }*/
    
    comparePlaylists = async () => {
        //clear arrays
        this.setState({trackFeatures: [],
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
            compatibility: 'generating'})
        //create arrays with selected playlist attributes
        for(let i = 0; i < this.state.playlisttracknames.length; i++){
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
                this.setState({ trackFeatures: [...this.state.trackFeatures, body.data]})          
                console.log(this.state.trackFeatures);
            });
            /*request.get(audioFeaturesOptions, (error, response, body) => {
                this.state.trackFeatures = body;*/

                await axios(trackOptions)      
                .then((body) => {
                    if(body.data.artists != 0){
                        this.setState({ artistID: [...this.state.artistID, body.data.artists[0].id],
                                        artist: [...this.state.artist, body.data.artists[0].name],
                                        name: [...this.state.name, body.data.name]}) 
                        console.log(this.state.artistID);
                        /*request.get(artistOptions, (error, response, body) => {
                            this.state.genres = body.name;
                            /*this.state.genres = body.genres.map((i) =>
                            <li>{i}</li>)*
                            console.log('genres')
                            console.log(this.state.genres)
                        });*/
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
                        this.setState({ genres: [...this.state.genres, body.data.genres]}) 
                        /*this.state.genres = body.genres.map((i) =>
                        <li>{i}</li>)*/
                        console.log(this.state.genres)
                    });
                /*request.get(trackOptions, (error, response, body) => {
                    if(body.artists != 0){
                        var artistID = body.artists[0].id;
                        console.log(artistID);
                        var artistOptions = {
                            url: `https://api.spotify.com/v1/artists/${artistID}`,
                            headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                            json: true
                        };
                        request.get(artistOptions, (error, response, body) => {
                            this.state.genres = body.name;
                            /*this.state.genres = body.genres.map((i) =>
                            <li>{i}</li>)*
                            console.log('genres')
                            console.log(this.state.genres)
                        });*/
                    //}
            }
            //create arrays for top100playlist attributes
            for(let j = 0; j < this.state.top100tracknames.length; j++){
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
                    this.setState({ top100trackFeatures: [...this.state.top100trackFeatures, body.data]}) 
                });
                //*request.get(audioFeaturesOptions, (error, response, body) => {
                console.log(this.state.top100trackFeatures);
                    await axios(trackOptions)      
                    .then((body) => {
                        if(body.data.artists != 0){
                            this.setState({ top100artistID: [...this.state.top100artistID, body.data.artists[0].id],
                                            top100artist: [...this.state.top100artist, body.data.artists[0].name],
                                            top100name: [...this.state.top100name, body.data.name]}) 
                            console.log(this.state.top100artistID);
                            /*request.get(artistOptions, (error, response, body) => {
                                this.state.genres = body.name;
                                /*this.state.genres = body.genres.map((i) =>
                                <li>{i}</li>)*
                                console.log('genres')
                                console.log(this.state.genres)
                            });*/
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
                            this.setState({ top100genres: [...this.state.top100genres, body.data.genres]}) 
                            /*this.state.genres = body.genres.map((i) =>
                            <li>{i}</li>)*/
                            console.log(this.state.top100genres)
                        });
                    /*request.get(trackOptions, (error, response, body) => {
                        if(body.artists != 0){
                            var artistID = body.artists[0].id;
                            console.log(artistID);
                            var artistOptions = {
                                url: `https://api.spotify.com/v1/artists/${artistID}`,
                                headers: { 'Authorization': 'Bearer ' + this.state.access_token },
                                json: true
                            };
                            request.get(artistOptions, (error, response, body) => {
                                this.state.genres = body.name;
                                /*this.state.genres = body.genres.map((i) =>
                                <li>{i}</li>)*
                                console.log('genres')
                                console.log(this.state.genres)
                            });*/
                        //}
                /*if(this.state.playlisttracknames[i].props.children == this.state.top100tracknames[j].props.children){
                    c++;
                }*/
        }
        var totalDifferenceScore = 0;
        var danceabilityScore = 0, energyScore=0, speachinessScore=0, acousticnessScore=0, instrumentalnessScore=0, livenessScore=0, valenceScore = 0;
        for(let i = 0; i < this.state.playlisttracknames.length; i++){
            console.log('calculating')
            var songDifferenceScore = 0;
            for(let j = 0; j < this.state.top100tracknames.length; j++){
                var differenceScore = 0;
                danceabilityScore += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability)*10
                energyScore += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy)*10
                //speachinessScore += Math.abs(this.state.trackFeatures[i].speachiness - this.state.top100trackFeatures[j].speachiness)*10
                acousticnessScore += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness)*10
                instrumentalnessScore += Math.abs(this.state.trackFeatures[i].instrumentalness - this.state.top100trackFeatures[j].instrumentalness)*10
                livenessScore += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness)*10
                valenceScore += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].danceability - this.state.top100trackFeatures[j].danceability)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].energy - this.state.top100trackFeatures[j].energy)*10
                //differenceScore += Math.abs(this.state.trackFeatures[i].speachiness - this.state.top100trackFeatures[j].speachiness)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].acousticness - this.state.top100trackFeatures[j].acousticness)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].instrumentalness - this.state.top100trackFeatures[j].instrumentalness)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].liveness - this.state.top100trackFeatures[j].liveness)*10
                differenceScore += Math.abs(this.state.trackFeatures[i].valence - this.state.top100trackFeatures[j].valence)*10
                if(this.state.artistID[i] == this.state.top100artistID[j])
                    differenceScore += 10
                for(let k = 0; k < this.state.genres[i].length; k++){
                    let found = false;
                    for(let l = 0; l < this.state.top100genres[i].length; l++){
                        if(this.state.genres[i][k] == this.state.top100genres[i][l]){
                            differenceScore += 30
                            found = true;
                            break;
                        }
                    }
                    if(found == true)
                        break;
                }
                songDifferenceScore += differenceScore;
                //console.log(songDifferenceScore) 
            }
            songDifferenceScore /= this.state.top100trackFeatures.length;              
            if(songDifferenceScore > this.state.max){
                this.state.max = songDifferenceScore
                this.state.mostCompatibleIndex = i
            }
            totalDifferenceScore += songDifferenceScore;
        }
        if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==danceabilityScore){
            danceabilityScore = 100 - (danceabilityScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            //console.log(`These playlists are `+ danceabilityScore + `% compatible by danceability.`)
            this.state.attribute = "danceability"
            this.state.attributeScore = Math.trunc(danceabilityScore)
        }else if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==energyScore){
            energyScore = 100 - (energyScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            this.state.attribute = "energy"
            this.state.attributeScore = Math.trunc(energyScore)
            //console.log(`These playlists are `+ energyScore + `% compatible by energy.`)
        }//else if(Math.min(danceabilityScore,energyScore,speachinessScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==speachinessScore){
           // speachinessScore = 100 - (speachinessScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
           // console.log(`These playlists are `+ speachinessScore + `% compatible by danceability.`)
        else if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==acousticnessScore){
            acousticnessScore = 100 - (acousticnessScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            //console.log(`These playlists are `+ acousticnessScore + `% compatible by danceability.`)
            this.state.attribute = "acousticness"
            this.state.attributeScore = Math.trunc(acousticnessScore)
        }else if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==instrumentalnessScore){
            instrumentalnessScore = 100 - (instrumentalnessScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            //console.log(`These playlists are `+ instrumentalnessScore + `% compatible by danceability.`)
            this.state.attribute = "instrumentalness"
            this.state.attributeScore = Math.trunc(instrumentalnessScore)
        }else if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==livenessScore){
            livenessScore = 100 - (livenessScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            this.state.attribute = "liveness"
            this.state.attributeScore = Math.trunc(livenessScore)
            //console.log(`These playlists are `+ livenessScore + `% compatible by danceability.`)
        }else if(Math.min(danceabilityScore,energyScore,acousticnessScore,instrumentalnessScore,livenessScore,valenceScore)==valenceScore){
            valenceScore = 100 - (valenceScore*100)/(this.state.playlisttracknames.length*this.state.top100tracknames.length)
            this.state.attribute = "valence"
            this.state.attributeScore = Math.trunc(valenceScore)
            //console.log(`These playlists are `+ valenceScore + `% compatible by danceability.`)
        }
        console.log('done')
        this.state.max = Math.trunc(this.state.max)
        this.setState({compatibility: Math.trunc(100 - totalDifferenceScore/(this.state.playlisttracknames.length))})
        console.log(this.state.compatibility)
    }
    
    getPlaylistTracks = (i) => {
        console.log(this.state.playlists[i].tracks.href)
        var tracksOptions = {
            url: this.state.playlists[i].tracks.href,
            headers: { 'Authorization': 'Bearer ' + this.state.access_token },
            json: true
        };

        console.log('user right before tracks request: ' + this.state.user)

        // use the access token to access the Spotify Web API
        request.get(tracksOptions, (error, response, body) => {
            console.log(body);
            // this.setState({playlists: body.items})
            // for(var i = 0; i < this.state.playlists.length; i++){
            //     this.state.playlists[i].key = i.id
            //     console.log(this.state.playlists[i].key)
            // }
            console.log('this.state.playlists' + this.state.playlists)
            this.assignPlaylistTracksName(body.items);
            this.comparePlaylists();
            /*console.log(body.items);    
            console.log(this.state.count);
            console.log(this.state.playlisttracknames);*/
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
      console.log("This is the new access_token"+ this.state.access_token);
    } 

    get100 = () =>{
      //if(this.state.access_token == undefined){
      //  console.log("Is undefined");
      //  this.refresh();
      //}
      let url = window.location.href;
      if(url.indexOf('localhost') > -1){
          redirect_uri = 'http://localhost:3000/index'
      }
      if (url.indexOf('token') > -1) {
          let access_token = url.split('token=')[1];

          this.setState({access_token})

          var options  = {
            url: 'https://api.spotify.com/v1/playlists/'+ top100,
            headers: { 'Authorization': 'Bearer ' + this.state.access_token },
            json:true
          };

          request.get(options, (error, response, body) =>{
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
      if(typeof(this.state.playlistTracks) != 'undefined'){
           if(this.state.playlistTracks != 0){
               this.state.top100tracknames = this.state.playlistTracks.map((i) =>
               <li>{i.track.id}</li>
               )
           }else{
               this.state.top100tracknames= <p>No playlists to display</p>
           }
       }
    };

    goToSettings = () => {
        let access_token = this.state.access_token;
        Router.push({
            pathname: '/settings',
            query: { access_token } 
        })
    }

    render(){
        let playlists;
        if(typeof(this.state.playlists) != 'undefined'){
            if(this.state.playlists.length != 0){
                playlists = this.state.playlists.map((i, index) =>
                <div>
                    <li>
                        {i.name}
                        <button onClick={() => this.getPlaylistTracks(index)}>
                            Select
                        </button>
                    </li>
                </div>
                )
            }else{
                playlists = <p>No playlists to display</p>
            }
        }
        this.assigntop100tracknames();
        var message = ''
        if(this.state.compatibility < 0){
            message = ''
        }else if((this.state.compatibility) == 'generating'){
            message = `Generating compatibility!`
        }else if(this.state.compatibility > 0){
            message = `These playlists are ${this.state.compatibility}% compatible!`
            message += `\nThese playlists are most compatible in terms of ${this.state.attribute} by ${this.state.attributeScore}%.`
            message += "\n" + this.state.name[this.state.mostCompatibleIndex] + " by " + this.state.artist[this.state.mostCompatibleIndex] + ` is the most compatible song by ${this.state.max}%.` 
        }
        

        return (
            <div>
                <button onClick={() => this.goToSettings()}>
                    Settings
                </button>
                <p>This is where user information will be displayed.</p>
                <p>Access Token: {this.state.access_token}</p>
                <p>User ID: {this.state.user}</p>
                <p>Playlists:</p>
                <ul>{playlists}</ul>
                <p>{message}</p>
            </div>
        )
    }
};

export default User