import React, { useState, useEffect } from 'react';

const AppointmentsByDateViewDoctor = () => {

    // State variables
    const [appointments, setAppointments] = useState([]);
    const [showAppointments, setShowAppointments] = useState(false);
    const [date, setDate] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitClicked, setIsSubmitClicked] = useState(false);
    const [isDataFetched, setIsDataFetched] = useState(false);

    const buildFetchUrl = (chosenDate) => {
        return `http://localhost:5000/doctor/filterAppointmentsByDateForDoctor/filter?date=${chosenDate}`;
    };

    // useEffect hook to fetch appointments when showAppointments is true
    useEffect(() => {
        if (showAppointments && isSubmitClicked && !isDataFetched) {
            filterAppointmentsByDate(date);
        }
    }, [showAppointments, date, isSubmitClicked, isDataFetched]);

    const resetIsSubmitClicked = () => {
        setIsSubmitClicked(false);
    };
    // function to filter appointments by status
    const filterAppointmentsByDate = async (chosenDate) => {
        setMessage('');
        const response = await fetch(buildFetchUrl(chosenDate), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            setAppointments(data);
            if (data.length === 0) {
                setMessage('No appointments found for the entered date');
            }
        } else {
            throw new Error('Error filtering appointments by date');
        }

        setIsDataFetched(true);

        resetIsSubmitClicked();

    };

    // function to handle form submit
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Get the chosen status from the state
        const chosenDate = date;
        setIsSubmitClicked(true);
        setIsDataFetched(false);

        // Fetch the appointments
        await filterAppointmentsByDate(chosenDate);

        // Set showAppointments to true
        setShowAppointments(true);
    };

    // Render the component
    return (
        <div>
            <h1>Filter Appointments by Date</h1>


            <form onSubmit={handleSubmit}>
                <h2>Enter Date        :

                    <input
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}

                    />
                    <button type="submit">Filter</button>
                </h2>


            </form>
            {message && <p>{message}</p>}
            {isDataFetched && showAppointments && appointments.map((appointment) => (
                <p key={appointment._id}>
                    <h2>Patient:{appointment.patient_username}</h2>
                    <p>Doctor: {appointment.doctor_username}</p>
                    <p>Date: {appointment.date}</p>
                    <p>Status: {appointment.status}</p>
                </p>
            ))}
        </div>
    );
};

export default AppointmentsByDateViewDoctor;