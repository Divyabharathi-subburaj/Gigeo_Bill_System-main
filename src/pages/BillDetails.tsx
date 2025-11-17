import { useState, useEffect } from 'react';
import { useParams,Link} from 'react-router-dom';
import { Building2, Download, Share, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import toast from 'react-hot-toast';
import localSignature from './signature.png'; // Import the local image
import companyLogo from './logo.jpg'; // Import the local image



const styles = StyleSheet.create({
  
  document: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderWidth: 1,
  },
  page: {
    
    padding: 30,
    // fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'green',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  companyName: {
    fontSize: 13,
    fontWeight: 'bold',
    color:'1f2553',
  },
  companyhead:{
    fontSize: 10,
    paddingBottom:'1',
    
  },
  invoiceDetails: {
    marginBottom: 20,
    fontSize:10,
  },
  table: {
    marginTop: 20,
    fontSize:10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'green',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: 'lightgreen',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
    fontSize:10,
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize:10,
  },
  signatureImage: {
    width: 100, // Set the desired width
    height: 50, // Set the desired height
    resizeMode: 'contain', // Ensure the image maintains aspect ratio
  },
  companyLogo: {
    width: 100,  // Set the desired width for the logo
    height: 50,  // Set the desired height for the logo
    resizeMode: 'contain', // Ensure the logo maintains aspect ratio
    marginBottom: 10, // Add some spacing below the logo
  },
  container: {
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically if needed
  },
  text: {
    fontSize: 12, // Optional: Adjust the text size
    fontWeight: 'bold', // Optional: Make the text bold
    color:'green',
  },
  amount:{
    padding:2,
  },
  amount_total:{
    padding:2,
    backgroundColor:'lightgreen',
  },
  row: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space out items evenly
  },
  label: {
    flexDirection: 'row', // Align items horizontally
    padding:2,
    textAlign: 'left', // Align text to the left
  },
  label1: {
    flexDirection: 'row', // Align items horizontally
    padding:2,
    textAlign: 'left', // Align text to the left
    backgroundColor: 'lightgreen',

  },
});

const BillPDF = ({ bill, customer, items, profile }: any) => (
  <Document style={styles.document}>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{profile?.company_name || 'Gigeo Enterprises'}</Text>
          <Text style={styles.companyhead}>{profile?.company_address || 'Ssp Complex Apc Clg Opp Thoothukudi'}</Text>
          <Text style={styles.companyhead}>Phone no.: 6383997744</Text>
          <Text style={styles.companyhead}>Email: gigeoenterprises@gmail.com</Text>
          <Text style={styles.companyhead}>GSTIN:33LIJPS3752H1ZS {profile?.gstin}</Text>
          <Text style={styles.companyhead}>State: 33-Tamil Nadu</Text>
        </View>
        <View>
          <Image source={companyLogo} style={styles.companyLogo} />

          {/* <Text style={styles.companyhead}>Invoice #{bill.invoice_number}</Text>
          <Text style={styles.companyhead}>Date: {new Date(bill.created_at).toLocaleDateString()}</Text> */}
        </View>  
      </View>
      <View style={styles.container}>
        <Text style={styles.text}>Tax Invoice</Text>
      </View>
      <View style={styles.header1}>
        <View style={styles.invoiceDetails}>
          <Text style={{ fontWeight: 'bold' }}>Bill To:</Text>
          <Text>{customer.name}</Text>
          {customer.address && <Text>{customer.address}</Text>}
          {customer.mobile_number && <Text>Mobile: {customer.mobile_number}</Text>}
        </View>
        <View>
            <Text style={styles.companyhead}>Invoice #{bill.invoice_number}</Text>
            <Text style={styles.companyhead}>
                Date: {new Date(bill.created_at).toLocaleDateString('en-GB')}
            </Text>
        </View>

      </View>

      <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>#</Text> {/* Serial Number Column */}
            <Text style={styles.tableCell}>Item</Text>
            <Text style={styles.tableCell}>Quantity</Text>
            <Text style={styles.tableCell}>Price/unit</Text>
            <Text style={styles.tableCell}>Amount</Text>
          </View>

          {/* Table Rows */}
          {items.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{index + 1}</Text> {/* Serial Number */}
              <Text style={styles.tableCell}>{item.item_name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>
                Rs.{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.tableCell}>
                RS.{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
    </View>


    <View style={styles.totals}>
      <View style={styles.row}>
        <Text style={styles.label}>Sub Total:</Text>
        <Text style={styles.amount}>Rs.{bill.sub_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Discount:</Text>
        <Text style={styles.amount}>Rs.{bill.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label1}>Total:</Text>
        <Text style={styles.amount_total}>Rs.{bill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Amount Received:</Text>
        <Text style={styles.amount}>Rs.{bill.amount_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Balance:</Text>
        <Text style={styles.amount}>Rs.{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      </View>
    </View>

      <View style={styles.signature}>
      <View>
        <Text>Authorized Signatory.</Text>
        {profile?.signature_url ? (
          <Image src={profile.signature_url} />
        ) : (
          <Image src={localSignature} 
          style={styles.signatureImage} /> // Use local image if `signature_url` is unavailable
        )}
      </View>
        <View>
          <Text>For {profile?.company_name || 'Gigeo Enterprises'}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function BillDetails() {
  const { id } = useParams();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        // Fetch bill details
        const { data: billData } = await supabase
          .from('bills')
          .select(`
            *,
            customers (*)
          `)
          .eq('id', id)
          .single();

        if (billData) {
          setBill(billData);
          setCustomer(billData.customers);

          // Fetch bill items
          const { data: itemsData } = await supabase
            .from('bill_items')
            .select('*')
            .eq('bill_id', id)
            .order('created_at', { ascending: true });

          setItems(itemsData || []);
        }
      } catch (error) {
        toast.error('Error fetching bill details');
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Bill not found</p>
          <Link to="/" className="mt-4 text-green text-emerald-600 hover:text-emerald-500">
            Back to Bills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/bills" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Bills
            </Link>
          </div>
          <div className="flex space-x-2">
            <PDFDownloadLink
              document={<BillPDF bill={bill} customer={customer} items={items} profile={profile} />}
              fileName={`invoice-${bill.invoice_number}.pdf`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </PDFDownloadLink>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Invoice #${bill.invoice_number}`,
                    text: `Bill from ${profile?.company_name || 'GIGEO Enterprises'}`,
                    url: window.location.href,
                  });
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200"
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bill Information */}
              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">Bill Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Invoice Number</p>
                      <p className="font-medium">#{bill.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{new Date(bill.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Mode</p>
                      <p className="font-medium capitalize">{bill.payment_mode}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-medium mb-4">Customer Details</h2>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-500">Name:</span>{' '}
                      <span className="font-medium">{customer.name}</span>
                    </p>
                    {customer.mobile_number && (
                      <p>
                        <span className="text-gray-500">Mobile:</span>{' '}
                        <span className="font-medium">{customer.mobile_number}</span>
                      </p>
                    )}
                    {customer.address && (
                      <p>
                        <span className="text-gray-500">Address:</span>{' '}
                        <span className="font-medium">{customer.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium mb-4">Items</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.item_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Sub Total:</span>
                      <span>₹{bill.sub_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Discount:</span>
                      <span>₹{bill.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total:</span>
                      <span>₹{bill.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Amount Received:</span>
                      <span>₹{bill.amount_received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Balance:</span>
                      <span>₹{bill.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="h-[800px] overflow-auto">
                <PDFViewer width="100%" height="100%">
                  <BillPDF bill={bill} customer={customer} items={items} profile={profile} />
                </PDFViewer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}