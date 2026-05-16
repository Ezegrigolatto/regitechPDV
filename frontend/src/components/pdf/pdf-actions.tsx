import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Printer, Download, Loader2 } from 'lucide-react';
import { ComprobantePDF } from './comprobante-pdf';
import type { SaleOrder } from '@/services/sale-orders.service';

interface PDFActionsProps {
  order: SaleOrder;
  companyName?: string;
  branchName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function PDFActions({
  order,
  companyName = 'REGITECH',
  branchName = 'Casa Central',
  variant = 'outline',
  size = 'default',
}: PDFActionsProps) {
  const [loadingPrint, setLoadingPrint] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const generateBlob = async () => {
    const doc = (
      <ComprobantePDF order={order} companyName={companyName} branchName={branchName} />
    );
    return await pdf(doc).toBlob();
  };

  const handlePrint = async () => {
    setLoadingPrint(true);
    try {
      const blob = await generateBlob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch (err) {
      console.error('Error al imprimir:', err);
    } finally {
      setLoadingPrint(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDownload(true);
    try {
      const blob = await generateBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${order.id.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar:', err);
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handlePrint}
        disabled={loadingPrint || loadingDownload}
        className="flex-1"
      >
        {loadingPrint ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {loadingPrint ? 'Preparando...' : 'Imprimir'}
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={loadingPrint || loadingDownload}
        className="flex-1"
      >
        {loadingDownload ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {loadingDownload ? 'Generando...' : 'Descargar'}
      </Button>
    </div>
  );
}
