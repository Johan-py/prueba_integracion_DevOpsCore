import { useFilters } from "@/hooks/useFilters";
import PropertyTypeFilter from "./PropertyTypeFilter";
import TransactionModeFilter from "./TransactionModeFilter";

export default function FilterBar() {
  const { tipos, modo, toggleTipo, cambiarModo } = useFilters();

  return (
    <div className="bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px] h-[159px]">

      <TransactionModeFilter 
        selected={modo} 
        onChange={cambiarModo} 
      />

      <div className="flex items-center gap-16">
        <PropertyTypeFilter 
          selected={tipos} 
          onToggle={toggleTipo} 
        />
      </div>

    </div>
  );
}
