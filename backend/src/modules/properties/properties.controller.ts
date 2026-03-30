import { Request, Response } from "express";
import { propertyRepository } from "./properties.repository.js";
import type { PropertyFilters } from "./properties.types.js";

export const getProperties = async (req: Request, res: Response) => {
    const filters: PropertyFilters = {
        categoria: req.query.categoria as string | undefined,
        tipoAccion: req.query.tipoAccion as string | undefined,
        ciudad: req.query.ciudad as string | undefined,
    };

    const properties = await propertyRepository.findWithFilters(filters);

    res.json(properties);
};