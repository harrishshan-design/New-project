const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // e.g. "whatsapp:+14155238886"

let client;
if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

async function sendWhatsAppMessage(toPhone, message) {
  if (!client) {
    console.log(`[Mock WhatsApp] to: ${toPhone} | message: ${message}`);
    return { success: true, mocked: true };
  }

  try {
    // Format toPhone just in case it doesn't have whatsapp: prefix
    const formattedTo = toPhone.startsWith("whatsapp:") ? toPhone : `whatsapp:${toPhone}`;
    
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber || "whatsapp:+14155238886", // default Sandbox number
      to: formattedTo,
    });
    
    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    return { success: false, error: error.message };
  }
}

async function sendDealAlert(lead, property) {
  const message = `Hi ${lead.name}, we found a great match for you! ${property.title} is listed for RM ${property.price}. Contact us to schedule a viewing!`;
  return await sendWhatsAppMessage(lead.phone, message);
}

module.exports = {
  sendWhatsAppMessage,
  sendDealAlert,
};
