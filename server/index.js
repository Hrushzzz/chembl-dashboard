import express, { json } from "express";
import cors from "cors";
import compoundRoutes from "./routes/compounds.js";

// creating an Express server
const app = express();
app.use(cors());
app.use(json());

app.use("/api/compounds", compoundRoutes);

app.listen(5004, () => {
  console.log("Server running on port 5004");
});
