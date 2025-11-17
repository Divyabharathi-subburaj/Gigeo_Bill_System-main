import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Plus, Download, Share, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import toast from 'react-hot-toast';

interface BillItem {
  id?: string;
  item_name: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Customer {
  id?: string;
  name: string;
  mobile_number?: string;
  email?: string;
  address?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  invoiceDetails: {
    marginBottom: 20,
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const BillPDF = ({ bill, customer, items, profile }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{profile?.company_name || 'GIGEO Enterprises'}</Text>
          <Text>{profile?.company_address}</Text>
          <Text>GSTIN: {profile?.gstin}</Text>
        </View>
        <View>
          <Text>Invoice #{bill.invoice_number}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.invoiceDetails}>
        <Text style={{ fontWeight: 'bold' }}>Bill To:</Text>
        <Text>{customer.name}</Text>
        {customer.address && <Text>{customer.address}</Text>}
        {customer.mobile_number && <Text>Mobile: {customer.mobile_number}</Text>}
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Item</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Price</Text>
          <Text style={styles.tableCell}>Amount</Text>
        </View>
        {items.map((item: BillItem, index: number) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.item_name}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.tableCell}>₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <Text>Sub Total: ₹{bill.sub_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <Text>Discount: ₹{bill.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <Text style={{ fontWeight: 'bold' }}>Total: ₹{bill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <Text>Amount Received: ₹{bill.amount_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
        <Text>Balance: ₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>

      <View style={styles.signature}>
        <View>
          <Text>Authorized Signatory</Text>
          {/* {profile?.signature_url && <Image src={profile.signature_url} />} */}
        </View>
        <View>
          <Text>For {profile?.company_name || 'GIGEO Enterprises'}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function NewBill() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: '' });
  const [items, setItems] = useState<BillItem[]>([{ item_name: '', quantity: 1, price: 0, amount: 0 }]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    const generateInvoiceNumber = async () => {
      const { data } = await supabase.rpc('generate_invoice_number');
      setInvoiceNumber(data);
    };
    generateInvoiceNumber();
  }, []);

  const calculateAmount = (item: BillItem) => {
    return item.quantity * item.price;
  };

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = calculateAmount(newItems[index]);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 1, price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const total = subTotal - discount;
  const balance = total - amountReceived;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create or get customer
      let customerId = customer.id;
      if (!customerId) {
        const { data: newCustomer } = await supabase
          .from('customers')
          .insert(customer)
          .select()
          .single();
        customerId = newCustomer?.id;
      }

      // Create bill
      const { data: bill } = await supabase
        .from('bills')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: customerId,
          sub_total: subTotal,
          discount,
          total,
          payment_mode: paymentMode,
          amount_received: amountReceived,
          balance,
          created_by: user?.id,
        })
        .select()
        .single();

      // Create bill items
      await supabase
        .from('bill_items')
        .insert(items.map(item => ({ ...item, bill_id: bill?.id })));

      toast.success('Bill created successfully!');
      navigate(`/bills/${bill?.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const billData = {
    invoice_number: invoiceNumber,
    sub_total: subTotal,
    discount,
    total,
    amount_received: amountReceived,
    balance,
    payment_mode: paymentMode,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">New Bill</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bill Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Details */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Customer Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      placeholder='Type here...'
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 border-emerald-500 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      type="text"
                      placeholder='+91'
                      value={customer.mobile_number || ''}
                      onChange={(e) => setCustomer({ ...customer, mobile_number: e.target.value })}
                      className="mt-1 block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={customer.address || ''}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder='House No. 12, Street Name,
Area/Locality,
City, State,
Country - ZIP Code' 
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Items</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Item name"
                          value={item.item_name}
                          onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                          className="block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                          className="block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          step="0.01"
                          placeholder="Price"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                          className="block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          readOnly
                          value={`₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                          className="block w-full border-gray-300 bg-gray-50 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white shadow p-6">
                <h2 className="text-lg font-medium mb-4">Payment Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Discount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount Received</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amountReceived}
                      required
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value <= subTotal) {
                          setAmountReceived(value);
                        } else {
                          alert("Amount received cannot exceed the total amount.");
                        }
                      }}
                      className="mt-1 block w-full border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    />
                  </div>

                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Sub Total:</span>
                    <span>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Discount:</span>
                    <span>₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Amount Received:</span>
                    <span>₹{amountReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Balance:</span>
                    <span>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  to="/bills"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Generating Bill...' : 'Generate Bill'}
                </button>
              </div>
            </form>
          </div>

          {/* Bill Preview */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Preview</h2>
              <div className="flex space-x-2">
                <PDFDownloadLink
                  document={<BillPDF bill={billData} customer={customer} items={items} profile={profile} />}
                  fileName={`invoice-${invoiceNumber}.pdf`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </PDFDownloadLink>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Invoice #${invoiceNumber}`,
                        text: `Bill from ${profile?.company_name || 'GIGEO Enterprises'}`,
                        url: window.location.href,
                      });
                    }
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </button>
              </div>
            </div>
            <div className="h-[800px] overflow-auto">
              <PDFViewer width="100%" height="100%">
                <BillPDF 
                bill={billData}
                customer={customer}
                items={items}
                profile={profile}
                />
              </PDFViewer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}