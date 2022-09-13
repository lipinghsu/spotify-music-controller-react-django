import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import MusicPlayer from "./MusicPlayer";
import Settings from "./Settings";
import SettingsIcon from '@material-ui/icons/Settings';
import CloseIcon from '@material-ui/icons/Close';

const Room = (props) => {
    const navigate = useNavigate();
    const { roomCode } = useParams();

    // are these values neccesary?
    const [votesToSkip, setVotesToSkip] = useState(2);
    const [guestCanPause, setGuestCanPause] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const [song, setSong] = useState(null);

    // issues:
    // (1) leave -> switch to another tab still in room -> refresh -> default data shown at /room -> leave page
    // (2) refresh or entering room -> default data shown -> room data fetched then shown
    useEffect(() =>{
        console.log("Room -roomCode:", roomCode);
        getRoomDetails()
        
    }, [])
    useEffect(() =>{
        console.log("votesToSkip:", votesToSkip);
        
    }, [votesToSkip])


    // using this bc the endpoint is only being hit whenever we refresh the page
    // song status can be modified by anyone on the account, we need to constantly check for update
    // (not most efficient method, will most likely be fine for a couple thousand users)
    useEffect(() =>{

        getCurrentSong();
        const interval = setInterval(() => {
            getCurrentSong()
        }, 1000);
        return (() => clearInterval(interval))
    }, [])

    // get, then set room details
    const getRoomDetails = () =>{
        fetch('/api/get-room?code=' + roomCode)
        .then((response) => {
            if(!response.ok){
                // clear room code here, but we dont have a setRoomCode method here
                navigate('/')
            }
            return response.json()
        })
        .then((data) => {
            console.log(data);
            setVotesToSkip(data.votes_to_skip);
            setGuestCanPause(data.guest_can_pause);
            setIsHost(data.is_host);
            if(data.is_host){
                authenticateSpotify()
            }
            
        }).then(() => {
            
        });
    }
    
    const leaveButtonPressed = async() =>{
        console.log("leaveButtonPressed")
        const feedBack = await fetch('/api/leave-room',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
        const JsonFeedBack = await feedBack.json().then((response) =>{
            // clear room code here, but we dont have a setRoomCode method here
            navigate('/')
        })
        
    }

    // issue: user can vote twice if votes_required is 2
    const getCurrentSong = () => {
        fetch('/spotify/current-song').then((response) =>{
            return !response.ok ? {} : response.json();
        }).then((data) => {
            if(data != null){
                setSong(data)
            }
            setVotesToSkip(data.votes_required)
            console.log("data:", data)
            // console.log("song:", song)
        })
    }

    const authenticateSpotify = () => {
        console.log("authenticateSpotify")
        fetch('/spotify/is-authenticated').then((response) => response.json()).then((data) =>{
            setSpotifyAuthenticated(data.status)

            // authenticate the user if they are not authenticated
            if(!data.status){
                fetch('/spotify/get-auth-url').then((response) =>{
                    return response.json()
                }).then((data) => {
                    // redirect user to spotify authorization page (data.url)
                    window.location.replace(data.url);
                })
            } 
        })
    }


    // user vote prev -> host  cannot vote prev
    // user vote next -> host  cannot vote next
    return (
        <>
        {showSettings ? 
        <Settings 
            votesToSkip={votesToSkip} 
            guestCanPause={guestCanPause}
            roomCode={roomCode}
            explicit={song.explicit}
            getRoomDetails={getRoomDetails}
            setShowSettings={setShowSettings}
            
        /> 

        :
        <div align="center" className="music-room">

            {/* <Grid item xs={12} align="center">
                <Typography variant="h5" component="h5">
                    
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes prev: {song ? song.votes_prev : 0} {" "}/ {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Votes next: {song ? song.votes_next : 0} {" "}/ {votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {String(guestCanPause)}
                </Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography variant="h6" component="h6">
                    Host: {String(isHost)}
                </Typography>
            </Grid> */}
            <MusicPlayer {...song} votesToSkip={votesToSkip}/>
            <div className="button-container" align="center">
                {isHost ? 
                <IconButton className="icon-button submit settings" disableRipple 
                    onClick={() =>setShowSettings(true)}>
                    <SettingsIcon />
                </IconButton>
                : null}
                <IconButton className="icon-button cancel close" disableRipple 
                    onClick={() =>(leaveButtonPressed())}>
                    <CloseIcon />
                </IconButton>
            </div>
            <div className="room-code-wrap">
                <div className="room-code">
                    Room Code: {roomCode}
                </div>
            </div>
        </div>
        }
        
        </>
    );

}


export default Room;