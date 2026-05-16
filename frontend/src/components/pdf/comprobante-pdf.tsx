import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { SaleOrder } from '@/services/sale-orders.service';

// Registrar fuentes
Font.register({
  family: 'Helvetica',
  fonts: [],
});

const TYPE_LABEL = {
  sale: 'FACTURA',
  remito: 'REMITO',
  presupuesto: 'PRESUPUESTO',
};

const STATUS_LABEL = {
  pending: 'PENDIENTE',
  completed: 'COMPLETADO',
  cancelled: 'CANCELADO',
  returned: 'DEVUELTO',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 40,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },

  // Header empresa
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
  },
  logoImage: {
    width: 120,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 8,
    color: '#555',
  },

  // Tipo de comprobante
  typeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },

  // Factura — borde doble simulado con dos bordes
  typeBoxSale: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
    position: 'relative',
  },
  typeBoxSaleInner: {
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
    padding: 6,
    alignItems: 'center',
  },

  // Remito — borde simple
  typeBoxRemito: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Presupuesto — borde punteado
  typeBoxPresupuesto: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeLabel: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    textAlign: 'center',
  },
  typeLabelPresupuesto: {
    fontSize: 16,
    fontFamily: 'Helvetica-Oblique',
    letterSpacing: 2,
    textAlign: 'center',
  },
  typeOrderId: {
    fontSize: 8,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  typeStatus: {
    fontSize: 7,
    marginTop: 3,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
  },

  // Cliente
  clientBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderStyle: 'solid',
  },
  clientLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: '#555',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  clientDetail: {
    fontSize: 8,
    color: '#555',
    marginTop: 2,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginVertical: 10,
  },
  dividerLight: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#aaa',
    marginVertical: 6,
  },

  // Tabla productos
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 5,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: '#333',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
  },

  colArticulo: { flex: 4 },
  colCant: { flex: 1, textAlign: 'center' },
  colPrecio: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },

  cellText: { fontSize: 9 },
  cellTextBold: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  cellTextMuted: { fontSize: 8, color: '#777' },

  // Totales
  totalsSection: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 40,
    marginTop: 3,
  },
  totalLabel: {
    fontSize: 8,
    color: '#555',
    width: 80,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 8,
    width: 80,
    textAlign: 'right',
  },
  totalRowFinal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 40,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#1a1a1a',
  },
  totalLabelFinal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    width: 80,
    textAlign: 'right',
  },
  totalValueFinal: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    width: 80,
    textAlign: 'right',
  },

  // Pagos
  pagosSection: {
    marginTop: 16,
  },
  pagosTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: '#555',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pagoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  pagoLabel: {
    fontSize: 8,
    color: '#333',
    textTransform: 'capitalize',
  },
  pagoValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Footer
  footer: {
    marginTop: 32,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#aaa',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8,
    color: '#888',
    letterSpacing: 1,
  },
  footerNote: {
    fontSize: 7,
    color: '#aaa',
    marginTop: 3,
  },
});

