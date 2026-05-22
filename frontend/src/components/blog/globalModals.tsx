import React from "react";
import { Trash2, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

type ModalVariant = "danger" | "warning" | "success" | "info";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
}

const variantConfig = {
    danger: {
        icon: Trash2,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        glowColor: "bg-red-500/20",
        buttonBg: "bg-red-500 hover:bg-red-600 shadow-red-500/30",
        ringColor: "ring-red-50/50",
        borderColor: "border-red-100",
    },
    warning: {
        icon: AlertTriangle,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        glowColor: "bg-amber-500/20",
        buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
        ringColor: "ring-amber-50/50",
        borderColor: "border-amber-100",
    },
    success: {
        icon: CheckCircle,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        glowColor: "bg-emerald-500/20",
        buttonBg: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
        ringColor: "ring-emerald-50/50",
        borderColor: "border-emerald-100",
    },
    info: {
        icon: Info,
        iconBg: "bg-stone-50",
        iconColor: "text-[#a56400]",
        glowColor: "bg-[#a56400]/10",
        buttonBg: "bg-[#a56400] hover:bg-[#8f5700] shadow-[#a56400]/30",
        ringColor: "ring-stone-100/50",
        borderColor: "border-stone-100",
    },
};

export function GenericConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "info",
    isLoading = false,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[440px] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón de cerrar elegante */}
                <button
                    className="absolute top-6 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-stone-50 text-stone-300 transition-all hover:bg-stone-100 hover:text-stone-500 active:scale-90"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <span className="text-xl">✕</span>
                </button>

                <div className="relative p-10 text-center">
                    {/* Brillos decorativos de fondo */}
                    <div className={`absolute -left-10 -top-10 -z-10 h-40 w-40 ${config.glowColor} blur-[60px] opacity-50 rounded-full`}></div>

                    {/* Contenedor del Icono */}
                    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] ${config.iconBg} mb-6 relative shadow-sm`}>
                        <Icon size={32} strokeWidth={2} className={`${config.iconColor} relative z-10`} />
                    </div>

                    <h3 className="text-2xl font-bold text-stone-900 mb-3 tracking-tight">
                        {title}
                    </h3>

                    <p className="text-stone-500 mb-10 leading-relaxed text-sm sm:text-base px-2">
                        {description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 order-2 sm:order-1 px-6 py-4 rounded-2xl border border-stone-100 text-stone-500 font-bold uppercase tracking-[0.12em] text-[11px] hover:bg-stone-50 hover:text-stone-900 transition-all duration-300 active:scale-95 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 order-1 sm:order-2 px-6 py-4 rounded-2xl ${config.buttonBg} text-white font-bold uppercase tracking-[0.12em] text-[11px] shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {isLoading ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : null}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

export function DeleteConfirmationModal(props: DeleteConfirmationModalProps) {
    return (
        <GenericConfirmationModal
            {...props}
            variant="danger"
            title={props.title || "¿Eliminar comentario?"}
            description={props.description || "Esta acción es permanente y no podrá deshacerse."}
            confirmText={props.confirmText || "Sí, eliminar"}
        />
    );
}