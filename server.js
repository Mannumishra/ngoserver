const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const { connectDB } = require("./DB/DB")
const cors = require("cors")
const SignupRouter = require("./Routes/SignupRoutes")
const verifyToken = require("./Middleware/verifyToken")
const DonatationRouter = require("./Routes/donationRoutes")


const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send(`Server Is Running At ${process.env.PORT}`)
})


app.use("/api", SignupRouter)
app.use("/api", DonatationRouter)


app.listen(process.env.PORT, () => {
    console.log(`Server is running at ${process.env.PORT}`)
})


connectDB()