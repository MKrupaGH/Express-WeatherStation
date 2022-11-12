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

exports.sensor_delete_all = async (req, res, next) => {
  try {
    const result = await Sensor.deleteMany({});
    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
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

exports.sorted_data = async (req, res) => {
  try {
    const collection = await Sensor.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date("2020-11-12T00:00:00.000Z"),
              },
            },
            {
              createdAt: {
                $lte: new Date("2023-11-12T00:00:00.000Z"),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          temp: { $avg: "$temp" },
          hum: { $avg: "$hum" },
          pres: { $avg: "$pres" },
          clo: { $avg: "$clo" },
          pm1: { $avg: "$pm1" },
          pm25: { $avg: "$pm25" },
          pm10: { $avg: "$pm10" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
};
