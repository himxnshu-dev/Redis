import twilio from "twilio"

export const sendOtp = async (otpBody: string): Promise<void> => {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    try {
        let messageOptions = {
            body: otpBody,
            from: process.env.TWILIO_FROM_NUMBER!,
            to: process.env.TWILIO_TO_NUMBER!,
        }
        const message = await twilioClient.messages.create(messageOptions);
        console.log("message sent:", message);
    }
    catch (err) {
        // err instanceof Error ? console.error(err.message) : console.error("An unknown error occurred")
        throw err;
    }
}

// sendOtp("Hello from Twilio! This is your OTP: 123456");