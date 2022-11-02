const express = require("express");
const router = express.Router();

const sensor_controller = require("../controllers/sensorController");

router.get("/sensor", sensor_controller.sensor_create_post);

module.exports = router;