interface ComprobantePDFProps {
  order: SaleOrder;
  companyName?: string;
  branchName?: string;
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

function TypeBox({
  type,
  orderId,
  status,
}: {
  type: SaleOrder['type'];
  orderId: string;
  status: SaleOrder['status'];
}) {
  if (type === 'sale') {
    return (
      <View style={styles.typeBoxSale}>
        <View style={styles.typeBoxSaleInner}>
          <Text style={styles.typeLabel}>{TYPE_LABEL[type]}</Text>
          <Text style={styles.typeOrderId}>#{orderId.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.typeStatus}>{STATUS_LABEL[status]}</Text>
        </View>
      </View>
    );
  }

  if (type === 'remito') {
    return (
      <View style={styles.typeBoxRemito}>
        <Text style={styles.typeLabel}>{TYPE_LABEL[type]}</Text>
        <Text style={styles.typeOrderId}>#{orderId.slice(0, 8).toUpperCase()}</Text>
        <Text style={styles.typeStatus}>{STATUS_LABEL[status]}</Text>
      </View>
    );
  }

  return (
    <View style={styles.typeBoxPresupuesto}>
      <Text style={styles.typeLabelPresupuesto}>{TYPE_LABEL[type]}</Text>
      <Text style={styles.typeOrderId}>#{orderId.slice(0, 8).toUpperCase()}</Text>
      <Text style={styles.typeStatus}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function ComprobantePDF({ order }: ComprobantePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Image style={styles.logoImage} src="/assets/logo.png" />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>
              {new Date(order.created_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.dateText}>
              {new Date(order.created_at).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Tipo + Cliente */}
        <View style={styles.typeSection}>
          <TypeBox type={order.type} orderId={order.id} status={order.status} />
          <View style={styles.clientBox}>
            <Text style={styles.clientLabel}>Cliente</Text>
            {order.customers ? (
              <>
                <Text style={styles.clientName}>{order.customers.full_name}</Text>
                {order.customers.tax_id && (
                  <Text style={styles.clientDetail}>
                    CUIT/DNI: {order.customers.tax_id}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.clientDetail}>Consumidor final</Text>
            )}
            {order.profiles && (
              <Text style={styles.clientDetail}>
                Vendedor: {order.profiles.full_name}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Tabla productos */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colArticulo]}>Artículo</Text>
          <Text style={[styles.tableHeaderText, styles.colCant]}>Cant.</Text>
          <Text style={[styles.tableHeaderText, styles.colPrecio]}>P. Unit.</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
        </View>

        <View style={styles.dividerLight} />

        {order.items.map((item, index) => (
          <View
            key={index}
            style={
              index === order.items.length - 1 ? styles.tableRowLast : styles.tableRow
            }
          >
            <View style={styles.colArticulo}>
              <Text style={styles.cellTextBold}>{item.name}</Text>
              {item.sku && <Text style={styles.cellTextMuted}>{item.sku}</Text>}
              {item.discount_value && (
                <Text style={styles.cellTextMuted}>
                  Desc:{' '}
                  {item.discount_type === 'percentage'
                    ? `${item.discount_value}%`
                    : formatCurrency(item.discount_value)}
                </Text>
              )}
            </View>
            <Text style={[styles.cellText, styles.colCant]}>
              {item.quantity} {item.unit ?? 'u'}
            </Text>
            <Text style={[styles.cellText, styles.colPrecio]}>
              {formatCurrency(item.unit_price)}
            </Text>
            <Text style={[styles.cellTextBold, styles.colTotal]}>
              {formatCurrency(item.subtotal)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          {order.tax_total > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Impuestos</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.tax_total)}</Text>
            </View>
          )}
          {order.discount_value && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento</Text>
              <Text style={styles.totalValue}>
                -
                {order.discount_type === 'percentage'
                  ? `${order.discount_value}%`
                  : formatCurrency(order.discount_value)}
              </Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalLabelFinal}>TOTAL</Text>
            <Text style={styles.totalValueFinal}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Pagos */}
        {order.payments && order.payments.length > 0 && (
          <View style={styles.pagosSection}>
            <View style={styles.dividerLight} />
            <Text style={styles.pagosTitle}>Forma de pago</Text>
            {order.payments.map((payment) => (
              <View key={payment.id} style={styles.pagoRow}>
                <Text style={styles.pagoLabel}>
                  {payment.payment_methods?.name ?? '—'}
                  {payment.reference ? ` (${payment.reference})` : ''}
                </Text>
                <Text style={styles.pagoValue}>{formatCurrency(payment.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Gracias por su compra</Text>
          {order.type === 'presupuesto' && (
            <Text style={styles.footerNote}>
              Este presupuesto tiene validez de 30 días desde su emisión.
            </Text>
          )}
          {order.afip_cae && <Text style={styles.footerNote}>CAE: {order.afip_cae}</Text>}
        </View>
      </Page>
    </Document>
  );
}
