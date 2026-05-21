import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.client.js';

export const locationsController = {
  // 1. Departamentos
  async getDepartamentos(req: Request, res: Response) {
    try {
      const departamentos = await prisma.departamento.findMany({
        orderBy: { nombre: 'asc' }
      });
      res.json(departamentos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener departamentos' });
    }
  },

  // 2. Provincias (FK: departamento_id)
  async getProvincias(req: Request, res: Response) {
    try {
      const { deptoId } = req.params;
      const provincias = await prisma.provincia.findMany({
        where: { departamento_id: Number(deptoId) },
        orderBy: { nombre: 'asc' }
      });
      res.json(provincias);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener provincias' });
    }
  },

  // 3. Municipios (FK: provincia_id)
  async getMunicipios(req: Request, res: Response) {
    try {
      const { provId } = req.params;
      const municipios = await prisma.municipio.findMany({
        where: { provincia_id: Number(provId) },
        orderBy: { nombre: 'asc' }
      });
      res.json(municipios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener municipios' });
    }
  },

  // 4. Zonas (Modelo: zona_geografica | FK: municipio_id)
  async getZonas(req: Request, res: Response) {
    try {
      const { munId } = req.params;
      const zonas = await prisma.zona_geografica.findMany({ // <--- Cambio aquí
        where: { municipio_id: Number(munId) },
        orderBy: { nombre: 'asc' }
      });
      res.json(zonas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener zonas' });
    }
  },

  // 5. Barrios (FK: zona_id)
  async getBarrios(req: Request, res: Response) {
    try {
      const { zonaId } = req.params;
      const barrios = await prisma.barrio.findMany({
        where: { zona_id: Number(zonaId) },
        orderBy: { nombre: 'asc' }
      });
      res.json(barrios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener barrios' });
    }
  }
};