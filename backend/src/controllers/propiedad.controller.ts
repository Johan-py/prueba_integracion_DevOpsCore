import { Request, Response } from 'express';

import { prisma } from '../lib/prisma.client.js';

export const getHistorialVistas = async (req: Request, res: Response) => {
    try {
        // Usamos req.user.id que viene de tu middleware requireAuth
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ message: "Usuario no identificado" });
        }

        const historial = await prisma.propiedad_vista.findMany({
            where: { usuario_id: usuario_id },
            include: {
                inmueble: {
                    include: { publicaciones: {
                            include: { multimedia: true },
                            take: 1
                        },
                        ubicacion: true
                    }
                }
            },
            orderBy: { vista_en: 'desc' },
            take: 12
        });

        // Formateamos la respuesta para que el Front la entienda fácilmente
        const resultado = historial.map(item => ({
            id: item.inmueble.id,
            title: item.inmueble.titulo,
            price: item.inmueble.precio,
            image: item.inmueble.publicaciones[0]?.multimedia[0]?.url || null,
            location: item.inmueble.ubicacion?.ciudad || "Cochabamba, Bolivia",
            fechaVista: item.vista_en
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Error en historial:", error);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};
