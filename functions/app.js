var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

var app = express();
//var port = process.env.PORT || 4000;

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
console.log("Inside the app.js...");
// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }));

// confirm the paymentIntent
app.post("/charges", async (request, response) => {
  try {
    // Create the PaymentIntent
    if (request.body.payment_method_id == null) {
      console.log("Inside the post method", request.body);
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          number: request.body.cardNumber,
          exp_month: request.body.cardExpMonth,
          exp_year: request.body.cardExpYear,
          cvc: request.body.cvv,
        },
      });
      console.log("paymentMethod: ", paymentMethod);

      let intent = await stripe.paymentIntents.create({
        payment_method: paymentMethod.id,
        payment_method_types: ["card"],
        description: "Test payment",
        amount: request.body.amount * 100,
        currency: "usd",
        confirmation_method: "manual",
        confirm: true,
      });
      // Send the response to the client
      console.log("Completed the stripe method invocation: ", intent);
      return response.send(generateResponse(intent));
    } else {
      console.log("Inside the post method");
      let intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        description: "Test payment",
        amount: request.body.amount * 100,
        currency: "USD",
        confirmation_method: "manual",
        confirm: true,
      });
      // Send the response to the client
      console.log("Completed the stripe method invocation");
      return response.send(generateResponse(intent));
    }
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});

app.post("/cardCharges", async (request, response) => {
  try {
    // Create the PaymentIntent
    // const body = JSON.parse(request.body);
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});

const generateResponse = (intent) => {
  if (intent.status === "succeeded") {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true,
    };
  } else {
    // Invalid status
    return {
      error: "Invalid PaymentIntent status",
    };
  }
};

// request handlers
module.exports = app;
