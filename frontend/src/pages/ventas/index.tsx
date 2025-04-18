import SearchBar from '@/components/searchbar';
import { Button } from '@/components/ui/button';
import TicketTable from '@/components/ventas/ticket-table';

const Ventas = () => {
  return (
    <div className="w-full px-6">
      <div className="mt-8 gap-4 flex items-center">
        <SearchBar className="w-full" placeholder="Buscar producto..." size="md" />
        <Button variant="default" size="lg" className="h-12">
          {' '}
          Buscar
        </Button>
      </div>
      <TicketTable className="mt-10" />
    </div>
  );
};

export default Ventas;
