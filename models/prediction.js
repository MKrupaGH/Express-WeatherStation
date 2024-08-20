const mongoose = require("mongoose")

// Define the schema for predicted values
const PredictionSchema = new mongoose.Schema(
  {
    linear: {
      pm10: { type: Array, required: true },
      pm25: { type: Array, required: true },
      ozone: { type: Array, required: true },
    },
    neuron: {
      pm10: { type: Array, required: true },
      pm25: { type: Array, required: true },
      ozone: { type: Array, required: true },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Prediction", PredictionSchema)
