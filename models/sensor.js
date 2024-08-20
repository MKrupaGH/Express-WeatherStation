const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SensorSchema = new Schema(
  {
    temp: { type: Number, required: true },
    hum: { type: Number, required: true },
    pres: { type: Number, required: true },
    cloud: { type: Number, required: true },
    pm1: { type: Number, required: true },
    pm25: { type: Number, required: true },
    pm10: { type: Number, required: true },
    o3: { type: Number, required: true },
    co2: { type: Number, required: true },
  },
  { timestamps: true }
)

SensorSchema.virtual("url").get(function () {
  return `/catalog`
})

module.exports = mongoose.model("Sensor", SensorSchema)
