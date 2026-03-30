import { Router } from "express";
import { getProperties } from "./properties.controller";

const router = Router();

// 👇 esto evita el error de TS sin romper runtime
router.get("/", getProperties as any);

export default router;