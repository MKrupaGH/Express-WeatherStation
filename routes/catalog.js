const express = require("express")
const router = express.Router()

const sensor_controller = require("../controllers/sensorController")

router.get("/sensor", sensor_controller.sensor_create_post)
router.get("/values", sensor_controller.get_data)
router.get("/values/newest", sensor_controller.get_newest_data)
router.get(
  "/values/analyze-full",
  sensor_controller.get_historic_data_and_prediction
)
router.get("/values/analyze-part", sensor_controller.get_data_analyze)
module.exports = router
