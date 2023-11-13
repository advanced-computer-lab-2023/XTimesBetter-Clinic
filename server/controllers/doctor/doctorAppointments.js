const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const appointmentModel = require('../../models/Appointment.js');
const doctorModel = require('../../models/Doctor.js')
const followUpModel = require('../../models/FollowUp.js')
const patientModel = require('../../models/Patient.js')

const viewAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Can't get your appoinntments" });
    }
}

const getUpcomingAppointments = asyncHandler( async (req, res) => 
{
    const doctor = await doctorModel.findOne({
        username: req.body.username,
    });
    if (!doctor) {
        return res.status(404).json('ss');
    }
    const upcomingAppointments = await appointmentModel.find({doctor_username: doctor.username , status:"upcoming"});
    res.status(200).json(upcomingAppointments);
});

const getPastAppointments = asyncHandler( async (req, res) => 
{
    const doctor = await doctorModel.findOne({
        username: req.body.username,
    });
    if (!doctor) {
        return res.status(404).json('ss');
    }
    const upcomingAppointments = await appointmentModel.find({doctor_username: doctor.username , status:"completed"});
    res.status(200).json(upcomingAppointments);
});

/*const scheduleFollowUpAppointment = asyncHandler(async (req, res) => {
    try {
      const { patientUsername, doctorUsername, date, time } = req.body;
  
      // Validate input (add more validation if needed)
  
      // Check if the doctor exists
      const doctor = await doctorModel.findOne({ username: doctorUsername });
      if (!doctor) {
        return res.status(400).json({ message: 'Doctor not found' });
      }
  
      // Check if the patient already has an appointment at the specified time
      const existingAppointment = await appointmentModel.findOne({
        patient_username: patientUsername,
        date,
        time,
      });
  
      if (existingAppointment) {
        return res.status(400).json({ message: 'Patient already has an appointment at this time' });
      }
  
      // Create a new follow-up appointment
      const newFollowUpAppointment = new appointmentModel({
        doctor_username: doctorUsername,
        patient_username: patientUsername,
        date,
        time,
        status: 'upcoming',
      });
  
      // Save the appointment
      await newFollowUpAppointment.save();
  
      // Optionally, update the doctor's available time slots, if needed
  
      return res.status(201).json({ message: 'Follow-up appointment scheduled successfully', appointment: newFollowUpAppointment });
    } catch (error) {
      console.error('Error scheduling follow-up appointment:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });*/

  const scheduleFollowUpAppointment = asyncHandler(async (req, res) => {
    const appointment = req.body;

    if (
        appointment.doctor_username === undefined ||
        appointment.patient_username === undefined ||
        appointment.appointmentDateTime === undefined ||
        appointment.followUpDateTime === undefined
    ) {
        res.status(400).json({
            message: 'Please provide doctor username, patient username, and appointment date',
            createdAppointment: false
        });
        return;
    }

    const doctor = await doctorModel.findOne({ username: appointment.doctor_username });
    const patient = await patientModel.findOne({ username: appointment.patient_username });

    if (!patient) {
        res.status(400).json({ message: 'Patient not found', createdAppointment: false });
        return;
    }

    const followUpDateTime = new Date(appointment.followUpDateTime);
    const currentDate = new Date();

    // Check if followUpDateTime is earlier than the current date and time
    if (followUpDateTime < currentDate) {
        res.status(400).json({
            message: 'Appointment date and time are in the past',
            createdAppointment: false
        });
        return;
    }

    // Check for duplicate follow-up appointments
    const existingFollowUp = await followUpModel.findOne({
        doctor_username: appointment.doctor_username,
        patient_username: appointment.patient_username,
        appointmentDateTime: appointment.appointmentDateTime,
        followUpDateTime: appointment.followUpDateTime
    });

    if (existingFollowUp) {
        const errorMessage = 'Duplicate follow-up appointment found';
        console.log(errorMessage); // Log the error message
        res.status(400).json({ message: errorMessage, createdAppointment: false });
        return;
    }

    appointment.status = "pending";

    const newAppointment = await followUpModel.create(appointment);

    console.log('Available Time Slots Before:', doctor.availableTimeSlots);

    const appointmentTimeAsString = new Date(appointment.appointmentDateTime).toISOString();

    const remainingTimeSlots = doctor.availableTimeSlots.filter(slot => {
        const slotAsString = new Date(slot).toISOString();
        return slotAsString !== appointmentTimeAsString;
    });

    console.log('Available Time Slots After:', remainingTimeSlots);

    doctor.availableTimeSlots = remainingTimeSlots;
    await doctor.save();

    res.status(200).json({ message: 'Success', appointment: newAppointment, createdAppointment: true });
});


  
  
module.exports = {getUpcomingAppointments , getPastAppointments, scheduleFollowUpAppointment};