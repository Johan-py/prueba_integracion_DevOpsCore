import type { Request, Response } from 'express'
import { propertiesService } from './properties.service.ts'
import type { FiltrosBusqueda } from './properties.repository.ts'

export const propertiesController = {
  async getAll(req: Request, res: Response) {
    try {
      const {
        tipoInmueble,
        modoInmueble,
        query,
        locationId,
        fecha,
        precio,
        superficie,
      } = req.query;

      const filtros: FiltrosBusqueda = {
        tipoInmueble: tipoInmueble as string | string[],
        modoInmueble: modoInmueble as string | string[],
        query: query as string,
        locationId: locationId ? Number(locationId) : undefined,
        fecha: fecha as any,
        precio: precio as any,
        superficie: superficie as any,
      };

      const orden = {
        fecha: fecha as "mas-recientes" | "mas-populares" | undefined,
        precio: precio as "menor-a-mayor" | "mayor-a-menor" | undefined,
        superficie: superficie as "menor-a-mayor" | "mayor-a-menor" | undefined,
      };

      const inmuebles = await propertiesService.getAll(filtros);
      res.json({ ok: true, data: inmuebles });
    } catch (error) {
      console.error("Error detallado en getAll:", error);
      res
        .status(500)
        .json({ ok: false, message: "Error al obtener inmuebles" });
    }
  },
  search: async (req: Request, res: Response) => {
    try {
      // Capturamos lo que envía el usePropertySearch del frontend
      const { locationId, categoria, tipoAccion, search } = req.query;

      const filtros: FiltrosBusqueda = {
        // Mapeamos los nombres del frontend a los que espera el service/repository
        locationId: locationId ? Number(locationId) : undefined,
        tipoInmueble: categoria as string,
        modoInmueble: tipoAccion as string,
        query: search as string,
      };

      const inmuebles = await propertiesService.getAll(filtros);

      // Enviamos la data en el formato que espera tu frontend (data: json)
      res.json({ ok: true, data: inmuebles });
    } catch (error) {
      console.error("Error en búsqueda:", error);
      res
        .status(500)
        .json({ ok: false, error: "Error en la búsqueda avanzada" });
    }
  },
};

export const search = propertiesController.search;
export const getAll = propertiesController.getAll;
