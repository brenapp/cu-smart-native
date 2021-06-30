import express from "express"


const app = express();
app.listen(8080, () => {
    console.log("cu-smart-backend live on port 8080")
});


export default app;
import "./routes"