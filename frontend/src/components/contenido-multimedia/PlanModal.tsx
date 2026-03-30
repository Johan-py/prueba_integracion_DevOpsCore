type PlanModalProps = {
  open: boolean;
  onClose: () => void;
  onPayNow?: () => void;
};

export default function PlanModal({
  open,
  onClose,
  onPayNow,
}: PlanModalProps) {
  if (!open) return null;

  return (
    <div>
      <h2>Planes</h2>
      <button onClick={onClose}>Cerrar</button>
      <button onClick={onPayNow}>Pagar</button>
    </div>
  );
}