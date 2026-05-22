import { Request, Response } from 'express';

import { prisma } from '../lib/prisma.client.js';

export const getHistorialVistas = async (req: Request, res: Response) => {
    try {
        // Usamos req.user.id que viene de tu middleware requireAuth
        const usuarioId = req.user?.id;

        if (!usuarioId) {
            return res.status(401).json({ message: "Usuario no identificado" });
        }

        const historial = await prisma.propiedad_vista.findMany({
            where: { usuarioId: usuarioId },
            include: {
                inmueble: {
                    include: {
                        publicaciones: {
                            include: { multimedia: true },
                            take: 1
                        },
                        ubicacion: true
                    }
                }
            },
            orderBy: { vistaEn: 'desc' },
            take: 12
        });

        // Formateamos la respuesta para que el Front la entienda fácilmente
        const resultado = historial.map(item => ({
            id: item.inmueble.id,
            title: item.inmueble.titulo,
            price: item.inmueble.precio,
            image: item.inmueble.publicaciones[0]?.multimedia[0]?.url || null,
            location: item.inmueble.ubicacion?.ciudad || "Cochabamba, Bolivia",
            fechaVista: item.vistaEn
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Error en historial:", error);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};