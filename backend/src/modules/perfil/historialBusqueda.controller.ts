import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.client.js';

export const getHistorialBusqueda = async (req: Request, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ message: "No autorizado" });
        }

        // Buscamos los últimos registros (traemos más de 10 por si hay duplicados en DB)
        const historial = await prisma.historial_busqueda.findMany({
            where: { usuario_id: usuario_id },
            orderBy: { creado_en: 'desc' },
            take: 50 
        });

        // Filtramos duplicados en JS para asegurar términos únicos manteniendo el orden cronológico
        const uniqueHistorial: any[] = [];
        const seenTerms = new Set();

        for (const item of historial) {
            if (!seenTerms.has(item.termino)) {
                seenTerms.add(item.termino);
                uniqueHistorial.push(item);
            }
            if (uniqueHistorial.length >= 10) break;
        }

        res.json(uniqueHistorial);
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error al obtener historial de búsqueda" });
    }
};

export const guardarBusqueda = async (req: Request, res: Response) => {
    try {
        const usuario_id = req.user?.id;
        const { termino } = req.body;

        if (!usuario_id || !termino) {
            return res.status(400).json({ message: "Usuario o término faltante" });
        }

        // CONTROL DE DUPLICIDAD: Buscar si ya existe el término para este usuario
        const existing = await prisma.historial_busqueda.findFirst({
            where: {
                usuario_id: usuario_id,
                termino: termino
            }
        });

        if (existing) {
            // Si existe, actualizamos la fecha para que suba en el historial
            const actualizada = await prisma.historial_busqueda.update({
                where: { id: existing.id },
                data: { creado_en: new Date() }
            });
            return res.json(actualizada);
        }

        // Si no existe, creamos uno nuevo
        const nuevaBusqueda = await prisma.historial_busqueda.create({
            data: {
                usuario_id: usuario_id,
                termino: termino
            }
        });

        res.status(201).json(nuevaBusqueda);
    } catch (error) {
        console.error("Error al guardar búsqueda:", error);
        res.status(500).json({ error: "Error al registrar la búsqueda" });
    }
};

export const eliminarBusqueda = async (req: Request, res: Response) => {
    try {
        const usuario_id = req.user?.id;
        const termino = req.params.termino as string;

        if (!usuario_id || !termino) {
            return res.status(400).json({ message: "Usuario o término faltante" });
        }

        await prisma.historial_busqueda.deleteMany({
            where: {
                usuario_id: usuario_id,
                termino: termino
            }
        });

        res.json({ message: "Búsqueda eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar búsqueda:", error);
        res.status(500).json({ error: "Error al eliminar la búsqueda" });
    }
};
