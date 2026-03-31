'use client'; 

import React, { useState } from 'react';
import SecurityModal from './SecurityModal';
import OtpModal from './OtpModal';

export default function ProfileCard() {
  // Estados para el flujo de la HU-05
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  
  // Estados para el valor del correo
  const [originalEmail, setOriginalEmail] = useState('perfil1@gmail.com');
  const [tempEmail, setTempEmail] = useState('perfil1@gmail.com');

  // Validación básica de formato de correo (Criterio de Aceptación)
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // El botón guardar solo se activa si el correo cambió y el formato es válido
  const canSave = tempEmail !== originalEmail && isValidEmail(tempEmail);

  // --- MANEJADORES DE EVENTOS ---
  const handlePasswordSubmit = (password: string) => {
    // Aquí iría la llamada al backend para validar contraseña
    setIsEmailEditable(true);
    setIsSecurityModalOpen(false);
  };

  const handleSaveClick = () => {
    if (!canSave) return;
    // Se abre el modal OTP en lugar de guardar directamente
    setIsOtpModalOpen(true);
  };

  const handleOtpSubmit = (code: string) => {
    // Si el código es correcto, guardamos el nuevo correo y bloqueamos todo
    setOriginalEmail(tempEmail);
    setIsEmailEditable(false);
    setIsOtpModalOpen(false);
  };

  return (
    <div className="bg-gray-100 p-8 rounded-xl flex flex-col md:flex-row gap-10 items-center md:items-start">
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/3">
        <div className="w-28 h-28 rounded-full bg-gray-300"></div>
        <p className="mt-4 font-semibold text-lg">Perfil1</p>
        <p className="text-sm text-gray-500">{originalEmail}</p>
      </div>

      {/* LADO DERECHO */}
      <div className="w-full md:w-2/3">
        <h2 className="text-xl font-bold mb-6 text-stone-900">Datos Personales</h2>

        <div className="flex flex-col gap-4">
          {[
            'Nombre Completo',
            'E-mail',
            'Teléfono',
            'Teléfono 2',
            'País',
            'Género',
            'Dirección'
          ].map((label, index) => {
            const isEmailField = label === 'E-mail';
            const isLocked = isEmailField && !isEmailEditable;

            return (
              <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <label className="w-full md:w-40 font-medium text-stone-700">{label}:</label>

                {isEmailField ? (
                  <div className="flex-1 flex flex-col">
                    <input 
                      type="email" 
                      className={`w-full bg-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 ${isLocked ? 'cursor-pointer hover:bg-gray-300' : 'bg-white border border-amber-600'}`} 
                      readOnly={isLocked}
                      onClick={isLocked ? () => setIsSecurityModalOpen(true) : undefined}
                      value={tempEmail}
                      onChange={(e) => setTempEmail(e.target.value)}
                    />
                    {/* Mensaje de error si el formato es inválido mientras edita */}
                    {isEmailEditable && tempEmail.length > 0 && !isValidEmail(tempEmail) && (
                      <span className="text-red-500 text-xs mt-1">Formato de correo inválido</span>
                    )}
                  </div>
                ) : (
                  <input type="text" className="flex-1 bg-gray-200 px-3 py-2 rounded" />
                )}

                <div className="w-10 hidden md:block"></div>
              </div>
            );
          })}
          
          {/* Botón de Guardar Cambios (Solo aparece si el email está en modo edición) */}
          {isEmailEditable && (
            <div className="flex justify-end mt-4 pr-0 md:pr-14">
               <button
                  type="button"
                  onClick={() => {
                    setIsEmailEditable(false);
                    setTempEmail(originalEmail); // Cancela y revierte al original
                  }}
                  className="px-4 py-2 text-stone-600 mr-3 hover:bg-stone-200 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveClick}
                  disabled={!canSave}
                  className={`px-4 py-2 rounded font-medium transition-colors ${canSave ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-stone-300 text-stone-500 cursor-not-allowed'}`}
                >
                  Guardar cambios
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales integrados */}
      <SecurityModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)} 
        onSubmit={handlePasswordSubmit} 
      />

      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSubmit={handleOtpSubmit}
        onResendCode={() => console.log("Reenviando código OTP...")}
      />
    </div>
  )
}
