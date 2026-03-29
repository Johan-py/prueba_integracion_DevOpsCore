import { Router } from "express";
import { getProperties } from "./properties . controller .js";

const router = Router();

router.get("/properties", getProperties);

export default router;