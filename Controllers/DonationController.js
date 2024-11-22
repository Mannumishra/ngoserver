const Razorpay = require("razorpay");
const Donation = require("../Models/DonateModel");


// Razorpay instance setup
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_APT_KEY, // Your Razorpay Key ID
    key_secret: process.env.RAZORPAY_APT_SECRET, // Your Razorpay Key Secret
});

const createDonation = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // Parse amount to a number to prevent type mismatch
        const donationAmount = parseFloat(amount);

        if (!userId || !donationAmount || isNaN(donationAmount)) {
            return res.status(400).json({ message: "Valid userId and amount are required." });
        }

        // Create an order on Razorpay
        const order = await razorpayInstance.orders.create({
            amount: donationAmount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        // Save the donation record with payment status "pending"
        const donation = new Donation({
            userId,
            paymentId: order.id,
            paymentStatus: "pending",
            amount: donationAmount, // Store the amount as a number
        });

        await donation.save();

        res.status(201).json({ message: "Donation created successfully", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating donation", error: error.message });
    }
};


// Update donation status after payment verification
const updateDonationStatus = async (req, res) => {
    try {
        const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

        if (!paymentId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Verify the Razorpay payment
        const crypto = require("crypto");
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
            .update(paymentId + "|" + razorpayPaymentId)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ message: "Payment verification failed." });
        }

        // Update the donation record
        const donation = await Donation.findOneAndUpdate(
            { paymentId },
            { paymentStatus: "success" },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found." });
        }

        res.status(200).json({ message: "Payment verified and donation updated.", donation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating donation status", error: error.message });
    }
};


const getAllDonatation = async (req, res) => {
    try {
        const data = await Donation.find().populate("userId")
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Donatation Not Found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Donatation Found Successfully",
            data:data
        })
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    createDonation,
    updateDonationStatus,getAllDonatation
};
