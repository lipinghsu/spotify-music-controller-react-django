import React, { useState, useEffect} from "react";
import { Grid, Button, Typography, TextField, FormHelperText, FormControl, Radio, RadioGroup, FormControlLabel, Collapse } from "@material-ui/core";
import { Alert } from "@material-ui/lab"
import { Link, useNavigate } from "react-router-dom";


const CreateRoomPage = (props) =>{
    const navigate = useNavigate();
    const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip ? props.votesToSkip : 2);
    const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause ? props.guestCanPause : false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage]= useState("");

    useEffect(() =>{
        document.getElementById("tab-1").checked = true;
    }, [])
    const handleCreateRoomButtonPressed = async() => {
        const feedBack = await fetch('api/create-room',{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause
            })
        })

        const JsonFeedBack = await feedBack.json().then((data) =>{
            navigate('/room/' + data.code)
        })
    }

    const handleUpdateButtonPressed = async() => {
        const feedBack = await fetch('/api/update-room',{
            method: "PATCH",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                votes_to_skip: votesToSkip,
                guest_can_pause: guestCanPause,
                code: props.roomCode
            })
        }).then((response) =>{
            if(response.ok){
                setSuccessMessage("Room updated.")
            }
            else{
                setErrorMessage("Error updating the room.")
            }
            // update components in Room.js
            props.getRoomDetails()
        })
    }

    const title = props.update ? "Update" : "Create";

    return(
        <div align="center">

            <div align="center" className="title-image">
                <img src={"../static/images/create2.png"} width="164.3" height="44"/>
            </div>
            <div item xs={12} align="center">
                <Collapse in={errorMessage != "" || successMessage != ""}>
                    {successMessage != "" ? 
                    <Alert severity="success" onClose={() => {setSuccessMessage("")}}>{successMessage}</Alert>
                    : 
                    <Alert severity="error"   onClose={() => {setErrorMessage("")}}>{errorMessage}</Alert>
                    }
                </Collapse>
            </div>
            <div className="input-container" align="center">
                <input 
                    type="number"
                    placeholder="Enter a number" 
                    required
                    onChange={(e) => setVotesToSkip(e.target.value)}
                    defaultValue= {votesToSkip}
                    className="form__input"
                />
                <FormHelperText>
                    <div align="center">
                        Votes Required To Skip Song
                    </div>
                </FormHelperText>
            </div>

            <div align="center">
                <FormControl component = "fieldset">
                    <div className="radio-button-container" defaultValue={String(guestCanPause)} onChange={(e) => setGuestCanPause(e.target.value)} >
                        <div className="flex-container">
                            <input type="radio" 
                                value="true"
                                className="radio-button"
                                id="tab-1"
                                name="radAnswer"
                            />
                            <label for="tab-1">Play / Pause</label>

                            <input type="radio"   
                                value="false" 
                                className="radio-button"
                                id="tab-2"
                                name="radAnswer"
                            />
                            <label for="tab-2">No Control</label>
                            <div class="segmented-control__color"></div>
                        </div>
                        
                    </div>
                    <FormHelperText>
                        <div align="center">Guest Control of Playback State</div>
                    </FormHelperText>

                </FormControl>
            </div>

            <div className="button-container" align="center">
                <Button className="button submit" disableRipple onClick={() => props.update ? handleUpdateButtonPressed() : handleCreateRoomButtonPressed()}>
                    {title}
                </Button>
                {props.update ?                    
                <Button className="button cancel" disableRipple onClick={() =>props.setShowSettings(false)}>
                    Close
                </Button> 
                :
                <Button className="button cancel" disableRipple to="/" component={Link}>
                    Cancel
                </Button>
                }
            </div>
            
        </div>
    ) 
}


export default CreateRoomPage;