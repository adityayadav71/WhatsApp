const axios = require("axios");

exports.sendHelloWorldMessage = async (phone) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `91${phone}`,
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US",
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

exports.sendMessage = async (phone, message) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

exports.sendDefaultReplyMessage = async (from, phone_number_id, prevMsgID) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        context: {
          message_id: prevMsgID,
        },
        type: "text",
        text: {
          preview_url: false,
          body: "Thanks for Replying! Please wait while we connect you to an executive...",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

exports.sendBusinessName = async (from, phone_number_id, prevMsgID) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${process.env.API_VERSION}/${phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        context: {
          message_id: prevMsgID,
        },
        type: "text",
        text: {
          preview_url: false,
          body: "Aubrey Flower Shop",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.USER_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

exports.handleWhatsAppCloudAPIErrors = async (error, res) => {
  if (error.response.status >= 400 && error.response.status < 500) {
    return res.status(error.response.status).json({
      status: "fail",
      message: `${error.response.data.error.message}`,
    });
  } else if (error.response.status >= 500) {
    return res.status(error.response.status).json({
      status: "error",
      message: `The WhatsApp API is down`,
    });
  }
}