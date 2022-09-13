import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, ButtonGroup } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";
// import logo from "../../static/images/konsol.png"

// import "../../static/_styles.scss" 
const HomePage = () => {
    const navigate = useNavigate()
    const [roomCode, setRoomCode] = useState("");
    
    // issues: home page still renders for a split second.

    // redirect the user to their room if there is one
    useEffect(() => {
        const autoEnter = async() =>{
            fetch('/api/user-in-room')
                .then((response) => response.json())
                .then((data) => {
                    setRoomCode(data.code);
                    console.log("roomCode: ", roomCode);
                    console.log("data.code: ", data.code);
                    if(data.code){
                        navigate('/room/' + data.code)
                    }
                })
        };
        autoEnter()
        
    },[]);

    
    
    return(
        <div className="wrap">
            <div align="center" className="title-image">
                {/* <Typography variant="h3" compact="h3"> */}
                    <img src={"../static/images/konsol.png"} width="232.5" height="66"/>
                {/* </Typography> */}
            </div>
            <div align="center" className="content-wrap">
                <div className="button-container">
                    <Button to="/create" component={Link} className="button" disableRipple>
                        Create a Room
                    </Button>
                    <Button to="/join" component={Link} className="button" disableRipple>
                        Join a Room
                    </Button>

                </div>
            </div>
            
        </div>
    ) 
    
}

export default HomePage