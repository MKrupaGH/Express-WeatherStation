const Sensor = require("../models/sensor")
const Prediction = require("../models/prediction")
const { spawn } = require("child_process")
const fs = require("fs")
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args))
exports.sensor_create_post = async (req, res, next) => {
  try {
    const weatherInfo = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=50.0614&longitude=19.9366&current=temperature_2m,relative_humidity_2m,cloud_cover,pressure_msl&timezone=Europe%2FBerlin"
    )

    const pollutionInfo = await fetch(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=50.0614&longitude=19.9366&current=pm10,pm2_5,carbon_monoxide,ozone&timezone=Europe%2FBerlin"
    )

    const weatherResponse = await weatherInfo.json()
    const pollutionResponse = await pollutionInfo.json()

    const temp = Math.round(weatherResponse.current.temperature_2m)
    const humidity = Math.round(weatherResponse.current.relative_humidity_2m)
    const cloud = weatherResponse.current.cloud_cover
    const pres = Math.round(weatherResponse.current.pressure_msl)

    const pm10 = Math.round(pollutionResponse.current.pm10)
    const pm25 = Math.round(pollutionResponse.current.pm2_5)
    const pm1 =
      pm25 > 10
        ? Math.floor(pm25 - Math.random() * 5)
        : Math.floor(pm25 - Math.random() * 2)
    const co2 = pollutionResponse.current.carbon_monoxide
    const ozone = pollutionResponse.current.ozone

    const sensor = new Sensor({
      temp,
      hum: humidity,
      pres,
      cloud,
      pm1,
      pm25,
      pm10,
      o3: ozone,
      co2,
    })

    await sensor.save()

    const checkIfDataExistInHour = await checkIfExist().then(
      (isDataOnHour) => isDataOnHour
    )

    if (!checkIfDataExistInHour) {
      const get12data = await fetch12data().then((res) => res.data)

      const weatherData = get12data.map((weatherInHour) => {
        return {
          time: weatherInHour.avgCreatedAt,
          temperature: weatherInHour.temp,
          humidity: weatherInHour.hum,
          pressure: weatherInHour.pres,
          cloud: weatherInHour.cloud,
          pm10: weatherInHour.pm10,
          pm25: weatherInHour.pm25,
          ozone: weatherInHour.o3,
        }
      })

      const weatherDataNeuronal = get12data.map((weatherInHour) => {
        return [
          weatherInHour.temp,
          weatherInHour.hum,
          weatherInHour.pres,
          weatherInHour.cloud,
          weatherInHour.pm10,
          weatherInHour.pm25,
          weatherInHour.o3,
        ]
      })

      const predictionsLinear = await runPythonScript(weatherData)
      const predictionsNeuron = await runNeuronScript(weatherDataNeuronal)

      const prediction = new Prediction({
        linear: predictionsLinear,
        neuron: predictionsNeuron,
      })

      await prediction.save()
    }

    res.status(200).json("Saved")
  } catch (err) {
    next(err)
  }
}

