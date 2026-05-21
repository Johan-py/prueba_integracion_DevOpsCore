import type { Request, Response } from 'express'
import { propertiesService } from './properties.service.js'
import type { FiltrosBusqueda } from './properties.repository.js'

export const propertiesController = {
  async getAll(req: Request, res: Response) {
    try {
      const {
        tipoInmueble,
        modoInmueble,
        query,
        locationId,
        departamentoId,
        provinciaId,
        municipioId,
        zonaId,
        barrioId,
        fecha,
        precio,
        superficie,
        minPrice,
        maxPrice,
        currency,
        dormitoriosMin,
        dormitoriosMax,
        banosMin,
        banosMax,
        tipoBano,
        minSuperficie,
        maxSuperficie,
        lat,
        lng,
        radius,
        amenities, 
        labels,
        soloOfertas
      } = req.query

      let banoCompartido: boolean | undefined = undefined
      if (tipoBano === 'privado') banoCompartido = false
      if (tipoBano === 'compartido') banoCompartido = true
      //HU6
      const parsedAmenities = amenities ? String(amenities).split(',').map(Number).filter(n => !isNaN(n)) : undefined;
      const parsedLabels = labels ? String(labels).split(',').map(Number).filter(n => !isNaN(n)) : undefined;
      // NUEVA CAPA DE SEGURIDAD: Validar longitud del texto
      let queryValidado = query as string;
      if (queryValidado && queryValidado.trim().length < 3) {
        queryValidado = ''; // Ignoramos silenciosamente para no romper los demás filtros
      }
      const filtros: FiltrosBusqueda = {
        tipoInmueble: tipoInmueble as string | string[],
        modoInmueble: modoInmueble as string | string[],
        query: queryValidado, // Usamos la variable validada
        locationId: locationId ? Number(locationId) : undefined,

        departamentoId: departamentoId as string,
        provinciaId: provinciaId as string,
        municipioId: municipioId as string,
        zonaId: zonaId as string,
        barrioId: barrioId as string,
        
        fecha: fecha as any,
        precio: precio as any,
        superficie: superficie as any,

        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        currency: (currency as string) ?? null,

        dormitoriosMin: dormitoriosMin ? parseInt(dormitoriosMin as string) : undefined,
        dormitoriosMax: dormitoriosMax ? parseInt(dormitoriosMax as string) : undefined,
        banosMin: banosMin ? parseInt(banosMin as string) : undefined,
        banosMax: banosMax ? parseInt(banosMax as string) : undefined,
        banoCompartido,
        minSuperficie: minSuperficie ? Number(minSuperficie) : null,
        maxSuperficie: maxSuperficie ? Number(maxSuperficie) : null,

        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radius: radius ? Number(radius) : 1,
        //HU6
        amenities: parsedAmenities,
        labels: parsedLabels,
        soloOfertas: soloOfertas === 'true'
      }

      const orden = {
        fecha: fecha as 'mas-recientes' | 'mas-populares' | undefined,
        precio: precio as 'menor-a-mayor' | 'mayor-a-menor' | undefined,
        superficie: superficie as 'menor-a-mayor' | 'mayor-a-menor' | undefined
      }
      console.log('📥 Controller recibió filtros:', filtros)
      const inmuebles = await propertiesService.getAll(filtros)
      res.json({ ok: true, data: inmuebles })
    } catch (error) {
      console.error('Error detallado en getAll:', error)
      res.status(500).json({ ok: false, message: 'Error al obtener inmuebles' })
    }
  },
  search: async (req: Request, res: Response) => {
    try {
      // Capturamos lo que envía el usePropertySearch del frontend
      const { locationId, categoria, tipoAccion, search, lat, lng, radius } = req.query
      // NUEVA CAPA DE SEGURIDAD
      let searchValidado = search as string;
      if (searchValidado && searchValidado.trim().length < 3) {
        searchValidado = ''; 
      }

      const filtros: FiltrosBusqueda = {
        // Mapeamos los nombres del frontend a los que espera el service/repository
        locationId: locationId ? Number(locationId) : undefined,
        tipoInmueble: categoria as string,
        modoInmueble: tipoAccion as string,
        query: searchValidado, // Usamos la variable validada
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        radius: radius ? Number(radius) : 1
      }

      const inmuebles = await propertiesService.getAll(filtros)

      // Enviamos la data en el formato que espera tu frontend (data: json)
      res.json({ ok: true, data: inmuebles })
    } catch (error) {
      console.error('Error en búsqueda:', error)
      res.status(500).json({ ok: false, error: 'Error en la búsqueda avanzada' })
    }
  },
  // NUEVO MÉTODO COMPARADOR: compare
  compare: async (req: Request, res: Response) => {
    try {
      // Ya sabemos que 'ids' existe, es un array, tiene entre 1 y 4 elementos, y todos son números.
      const { ids } = req.body;

      // Convertimos el array de strings a números para Prisma con total seguridad
      const idsNumericos = ids.map((id: any) => Number(id));

      const inmuebles = await propertiesService.getForComparison(idsNumericos);

      // Ordenar para que el modal muestre las propiedades en el mismo orden que se hizo clic
      const sortedInmuebles = inmuebles.sort(
        (a, b) => idsNumericos.indexOf(a.id) - idsNumericos.indexOf(b.id)
      );

      res.json({ ok: true, data: sortedInmuebles });
    } catch (error) {
      console.error('Error en compare:', error);
      res.status(500).json({ ok: false, error: 'Error al obtener propiedades para comparar' });
    }
  }
}

export const search = propertiesController.search
export const getAll = propertiesController.getAll
export const compare = propertiesController.compare
