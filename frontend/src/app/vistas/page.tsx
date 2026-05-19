"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";

const PropertyCard = ({ prop, onVerDetalle }: { prop: any; onVerDetalle: (id: number) => void }) => {
    const fecha = new Date(prop.viewedDate).toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit'
    });

    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative hover:shadow-md transition-all">
            <div
                className="relative h-44 w-full bg-gray-200 cursor-pointer"
                onClick={() => onVerDetalle(prop.id)}
            >
                <img
                    src={prop.imageUrl || 'https://via.placeholder.com/400x300'}
                    alt={prop.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4 relative">
                <div className="absolute top-4 right-4 text-right flex flex-col items-end">
                    <div className="bg-[#4B4B4B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm mb-1">
                        Visto: {fecha}
                    </div>
                    <span className="text-[9px] text-gray-300 font-medium">Ref: #{prop.id}</span>
                </div>
                <p className="text-[#E87B00] font-bold text-lg">${prop.price?.toLocaleString()} USD</p>
                <h3
                    className="font-bold text-black text-sm mt-1 truncate cursor-pointer hover:text-[#E87B00] transition-colors"
                    onClick={() => onVerDetalle(prop.id)}
                >
                    {prop.title}
                </h3>
                <p className="text-black text-[11px] mt-1 font-medium italic">{prop.location}</p>
                <div className="flex items-center gap-2 mt-3 text-[10px] text-black font-medium italic">
                    <span>3 hab</span><span>•</span><span>2 baños</span><span>•</span><span>1 garaje</span>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={() => onVerDetalle(prop.id)}
                        className="w-full bg-[#E87B00] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-orange-600 shadow-sm text-center transition-colors"
                    >
                        Ver Detalle
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function VistasRecientesPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<any[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA EL FILTRO DE CALENDARIO ---
    const [showCalendar, setShowCalendar] = useState(false);
    const hoy = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

    // --- CONFIGURACIÓN DE PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const propertiesPerPage = 10;

    const totalPages = useMemo(() => {
        return Math.ceil(filteredProperties.length / propertiesPerPage);
    }, [filteredProperties, propertiesPerPage]);

    const currentProperties = useMemo(() => {
        const lastIndex = currentPage * propertiesPerPage;
        const firstIndex = lastIndex - propertiesPerPage;
        return filteredProperties.slice(firstIndex, lastIndex);
    }, [currentPage, filteredProperties, propertiesPerPage]);

    const fetchHistorial = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perfil/historial/vistas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const allData = Array.isArray(data) ? data : (data.data || []);
            setProperties(allData);
            setFilteredProperties(allData);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorial();
    }, []);

    // --- LÓGICA DEL CALENDARIO ---
    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const handleDateClick = (day: number, monthOffset: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(clickedDate);
            setRangeEnd(null);
        } else if (clickedDate < rangeStart) {
            setRangeStart(clickedDate);
        } else {
            setRangeEnd(clickedDate);
        }
    };

    const handleResetFilter = () => {
        setRangeStart(null);
        setRangeEnd(null);
        setCurrentDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
        setFilteredProperties(properties);
        setCurrentPage(1);
    };

    const applyRangeFilter = () => {
        if (!rangeStart || !rangeEnd) return;
        const filtered = properties.filter(p => {
            const pDate = new Date(p.viewedDate);
            const start = new Date(rangeStart.setHours(0,0,0,0));
            const end = new Date(rangeEnd.setHours(23,59,59,999));
            return pDate >= start && pDate <= end;
        });
        setFilteredProperties(filtered);
        setCurrentPage(1);
        setShowCalendar(false);
    };

    const renderMonth = (date: Date, offset: number) => {
        const target = new Date(date.getFullYear(), date.getMonth() + offset, 1);
        const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = target.getDay();
        const monthName = target.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        return (
            <div className="flex-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-3 px-1 text-[#E87B00]">
                    {offset === 0 ? <ChevronLeft size={16} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => changeMonth(-1)} /> : <div className="w-4" />}
                    <span className="font-bold text-gray-800 text-xs capitalize">{monthName}</span>
                    {offset === 1 ? <ChevronRight size={16} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => changeMonth(1)} /> : <div className="w-4" />}
                </div>
                <div className="grid grid-cols-7 text-center text-[10px]">
                    {['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'].map(d => (
                        <div key={d} className="text-gray-400 font-semibold mb-2 capitalize">{d}</div>
                    ))}
                    {[...Array(firstDayOfMonth)].map((_, i) => <div key={i} className="py-1"></div>)}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dObj = new Date(target.getFullYear(), target.getMonth(), day);
                        const isStart = rangeStart?.toDateString() === dObj.toDateString();
                        const isEnd = rangeEnd?.toDateString() === dObj.toDateString();
                        const inRange = rangeStart && rangeEnd && dObj > rangeStart && dObj < rangeEnd;
                        const isToday = hoy.toDateString() === dObj.toDateString();

                        // Determinar los bordes redondeados según el estado del rango seleccionado
                        let roundedClass = "rounded-none";
                        if (isStart && isEnd) {
                            roundedClass = "rounded-full";
                        } else if (isStart) {
                            roundedClass = rangeEnd ? "rounded-l-full" : "rounded-full";
                        } else if (isEnd) {
                            roundedClass = "rounded-r-full";
                        }

                        return (
                            <div
                                key={day}
                                onClick={() => handleDateClick(day, offset)}
                                className={`relative py-1 cursor-pointer flex justify-center items-center transition-colors 
                                    ${inRange || isStart || isEnd ? 'bg-[#F7D8B5]' : 'hover:bg-gray-100 rounded-full'} 
                                    ${roundedClass}`}
                            >
                                <span className={`z-10 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold transition-all
                                    ${isStart || isEnd ? 'border border-black bg-white text-black' : ''} 
                                    ${isToday ? 'bg-[#E87B00] border border-black text-white' : ''}`}
                                >
                                    {day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearHistory = async () => {
        if (properties.length === 0) return;
        if (!confirm("¿Deseas borrar todo tu historial de vistas?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/perfil/historial/limpiar`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setProperties([]);
                setFilteredProperties([]);
                setCurrentPage(1);
            } else {
                console.error("Error al intentar limpiar el historial en el servidor");
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-black">Conectando con PropBol...</div>;

    return (
        <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 font-sans text-black">
            <div className="max-w-7xl mx-auto relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Propiedades vistas recientemente</h1>
                        <p className="text-gray-500 text-xs font-semibold">
                            Total en sistema: {filteredProperties.length} propiedades
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                <Calendar size={16} /> Filtrar por Fecha
                            </button>
                        </div>

                        <button
                            onClick={handleClearHistory}
                            disabled={properties.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-lg shadow-sm text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} /> Limpiar Historial
                        </button>
                    </div>
                </div>

                {/* CALENDARIO REAJUSTADO - COMPACTO Y ADAPTABLE */}
                {showCalendar && (
                    <div className="absolute top-16 right-0 z-50 bg-[#FDF9F0] border border-[#F3C291] rounded-xl shadow-lg p-4 w-full max-w-[460px] animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            {renderMonth(currentDate, 0)}
                            {renderMonth(currentDate, 1)}
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-orange-100">
                            {/* APLICAR RANGO (IZQUIERDA) */}
                            <button
                                onClick={applyRangeFilter}
                                disabled={!rangeStart || !rangeEnd}
                                className="bg-[#E87B00] text-white px-5 py-1.5 rounded-lg font-bold text-xs shadow-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                aplicar rango
                            </button>
                            {/* LIMPIAR (DERECHA) */}
                            <button
                                onClick={handleResetFilter}
                                className="bg-[#D1D5DB] text-[#4B4B4B] px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-gray-300 transition-colors"
                            >
                                <Trash2 size={12} /> limpiar
                            </button>
                        </div>
                    </div>
                )}

                {/* GRID DE CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[600px]">
                    {currentProperties.length > 0 ? (
                        currentProperties.map((prop: any) => (
                            <PropertyCard
                                key={prop.id}
                                prop={prop}
                                onVerDetalle={(id) => router.push(`/detalle-propiedad/${id}`)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-xl">
                            {properties.length === 0 ? "No hay registros en tu historial." : "No hay resultados para esta fecha."}
                        </div>
                    )}
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 mb-10 gap-2">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                    currentPage === i + 1
                                        ? 'bg-[#E87B00] text-white shadow-md'
                                        : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}