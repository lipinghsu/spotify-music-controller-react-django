import React from "react";
import { Grid, Typography, Card, IconButton, LinearProgress} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";

import SkipPrevious from "@material-ui/icons/SkipPrevious";
import { CircularProgressbar } from 'react-circular-progressbar';
import ExplicitIcon from '@material-ui/icons/Explicit';

const MusicPlayer = ({votesToSkip, ...song}) =>{

    const songProgress = (song.time / song.duration) * 100;
    console.log(songProgress);
    const pauseSong = () =>{
        fetch('/spotify/pause',{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }
    const playSong = () =>{
        fetch('/spotify/play',{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    const skipToNext = () =>{
        fetch('/spotify/skip-to-next',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }
    const skipToPrev = () =>{
        fetch('/spotify/skip-to-previous',{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })
    }

    return (
        <div alignItems="center">
            <div className="song-album-name">
                {song.album_name}
            </div>
            <div align="center" className="album-image-container">
                <img src={song.image_url} className="album-image"/>
            </div>

            <div className="song-detail-wrap">
                <div className="song-title">
                    {song.title}
                </div>
                <div className="song-artist">
                    {song.artist}
                </div>

                
                {/* <div className="icon-button-wrap">
                    <IconButton className="icon-button control" disableRipple onClick={() => skipToPrev()}>
                        <SkipPrevious />
                    </IconButton>    
                    <IconButton className= {props.is_playing ? "icon-button control play" : "icon-button control"} 
                    
                    disableRipple onClick={() => {props.is_playing ? pauseSong() : playSong()}}>
                        {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton className="icon-button control" disableRipple onClick={() => skipToNext()}>
                        <SkipNextIcon />
                    </IconButton>
                </div> */}
                <div className="icon-button-wrap">
                    <div className="circle-wrap">
                        <div className="outer-circle">
                            <div className="inner-circle">
                                <IconButton className="icon-button control" disableRipple onClick={() => skipToPrev()}>
                                    <SkipPrevious />
                                </IconButton>  
                                <CircularProgressbar value={song.votes_prev/votesToSkip * 100} strokeWidth="10"/>
                            </div>
                        </div>
                    </div> 
                    <IconButton className= {song.is_playing ? "icon-button control play" : "icon-button control"} 
                        disableRipple onClick={() => {props.is_playing ? pauseSong() : playSong()}}>
                        {song.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <div className="circle-wrap">
                        <div className="outer-circle">
                            <div className="inner-circle">
                                <IconButton className="icon-button control" disableRipple onClick={() => skipToNext()}>
                                    <SkipNextIcon />
                                </IconButton>
                                <CircularProgressbar value={song.votes_next/votesToSkip * 100} strokeWidth="10"/>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>


                <div className="progress-bar-wrap">
                    <div className="progress-bar"></div>
                    <div className="progress-bar progress" style={{ width: songProgress / 100 * 384 }}></div>
                </div>
            </div>
        </div>
    );
}
export default MusicPlayer;