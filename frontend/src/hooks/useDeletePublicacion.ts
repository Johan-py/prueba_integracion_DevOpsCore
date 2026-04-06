"use client";

import { useState } from "react";
import { eliminarPublicacion } from "@/services/publicacion.service";

export function useDeletePublicacion(
  publicacionId: number,
  onDeleted?: () => void,
) {
  const [modalConfirmacionAbierto, setModalConfirmacionAbierto] =
    useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [modalErrorAbierto, setModalErrorAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abrirConfirmacion = () => {
    setError("");
    setModalConfirmacionAbierto(true);
  };

  const cerrarConfirmacion = () => {
    if (loading) return;
    setModalConfirmacionAbierto(false);
  };

  const cerrarExito = () => {
    setModalExitoAbierto(false);
    onDeleted?.();
  };

  const cerrarError = () => {
    setModalErrorAbierto(false);
    setError("");
  };

  const confirmarEliminacion = async () => {
    try {
      setLoading(true);
      setError("");

      await eliminarPublicacion(publicacionId);

      setModalConfirmacionAbierto(false);
      setModalExitoAbierto(true);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se puede eliminar la publicación, intente nuevamente";

      setModalConfirmacionAbierto(false);
      setError(mensaje);
      setModalErrorAbierto(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    modalConfirmacionAbierto,
    modalExitoAbierto,
    modalErrorAbierto,
    loading,
    error,
    abrirConfirmacion,
    cerrarConfirmacion,
    cerrarExito,
    cerrarError,
    confirmarEliminacion,
  };
}