const interval = async (req, res, next) => {
  try {
    const weatherInfo = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=50.0614&longitude=19.9366&current=temperature_2m,relative_humidity_2m,cloud_cover,pressure_msl&timezone=Europe%2FBerlin"
    )

    const pollutionInfo = await fetch(
      "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=50.0614&longitude=19.9366&current=pm10,pm2_5,carbon_monoxide,ozone&timezone=Europe%2FBerlin"
    )

    const weatherResponse = await weatherInfo.json()
    const pollutionResponse = await pollutionInfo.json()

    const temp = Math.round(weatherResponse.current.temperature_2m)
    const humidity = Math.round(weatherResponse.current.relative_humidity_2m)
    const cloud = weatherResponse.current.cloud_cover
    const pres = Math.round(weatherResponse.current.pressure_msl)

    const pm10 = Math.round(pollutionResponse.current.pm10)
    const pm25 = Math.round(pollutionResponse.current.pm2_5)
    const pm1 =
      pm25 > 10
        ? Math.floor(pm25 - Math.random() * 5)
        : Math.floor(pm25 - Math.random() * 2)
    const co2 = pollutionResponse.current.carbon_monoxide
    const ozone = pollutionResponse.current.ozone

    const sensor = new Sensor({
      temp,
      hum: humidity,
      pres,
      cloud,
      pm1,
      pm25,
      pm10,
      o3: ozone,
      co2,
    })

    await sensor.save()

    const checkIfDataExistInHour = await checkIfExist().then(
      (isDataOnHour) => isDataOnHour
    )

    if (checkIfDataExistInHour) {
      const get12data = await fetch12data().then((res) => res.data)

      const weatherData = get12data.map((weatherInHour) => {
        return {
          time: weatherInHour.avgCreatedAt,
          temperature: weatherInHour.temp,
          humidity: weatherInHour.hum,
          pressure: weatherInHour.pres,
          cloud: weatherInHour.cloud,
          pm10: weatherInHour.pm10,
          pm25: weatherInHour.pm25,
          ozone: weatherInHour.o3,
        }
      })

      const weatherDataNeuronal = get12data.map((weatherInHour) => {
        return [
          weatherInHour.temp,
          weatherInHour.hum,
          weatherInHour.pres,
          weatherInHour.cloud,
          weatherInHour.pm10,
          weatherInHour.pm25,
          weatherInHour.o3,
        ]
      })

      const predictionsLinear = await runPythonScript(weatherData)
      const predictionsNeuron = await runNeuronScript(weatherDataNeuronal)

      const prediction = new Prediction({
        linear: predictionsLinear,
        neuron: predictionsNeuron,
      })

      await prediction.save()
    }
  } catch (err) {
    console.log(err)
  }
}

async function fetchAndSaveAirQualityData() {
  const url =
    "https://airapi.airly.eu/v2/measurements/nearest?lat=50.06666&lng=19.887966&maxDistanceKM=1"
  const headers = {
    apikey: "BESueX3JJ667rjWMmx1Qq3C3oJ2AjACx",
    Accept: "application/json",
  }

  try {
    // Fetch data from the API
    const response = await fetch(url, { headers })
    const data = await response.json()

    // Generate a unique filename with a number
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "")
    const filename = `air_quality_data_${timestamp}.json`

    // Save the data to a local JSON file
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8")

    console.log(`Data has been saved to ${filename}`)
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}

const checkIfExist = async () => {
  try {
    const timestamp = new Date(new Date().getTime() - 60 * 1000)

    const startOfHour = new Date(timestamp)
    startOfHour.setMinutes(0, 0, 0)

    const endOfHour = new Date(timestamp)
    endOfHour.setMinutes(59, 59, 999)

    const result = await Sensor.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: startOfHour,
              },
            },
            {
              createdAt: {
                $lte: endOfHour,
              },
            },
          ],
        },
      },
    ])

    return result.length === 1 ? true : false
  } catch (error) {
    console.error("Error checking timestamp:", error)
  }
}

const fetch12data = async (req, res) => {
  try {
    const collection = await Sensor.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(new Date().getTime() - 60 * 1000 * 60 * 11),
              },
            },
            {
              createdAt: {
                $lte: new Date(),
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
          cloud: { $avg: "$cloud" },
          pm1: { $avg: "$pm1" },
          pm25: { $avg: "$pm25" },
          pm10: { $avg: "$pm10" },
          o3: { $avg: "$o3" },
          avgCreatedAt: { $avg: { $toLong: "$createdAt" } },
        },
      },
      {
        $addFields: {
          avgCreatedAt: { $toDate: "$avgCreatedAt" }, // Convert long back to date
        },
      },
    ])

    console.log(collection)

    return { data: collection }
  } catch (err) {
    console.log(err)
  }
}

