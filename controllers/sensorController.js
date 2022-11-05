const Sensor = require("../models/sensor");
//const { moment } = require("moment");

exports.sensor_create_post = (req, res, next) => {
  console.log("ok");
  const sensor = new Sensor({
    temp: req.query.temp,
    hum: req.query.hum,
    pres: req.query.pres,
    clo: req.query.clo,
    pm1: req.query.pm1,
    pm25: req.query.pm25,
    pm10: req.query.pm10,
  });

  sensor.save((err) => {
    err ? next(err) : res.json("Saved");
  });
};

exports.sensor_delete_all = (req, res, next) => {
  Sensor.deleteMany({});
};

exports.get_data = async (req, res) => {
  try {
    const collection = await Sensor.find();

    return res.status(200).json({
      success: true,
      count: collection.length,
      data: collection,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
};
