const Sensor = require("../models/sensor");

exports.sensor_create_post = (req, res, next) => {
  const sensor = new Sensor({
    temp: req.query.temp,
    hum: req.query.hum,
  });

  sensor.save((err) => {
    err ? next(err) : res.redirect("/catalog");
  });

  res.redirect("/");
};