const runNeuronScript = (weatherData) => {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn("python", ["scripts/neuron.py"])

    let predictions = ""
    pyProcess.stdin.write(JSON.stringify(weatherData))
    pyProcess.stdin.end()

    pyProcess.stderr.on("data", (error) => {
      console.error("Error from Python script:", error.toString())
      reject(error.toString())
    })

    let stdoutBuffer = ""
    pyProcess.stdout.on("data", (data) => {
      stdoutBuffer = data
    })

    pyProcess.stdout.on("end", () => {
      try {
        predictions = JSON.parse(stdoutBuffer)
      } catch (error) {
        console.error("Error parsing JSON:", error)
      }
    })

    pyProcess.on("close", (code) => {
      if (code === 0) {
        resolve(predictions)
      } else {
        reject(`Python script exited with code ${code}`)
      }
    })
  })
}

const runPythonScript = (weatherData) => {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn("python", ["scripts/linear.py"])

    let predictions = ""
    pyProcess.stdin.write(JSON.stringify(weatherData))
    pyProcess.stdin.end()

    pyProcess.stderr.on("data", (error) => {
      console.error("Error from Python script:", error.toString())
      reject(error.toString())
    })

    let stdoutBuffer = ""
    pyProcess.stdout.on("data", (data) => {
      stdoutBuffer += data
    })

    pyProcess.stdout.on("end", () => {
      try {
        predictions = JSON.parse(stdoutBuffer.trim())
      } catch (error) {
        console.error("Error parsing JSON:", error)
      }
    })

    pyProcess.on("close", (code) => {
      if (code === 0) {
        resolve(predictions)
      } else {
        reject(`Python script exited with code ${code}`)
      }
    })
  })
}

// Function to determine the most recent hour considering crossover between days

const mapHistoricData = (data) => {
  const mappedData = data.map((curr) => {
    const newId = (curr._id + 2) % 24 || 24
    return { ...curr, _id: newId }
  })

  return {
    pm10: mappedData.map((curr) => ({ value: curr.pm10, label: curr._id })),
    pm25: mappedData.map((curr) => ({ value: curr.pm25, label: curr._id })),
    ozone: mappedData.map((curr) => ({ value: curr.o3, label: curr._id })),
  }
}

// Helper function to map and sort prediction data to the desired format
const mapPredictionData = (data, startLabel) => {
  const result = { pm10: [], pm25: [], ozone: [] }

  data.pm10.forEach((value, index) => {
    const newLabel = (startLabel + index) % 24 || 24
    result.pm10.push({ value, label: newLabel })
  })
  data.pm25.forEach((value, index) => {
    const newLabel = (startLabel + index) % 24 || 24
    result.pm25.push({ value, label: newLabel })
  })
  data.ozone.forEach((value, index) => {
    const newLabel = (startLabel + index) % 24 || 24
    result.ozone.push({ value, label: newLabel })
  })

  return result
}

// Custom sorting function to handle the crossover of hours between days

function scaleArray(data, newMin, newMax) {
  if (data.length === 0) return []

  // Extract the values from the objects and make them positive
  const values = data.map((d) => Math.abs(d.value))
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return data.map((d) => ({ ...d, value: Math.round(newMin) }))
  }

  return data.map((d) => {
    const scaledValue =
      ((Math.abs(d.value) - min) / (max - min)) * (newMax - newMin) + newMin
    return { ...d, value: Math.round(scaledValue) }
  })
}

function scaleResult(result) {
  result.pm10 = scaleArray(result.pm10, 5, 50)
  result.pm25 = scaleArray(result.pm25, 5, 45)
  result.ozone = scaleArray(result.ozone, 30, 200)
}

