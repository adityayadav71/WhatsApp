const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.post("/:phone_number", async (req, res) => {
  const phone = req.params.phone_number;
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

  res.send("Hello from Rizzarch Backend");
});

app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challenge = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];
  const mytoken = process.env.MY_TOKEN;
  
  if (mode && token) {
    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", async (req, res) => {
  let body = req.body;

  if (body.object) {
    if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body.entry[0].changes[0].value.messages[0].from;
      let prevMsgID = body.entry[0].changes[0].value.messages[0].id;

      try {
        await axios.post(
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
              body: "TEST MSG CONTENT FROM AUBREY FLOWERS",
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.access_token}`,
            },
          }
        );
        res.sendStatus(200);
      } catch (error) {
        console.error("Error sending message:", error);
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = app;
