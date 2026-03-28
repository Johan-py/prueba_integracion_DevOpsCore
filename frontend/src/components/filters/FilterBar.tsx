import PropertyTypeFilter from "./PropertyTypeFilter"
import TransactionModeFilter from "./TransactionModeFilter"

export default function FilterBar() {

  return (
    <div className="bg-white shadow-lg rounded-[30px] p-6 flex flex-col gap-6 w-[921px] h-[159px]">

      <TransactionModeFilter />

      <div className="flex items-center gap-16">
        <PropertyTypeFilter />
        
        {/*Ejemplo de zonna, deben crear el componente*/}
        
      </div>
    </div>
  )
}