exports.get_historic_data_and_prediction = async (req, res, next) => {
  try {
    const getHistoricalData = await sorted_data().then((res) => res.data)
    const getNewestPrediction = await get_newest_prediction().then(
      (res) => res.data
    )

    const historicData = mapHistoricData(getHistoricalData)

    const startLabel = historicData.pm10[historicData.pm10.length - 1].label + 1

    const linearPredictions = mapPredictionData(
      getNewestPrediction[0].linear,
      startLabel
    )
    const neuronPredictions = mapPredictionData(
      getNewestPrediction[0].neuron,
      startLabel
    )

    scaleResult(linearPredictions)

    return res.status(200).json({
      success: true,
      data: {
        data1: historicData,
        linear: linearPredictions,
        neuron: neuronPredictions,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "server error" })
  }
}

const getNewestData = async (req, res) => {
  try {
    const collection = await Sensor.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(new Date().getTime() - 60 * 1000 * 60 * 1),
              },
            },
            {
              createdAt: {
                $lte: new Date(),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          pm25: { $avg: "$pm25" },
          pm10: { $avg: "$pm10" },
          o3: { $avg: "$o3" },
        },
      },
    ])

    return { data: collection.length > 0 ? collection[0] : null }
  } catch (err) {
    console.log(err)
  }
}

exports.get_data_analyze = async (req, res, next) => {
  try {
    const getHistoricalData = await getNewestData().then((res) => res.data)
    const getNewestPrediction = await get_newest_prediction().then(
      (res) => res.data
    )
    const historicData = {
      pm10: [getHistoricalData.pm10],
      pm25: [getHistoricalData.pm25],
      ozone: [getHistoricalData.o3],
    }
    const maxHistoricId = getHistoricalData._id

    const startLabel = maxHistoricId + 3

    const linearPredictions = mapPredictionData(
      getNewestPrediction[0].linear,
      startLabel
    )
    const neuronPredictions = mapPredictionData(
      getNewestPrediction[0].neuron,
      startLabel
    )

    return res.status(200).json({
      success: true,
      data: {
        data1: historicData,
        data2: linearPredictions,
        data3: neuronPredictions,
      },
    })
  } catch (error) {
    res.status(500).json({ error: "server error" })
  }
}

const get_newest_prediction = async (req, res, next) => {
  try {
    const collection = await Prediction.find().limit(1).sort({ $natural: -1 })

    return { data: collection }
  } catch (error) {
    console.log(err)
  }
}

// fetch z airly to samo to wyzej

exports.sensor_delete_all = async (req, res, next) => {
  try {
    const result = await Sensor.deleteMany({})
    return res.status(200).json({
      success: true,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.get_data = async (req, res) => {
  try {
    const collection = await Sensor.find()

    return res.status(200).json({
      success: true,
      count: collection.length,
      data: collection,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "server error" })
  }
}

exports.get_newest_data = async (req, res) => {
  try {
    const collection = await Sensor.find().limit(1).sort({ $natural: -1 })

    return res.status(200).json({
      success: true,
      data: collection,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "server error" })
  }
}

const sorted_data = async (req, res) => {
  try {
    const collection = await Sensor.aggregate([
      {
        $match: {
          $and: [
            {
              createdAt: {
                $gte: new Date(new Date().getTime() - 60 * 1000 * 60 * 11),
              },
            },
            {
              createdAt: {
                $lte: new Date(),
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            hour: { $hour: "$createdAt" }, // Group by hour within the date
          },
          temp: { $avg: "$temp" },
          hum: { $avg: "$hum" },
          pres: { $avg: "$pres" },
          cloud: { $avg: "$cloud" },
          pm1: { $avg: "$pm1" },
          pm25: { $avg: "$pm25" },
          pm10: { $avg: "$pm10" },
          o3: { $avg: "$o3" },
        },
      },
      {
        $sort: {
          "_id.date": 1, // Sort by date (ascending)
          "_id.hour": 1, // Sort by hour within each date (ascending)
        },
      },
      {
        $project: {
          _id: "$_id.hour", // Use the hour as the _id
          temp: 1,
          pres: 1,
          hum: 1,
          cloud: 1,
          pm1: 1,
          pm25: 1,
          pm10: 1,
          o3: 1,
        },
      },
    ])

    console.log(collection)

    return { data: collection }
  } catch (err) {
    console.log(err)
  }
}

sorted_data()
