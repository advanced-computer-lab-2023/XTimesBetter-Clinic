import React, { useState, useEffect } from 'react';
import styles from './BookingFormPage.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

// Axios
import axios from 'axios';

const BookAppointmentForm = () => {
    const location = useLocation();
    const appointment = location.state;
    console.log("app Info" , appointment)

    const patient_username = appointment.currentPatient;
    const doctor_username = appointment.doctorUsername;
    const selectedAppointmentDate = appointment.bookAppointment.date;
    const selectedAppointmentTime = appointment.bookAppointment.dateTimeCombined;
    

    const [unlinkedfamilyMembers, setUnlinkedFamilyMembers] = useState([]);
    const [selectedOption, setSelectedOption] = useState('self');
    const [selectedUnlinkedFamilyMember, setSelectedUnlinkedFamilyMember] = useState('')

    const [linkedfamilyMembers, setLinkedFamilyMembers] = useState([]);
    //const [selectedOption2, setSelectedOption2] = useState('self');
    const [selectedLinkedFamilyMember, setSelectedLinkedFamilyMember] = useState('')
    
    const [doctors, setDoctors] = useState([]);
    const [username, setUsername] = useState('');


    const navigate = useNavigate();
    const accessToken = sessionStorage.getItem('accessToken');

    async function checkAuthentication() {
        await axios ({
            method: 'get',
            url: `http://localhost:5000/authentication/checkAccessToken`,
            headers: {
                "Content-Type": "application/json",
                'Authorization': accessToken,
                'User-type': 'patient',
            },
        })
        .then((response) => {
            console.log(response);
            setUsername(response.data.username);
        })
        .catch((error) => {
          navigate('/login');
        });
    }

    checkAuthentication();

    useEffect(() => {
        const fetchUnlinkedFamilyMembers = async () => {
            const response = await fetch(`http://localhost:5000/patient/viewFamilyMembers//UnlinkedFamilyMembers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken,
                },
            });

            const familyMembers = await response.json();
            if (response.ok) {
                setUnlinkedFamilyMembers(familyMembers);
            }
        };
        fetchUnlinkedFamilyMembers();
    }, [patient_username]);

    useEffect(() => {
        const fetchLinkedFamilyMembers = async () => {
            const response = await fetch(`http://localhost:5000/patient/viewFamilyMembers/LinkedFamilyMembers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': accessToken,
                },
            });
            const familyMembers = await response.json();
            if (response.ok) {
                setLinkedFamilyMembers(familyMembers);
            }
        };
        fetchLinkedFamilyMembers();
    }, [patient_username]);

    const handlePatientAppointmentChange = (patientType) => {
        setSelectedOption(patientType);
        setSelectedUnlinkedFamilyMember(''); // Reset selected family member when changing patient type
    };

    const handleFamilyMemberChange = (event) => {
        setSelectedUnlinkedFamilyMember(event.target.value);
    };

    const handleLinkedFamilyMemberChange = (event) => {
        setSelectedLinkedFamilyMember(event.target.value);
    };

    

    const submitAppointment = async () => {

        const appointmentData = {
            doctor_username: appointment.doctorUsername ,
            patient_username: username,
            date: appointment.bookAppointment.date,
            time: appointment.bookAppointment.appointment,
            // To be edited to include the patient name , which in this case is the currently logged in client
            name: "Ahmed Ahmed" ,
            price: appointment.hourly_rate,
            booked_by: username
        };

        console.log("appointment data",appointmentData)

        try {
            const response = await fetch('http://localhost:5000/patient/appointment/createAppointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Network error:', error.message);
        }
    } 

    const submitUnlinkedFamilyMemberAppointment = async () => {
        const selectedMember = unlinkedfamilyMembers.find((member) => member.national_id === selectedUnlinkedFamilyMember);

        let fmNationalID , fmName ;
        if ( selectedMember ) {
            fmNationalID = selectedMember.national_id;
            fmName = selectedMember.name;
        }
        
        const appointmentData = {
            doctor_username: appointment.doctorUsername ,
            patient_username: fmNationalID,
            date: appointment.bookAppointment.date,
            time: appointment.bookAppointment.appointment,
            name:  fmName,
            price: appointment.hourly_rate,
            booked_by: username
        };

        console.log(appointmentData)
        try {
            const response = await fetch('http://localhost:5000/patient/appointment/createAppointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Network error:', error.message);
        }
    } 

    const submitLinkedFamilyMemberAppointment = async () => {
        const selectedMember = linkedfamilyMembers.find((member) => member.username === selectedLinkedFamilyMember);

        let linkedfmUsername , linkedfmName ;
        if ( selectedMember ) {
            linkedfmUsername = selectedMember.username;
            linkedfmName = selectedMember.name;
        }
        
        const appointmentData = {
            doctor_username: appointment.doctorUsername ,
            patient_username: linkedfmUsername,
            date: appointment.bookAppointment.date,
            time: appointment.bookAppointment.appointment,
            name:  linkedfmName,
            price: appointment.hourly_rate,
            booked_by: username
        };

        console.log(appointmentData)
        try {
            const response = await fetch('http://localhost:5000/patient/appointment/createAppointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData.message);
            }
        } catch (error) {
            console.error('Network error:', error.message);
        }
    }
    
    const handleSubmit = () => {
        if (selectedOption === 'self') {
            submitAppointment();
            console.log('Appointment Details for Self:', appointment);
            window.alert('Appointment successfully added!');
        } else  if (selectedOption === 'family'){
            // Add appointment for a family member
            submitUnlinkedFamilyMemberAppointment();
            console.log('Appointment Details for Family Member:', appointment, 'Selected Family Member:', selectedUnlinkedFamilyMember);
            window.alert('Appointment successfully added!');
        }  else {
            // Add appointment for a linked family member
            submitLinkedFamilyMemberAppointment();
            console.log('Appointment Details for Family Member:', appointment, 'Selected Family Member:', selectedUnlinkedFamilyMember);
            window.alert('Appointment successfully added!');
        }

        const stateInfo = {
            appointmentDate : appointment.bookAppointment.date ,
            doctorName: appointment.doctorName ,
            appointmentPrice : appointment.hourly_rate.toFixed(2) ,
            patient_username : username
          }
            
        navigate('/patient/appointmentPayment', { state: stateInfo });

        console.log("State Info", stateInfo)
    };
    

    return (
        <div>
            <h1>Book Appointment</h1>
            <div className={styles['appointment-patient-container']}>
            <h2 className={styles['h2-book']}> Doctor Name : </h2>
                <h3> {appointment.doctorName}</h3>

                <h2 className={styles['h2-book']}> Appointment Date : </h2>
                <h3> {appointment.bookAppointment.weekday}, {appointment.bookAppointment.date}</h3>

                <h2 className={styles['h2-book']}> Appointment Time :  </h2>
                <h3> {appointment.bookAppointment.combinedTime}</h3>

                <h2 className={styles['h2-book']}> Hourly Rate :  </h2>
                <h3> {appointment.hourly_rate.toFixed(2)}</h3>

                <h2 className={styles['h2-book']}>Book For : </h2>
                <label>
                    <input
                        type="radio"
                        name="appointmentOption"
                        value="self"
                        checked={selectedOption === 'self'}
                        onChange={() => handlePatientAppointmentChange('self')}
                    />
                    Myself
                </label>
                <label>
                    <input
                        type="radio"
                        name="appointmentOption"
                        value="family"
                        checked={selectedOption === 'family'}
                        onChange={() => handlePatientAppointmentChange('family')}
                    />
                    Family Member
                </label>
                <label>
                    <input
                        type="radio"
                        name="appointmentOption"
                        value="linkedfamily"
                        checked={selectedOption === 'linkedfamily'}
                        onChange={() => handlePatientAppointmentChange('linkedfamily')}
                    />
                    Existing Family Member
                </label>

                {selectedOption === 'family' && (
                    <div>
                        <h2 className={styles['h2-book']} >
                            Select Family Member:
                            <select style={{marginLeft: '20px'}}
                                value={selectedUnlinkedFamilyMember}
                                onChange={handleFamilyMemberChange}
                            >   
                                <option value="">Select a family member</option>
                                {unlinkedfamilyMembers.map((member) => (
                                    <option key={member._id} value={member.national_id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </h2>
                    </div>
                )}
                {selectedOption === 'linkedfamily' && (
                    <div>
                        <h2 className={styles['h2-book']} >
                            Select Existing Family Member:
                            <select style={{marginLeft: '20px'}}
                                value={selectedLinkedFamilyMember}
                                onChange={handleLinkedFamilyMemberChange}
                            >   
                                <option value="">Select a family member</option>
                                {linkedfamilyMembers.map((member) => (
                                    <option key={member._id} value={member.username}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </h2>
                    </div>
                )}
                <br></br>
                <button className={styles['button-2']} onClick={handleSubmit}>
                    Book
                </button>
            </div>
        </div>
    );
};

export default BookAppointmentForm;