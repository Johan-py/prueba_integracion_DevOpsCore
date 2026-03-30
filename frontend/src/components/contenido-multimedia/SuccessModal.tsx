type SuccessModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SuccessModal({
  open,
  onClose,
}: SuccessModalProps) {
  if (!open) return null;

  return (
    <div>
      <h2>Éxito</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}