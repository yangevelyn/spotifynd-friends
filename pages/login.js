import React, { Component } from 'react'
import Router from 'next/router'
import PacmanLoader from "react-spinners/PacmanLoader"
import Container from 'react-bootstrap/Container'

var request = require('request')
var client_id = '2923d79235804ea58633989710346f3d';
var client_secret = 'd4813d196edf4940b58ba0aeedbf9ebc';
var redirect_uri = 'https://spotifynd-friends.herokuapp.com/login';


class Login extends Component{
    constructor(props){
        super(props);
        this.state = {
            access_token: '',
            loading: true

        }
    }

    componentDidMount = () => {

        let url = window.location.href;
        if(url.indexOf('localhost') > -1){
            redirect_uri = 'http://localhost:3000/login'
        }
        let code = url.split('code=')[1].split("&")[0].trim();
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        var authOptions = {
          url: proxyurl + 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
          json: true
        };

        request.post(authOptions, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            window.sessionStorage.access_token = body.access_token;
            this.setState({
              loading:false
            })
            Router.push({pathname: '/user'});
          }
        });
    }

    render(){
        return(
            <div className = "testclass" aling = 'center' class ='container-fluid'>
            <style jsx>{`

                .body {
                    background: linear-gradient(to bottom, #373737 0%, #191414 50%);
                    font-family: Montserrat;

                }



                `}</style>
          <head>

              <link
                rel="stylesheet"
                href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
                crossorigin="anonymous"
              />

          </head>
          <body>
          <Container className = "testclass">
              <PacmanLoader

                  size={100}
                  height={30}
                  width={10}
                  radius={5}
                  //size={"150px"} this also works
                  color={"#1DB954"}
                  loading={this.state.loading}
                  />



          </Container>

          </body>
            </div>
        )
    }
}

export default Login;
