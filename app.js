var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
const compression = require("compression")
const helmet = require("helmet")
const cors = require("cors")

const indexRouter = require("./routes/index")
const catalogRouter = require("./routes/catalog")

var app = express()

// const { exec } = require("child_process")

// // Step 1: Install TensorFlow and other dependencies from requirements.txt
// exec("pip install -r requirements.txt", (err, stdout, stderr) => {
//   if (err) {
//     console.error(`Error installing Python dependencies: ${stderr}`)
//     return
//   }
//   console.log(`Python dependencies installed successfully: ${stdout}`)

//   // Step 2: Force install Keras 3.4.1 after TensorFlow
//   exec("pip install keras==3.4.1", (err, stdout, stderr) => {
//     if (err) {
//       console.error(`Error installing Keras 3.4.1: ${stderr}`)
//       return
//     }
//     console.log(`Keras 3.4.1 installed successfully: ${stdout}`)
//   })
// })

//DB connection
const mongoose = require("mongoose")
const db_url =
  "mongodb+srv://marekkrupa:Erasmus2023@datadb.dudqxbg.mongodb.net/?retryWrites=true&w=majority&appName=DataDB"
const mongoDB = process.env.MONGODB_URI || db_url

mongoose.connect(mongoDB, { useNewUrlParser: true })
const db = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error:"))

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(compression())
app.use(helmet())
app.use(cors())

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*")

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH"
  )

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type")

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true)

  // Pass to next layer of middleware
  next()
})

const PORT = process.env.PORT || 3100

app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRouter)
app.use("/catalog", catalogRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("error here")
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

module.exports = app
