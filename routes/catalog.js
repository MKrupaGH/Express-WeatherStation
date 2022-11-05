const express = require("express");
const router = express.Router();

const sensor_controller = require("../controllers/sensorController");

router.get("/sensor", sensor_controller.sensor_create_post);
router.get("/sensor/delete", sensor_controller.sensor_delete_all);

module.exports = router;
