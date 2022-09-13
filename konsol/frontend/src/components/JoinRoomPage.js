import React, { useState } from "react";

import { Grid, Button, Typography, TextField } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";

const JoinRoomPage = (props) => {
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleEnterRoomButtonPressed = async() => {
        const feedBack = await fetch('/api/join-room',{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                code: roomCode
            })
        })

        const JsonFeedBack = await feedBack.json().then((response) =>{
            console.log(response)
            if(response.join){
                setErrorMessage("")
                navigate(`/room/${roomCode}`)
            }
            else{
                setErrorMessage("Room not found.")
            }
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    return(
        <div container spacing={1} alignItems="center">
            <div align="center" className="title-image">
                <img src={"../static/images/join.png"} width="81" height="44"/>
            </div>

            <div align="center" className="input-container">
                <input 
                    error={errorMessage}
                    label = "Code"
                    placeholder="Room code"
                    onChange={(e) => setRoomCode(e.target.value)}
                    helperText={errorMessage}
                    className="form__input"
                />
            </div>
            <div align="center" className="error-message">
                {errorMessage ? errorMessage : null}
            </div>

            <div className="button-container">
                <Button className="button submit" disableRipple onClick={() => handleEnterRoomButtonPressed()}>
                    Enter Room
                </Button>
                <Button className="button cancel" disableRipple to="/" component={Link}>
                    Back
                </Button>
            </div>

        </div>
    ) 
}

export default JoinRoomPage