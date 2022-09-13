import React from "react";
import { useParams } from "react-router-dom";  
import { Grid, Button } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import CreateRoomPage from "./CreateRoomPage";

const Settings = (props) => {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <CreateRoomPage
                    update={true}
                    votesToSkip={props.votesToSkip}
                    guestCanPause={props.guestCanPause}
                    roomCode={props.roomCode}
                    getRoomDetails={props.getRoomDetails}
                    setShowSettings = {props.setShowSettings}
                />
            </Grid>

        </Grid>
    );

}


export default Settings;