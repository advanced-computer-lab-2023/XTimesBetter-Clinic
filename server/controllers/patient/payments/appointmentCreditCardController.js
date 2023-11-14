const asyncHandler = require('express-async-handler');
const patients = require('../../../models/Patient');
const doctors = require('../../../models/Doctor');
const appointment = require('../../../models/Appointment');
const { default: mongoose } = require('mongoose');
const contract = require('../../../models/Contract');

const stripe = require('stripe')(process.env.STRIPE_PRIV_KEY);


const payAppointment = asyncHandler(async (req, res) => {
    try {

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',

            line_items: [{
                price_data: {
                    currency: 'USD',
                    product_data: {
                        name: 'Appointment Price: '
                    },

                    unit_amount: req.body.appointmentPrice * 100
                },
                quantity: 1
            },
            ],

            success_url: 'http://localhost:5173/patient/successPayment',
            cancel_url: 'http://localhost:5173/patient/unsuccessPayment'  // will change it
        })
        const registeredPatient = await patients.findOne({ username: req.body.username });
        const doctorToPay = await doctors.findOne({ username: req.body.doctorUsername });
        const doctorContract = await contract.findOne({username: req.body.doctorUsername});

        const totalAmount = req.body.appointmentPrice;
        // console.log(totalAmount);

        if (registeredPatient) {
            // console.log(registeredPatient);

            console.log('Available Time Slots Before:', doctorToPay.availableTimeSlots);

            const appointmentTimeAsString = new Date(req.body.appointmentSlot).toISOString();

            // check
            let flag = true;
            if (doctorToPay.availableTimeSlots.length === 0) {
                flag = false;

            }
            else {
                const checkIfSlotIsStillAvailable = () => {
                    for (const slot of doctorToPay.availableTimeSlots) {

                        const slotAsString = new Date(slot).toISOString();
                        if (slotAsString === appointmentTimeAsString) {
                            return true;
                        }
                    }
                    return false;
                }
                flag = checkIfSlotIsStillAvailable();
            }
            // console.log("Flag: ", flag);

            if (!flag) {
                const removeAppointment = await appointment.findOneAndDelete({ _id: new mongoose.Types.ObjectId(req.body.rowId) });
                return res.status(400).json({ message: 'Appointment is unfortunately booked! ', success: false });
            }
            else {

                // Remove the selected slot
                const remainingTimeSlots = doctorToPay.availableTimeSlots.filter(slot => {
                    const slotAsString = new Date(slot).toISOString();
                    return slotAsString !== appointmentTimeAsString;
                });

                const updatedDoctorSlots = await doctors.findOneAndUpdate({ username: req.body.doctorUsername }, { $push: { availableTimeSlots: req.body.appointmentSlot } }, { new: true });

                console.log('Available Time Slots After:', remainingTimeSlots);

                doctorToPay.availableTimeSlots = remainingTimeSlots;


                await doctorToPay.save();

                const doctorAmount = doctorToPay.walletAmount + [1-(doctorContract.markupRate/100)] * totalAmount;
                const updatedDoctorWallet = await doctors.findOneAndUpdate({ username: req.body.doctorUsername }, { walletAmount: doctorAmount });

                // console.log("patient amount,",newWalletAmout)
                // console.log("doctor amount,",doctorAmount)

            }



            return res.status(201).json({ success: true, url: session.url, successURL: session.success_url });
        }
    } catch (error) {
        // Respond with an error message if there is an error
        return res.status(500).json({ success: false, error: 'An error occurred while creating the session.' });
    }
})

module.exports = { payAppointment };