const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SensorSchema = new Schema({
  temp: { type: Number, required: true },
  hum: { type: Number, required: true },
});

SensorSchema.virtual("url").get(function () {
  return `/catalog`;
});

module.exports = mongoose.model("Sensor", SensorSchema);
