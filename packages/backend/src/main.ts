import express from "express"
import "./routes"

const app = express();
app.listen(3000, () => {
    console.log("cu-smart-backend live on port 3000")
});


export default app;