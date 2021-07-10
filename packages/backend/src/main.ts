import express from "express"


const app = express();
app.listen(3000, () => {
    console.log("live on port 3000")
});

export default app;
import "./routes"