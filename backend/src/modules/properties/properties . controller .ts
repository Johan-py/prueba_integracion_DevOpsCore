import { Request, Response } from "express";
import { propertyService } from "./properties.service.js";
import { PropertyFilters } from "./properties.types.js";

export const getProperties = async (req: Request, res: Response) => {
    try {
        const filters: PropertyFilters = {
            categoria: req.query.categoria as string | undefined,
            tipoAccion: req.query.tipoAccion as string | undefined,
            ciudad: req.query.ciudad as string | undefined,
        };

        const data = await propertyService.getFilteredProperties(filters);

        return res.json(data);
    } catch {
        // 👈 quitamos el "error" para evitar warning
        return res.status(500).json({
            message: "Error al obtener propiedades",
        });
    }
};