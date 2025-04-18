import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';

const DUMMY_PRODUCTS = [
  {
    productCode: '001',
    productName: 'Producto 1',
    price: 100,
    quantity: 2,
    totalAmount: 200,
    stock: 10,
  },
  {
    productCode: '002',
    productName:
      'Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2Producto 2',
    price: 150,
    quantity: 1,
    totalAmount: 150,
    stock: 5,
  },
  {
    productCode: '003',
    productName: 'Producto 3',
    price: 75,
    quantity: 3,
    totalAmount: 225,
    stock: 20,
  },
  {
    productCode: '004',
    productName: 'Producto 4',
    price: 200,
    quantity: 1,
    totalAmount: 200,
    stock: 8,
  },
  {
    productCode: '005',
    productName: 'Producto 5',
    price: 50,
    quantity: 4,
    totalAmount: 200,
    stock: 12,
  },
  {
    productCode: '006',
    productName: 'Producto 6',
    price: 120,
    quantity: 2,
    totalAmount: 240,
    stock: 6,
  },
  {
    productCode: '007',
    productName: 'Producto 7',
    price: 90,
    quantity: 3,
    totalAmount: 270,
    stock: 15,
  },
  {
    productCode: '008',
    productName: 'Producto 8',
    price: 60,
    quantity: 5,
    totalAmount: 300,
    stock: 25,
  },
  {
    productCode: '009',
    productName: 'Producto 9',
    price: 110,
    quantity: 2,
    totalAmount: 220,
    stock: 9,
  },
  {
    productCode: '010',
    productName: 'Producto 10',
    price: 130,
    quantity: 1,
    totalAmount: 130,
    stock: 4,
  },
];

interface TicketTableProps {
  className: string;
}

const TicketTable: React.FC<TicketTableProps> = ({ className }) => {
  return (
    <div className={`border rounded-2xl max-h-[50vh] overflow-auto scrollbar-hidden ${className}`}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-[100px] text-center">Código</TableHead>
            <TableHead>Artículo</TableHead>
            <TableHead className="text-center">Precio venta</TableHead>
            <TableHead className="text-center">Cantidad</TableHead>
            <TableHead className="text-center">Importe</TableHead>
            <TableHead className="text-center">Existencia</TableHead>
            <TableHead className="text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='max-h-[400px]' >
          {DUMMY_PRODUCTS.map((product) => (
            <TableRow key={product.productCode} className="h-14">
              <TableCell className="font-medium text-center">
                {product.productCode}
              </TableCell>
              <TableCell className="max-w-32 overflow-hidden text-ellipsis">
                {product.productName}
              </TableCell>
              <TableCell className="text-center">$ {product.price}</TableCell>
              <TableCell className="justify-center flex gap-4">
                <>
                  <MinusCircle className="cursor-pointer rounded-full" />
                  {product.quantity}
                  <PlusCircle className="cursor-pointer rounded-full" />
                </>
              </TableCell>
              <TableCell className="text-center">$ {product.totalAmount}</TableCell>
              <TableCell className="text-center">{product.stock}</TableCell>
              <TableCell className="justify-center items-center flex h-14">
                <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketTable;
