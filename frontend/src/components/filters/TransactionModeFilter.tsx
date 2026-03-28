"use client";
import { useState } from "react";

export default function TransactionModeFilter() {
  const [checked, setChecked] = useState({
    venta: false,
    alquiler: false,
    anticretico: false
  });

  const handleChange = (name: string) => {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex flex-center gap-16">
      <label className="flex items-center gap-7 text-sm text-stone-900 font-medium">
        <div className="relative inline-flex">
          <input
            type="checkbox"
            checked={checked.venta}
            onChange={() => handleChange('venta')}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              width: '35px',
              height: '23px',
              backgroundColor: checked.venta ? '#d97706' : '#fff',
              border: '1px solid #8C8787',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: 0
            }}
          />
          {checked.venta && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#000000',
                fontSize: '12px',
                fontWeight: '300',
                lineHeight: 1,
                pointerEvents: 'none'
              }}
            >
              ✓
            </span>
          )}
        </div>
        Venta
      </label>

      <label className="flex items-center gap-7 text-sm text-stone-900 font-medium">
        <div className="relative inline-flex">
          <input
            type="checkbox"
            checked={checked.alquiler}
            onChange={() => handleChange('alquiler')}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              width: '35px',
              height: '23px',
              backgroundColor: checked.alquiler ? '#d97706' : '#fff',
              border: '1px solid #8C8787',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: 0
            }}
          />
          {checked.alquiler && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#000000',
                fontSize: '12px',
                fontWeight: '300',
                lineHeight: 1,
                pointerEvents: 'none'
              }}
            >
              ✓
            </span>
          )}
        </div>
        Alquiler
      </label>

      <label className="flex items-center gap-7 text-sm text-stone-900 font-medium">
        <div className="relative inline-flex">
          <input
            type="checkbox"
            checked={checked.anticretico}
            onChange={() => handleChange('anticretico')}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              width: '35px',
              height: '23px',
              backgroundColor: checked.anticretico ? '#d97706' : '#fff',
              border: '1px solid #8C8787',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: 0
            }}
          />
          {checked.anticretico && (
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#000000',
                fontSize: '12px',
                fontWeight: '300',
                lineHeight: 1,
                pointerEvents: 'none'
              }}
            >
              ✓
            </span>
          )}
        </div>
        Anticrético
      </label>
    </div>
  );
}