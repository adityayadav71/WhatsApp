const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {
  sendMessage,
  sendHelloWorldMessage,
  sendDefaultReplyMessage,
  sendBusinessName,
  handleWhatsAppCloudAPIErrors,
} = require("./utils");

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  })
);
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.post("/webhook", async (req, res) => {
  let body = req.body;
  console.log("Received body for webhook callback: ", body);

  if (body.object) {
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from;
      let prevMsgID = body.entry[0].changes[0].value.messages[0].id;
      let prevMsg = body.entry[0].changes[0].value.messages[0].text.body;

      try {
        console.log("Sending reply back to user with phone number: ", from);
        console.log("User Message: ", prevMsg);
        let response;
        if (/\b(business.*name|name.*business)\b/i.test(prevMsg)) {
          response = await sendBusinessName(from, phone_number_id, prevMsgID);
        } else {
          response = await sendDefaultReplyMessage(from, phone_number_id, prevMsgID);
        }
        if (response.status === 200) {
          console.info("Message Reply sent successfully");
          return res.status(200).json({
            status: "success",
            message: "Message Reply sent successfully",
          });
        }
      } catch (error) {
        console.error("Error while sending reply: ", error);
        return handleWhatsAppCloudAPIErrors(error, res);
      }
    } else {
      console.warn("Message structure not as expected:", body);
      return res.status(404).json({
        status: "success",
        message: "Message structure not as expected",
      });
    }
  } else {
    console.warn("No object found in body");
    return res.status(400).json({
      status: "success",
      message: "No object found in body",
    });
  }
});

app.post("/sendHelloWorldTemplate/:phone_number", async (req, res) => {
  const phone = req.params.phone_number;
  try {
    const response = await sendHelloWorldMessage(phone);

    if (response.status === 200) {
      return res.status(200).json({
        status: "success",
        message: `Message sent to whatsapp number: ${phone} successfully`,
      });
    }
  } catch (error) {
    return handleWhatsAppCloudAPIErrors(error, res);
  }
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
  });
});

app.post("/sendMessage/:phone_number", async (req, res) => {
  const phone = req.params.phone_number;
  const message = req.body.message;
  try {
    const response = await sendMessage(phone, message);

    if (response.status === 200) {
      return res.status(200).json({
        status: "success",
        message: `Message sent to whatsapp number: ${phone} successfully`,
      });
    }
  } catch (error) {
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
  res.status(500).json({
    status: "error",
    message: "Something went wrong on the server",
  });
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  const mytoken = process.env.VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

module.exports = app;
