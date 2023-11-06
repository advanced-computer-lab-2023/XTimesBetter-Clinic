import * as React from 'react';

// Axios
import axios from 'axios';

// Styles
import styles from './sendOtpPage.module.css';

// Hooks
import { useState } from 'react';

// React Router Hooks
import { useNavigate } from 'react-router-dom';

// User Defined Hooks
import { useRecoveryContext } from '../../../components/hooks/useAuth';


export const SendOtpPage = () => {
    const {otp, setOTP, email, setEmail} = useRecoveryContext();
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();

    function sendOtp() {
        if (userEmail) {
            axios.get(`http://localhost:5000/resetPassword/checkEmail?email=${userEmail}`)
            .then((response) => {
                if (response.status === 200) {
                    // generate the OTP
                    const OTP = Math.floor(Math.random() * 9000 + 1000);
                    console.log(OTP);
                    // change the global value of the otp in the RecoveryContext Provider
                    setOTP(OTP);
                    // change the global value of the email in the RecoveryContext Provider
                    setEmail(userEmail);
                    console.log(userEmail);

                    axios.post("http://localhost:5000/resetPassword/sendEmail", {
                        otp: OTP,
                        recipientEmail: userEmail,
                    })
                    .then(() => navigate('/verifyOTP'))
                    .catch((error) => {console.log(error)})
                }
                else {
                    alert("User with this email does not exist!");
                    console.log(response.data.message);
                }})
                .catch((error) => {console.log(error)});
        }
        else {
            alert("Please enter your email");
        }
    }

    function handleEmailChange(event) {
        setUserEmail(event.target.value);
    }

    return (
        <div className={styles['send-otp-main-div']}>
            <div className={styles['send-otp-sub1-div']}>
                <div className={styles['send-otp-label-div']}>
                    <label className={styles['send-otp-label']}>Enter your email</label>
                </div>
                <div className={styles['send-otp-input-div']}>
                    <input className={styles['send-otp-input']} value={userEmail} placeholder="email@gmail.com" type="text" onChange={handleEmailChange}></input>
                </div>
            </div>
            <div className={styles['send-otp-sub2-div']}>
                <button className={styles['send-otp-button']} onClick={sendOtp}></button>
            </div>
        </div>
    );
}