import { jsPDF } from 'jspdf';
// Import autoTable separately
import autoTable from 'jspdf-autotable';
import { Sale, SaleItem } from '../types/sales';
import { formatCurrency } from './formatters';

// Helper function to get the discount display text
function getDividendDisplay(item: SaleItem): string {
  if (item.dividendPercentage !== undefined && item.dividendPercentage > 0) {
    return `${item.dividendPercentage}%`;
  } else if (item.dividendDivisor !== undefined && item.dividendDivisor > 0) {
    return `Div. by ${item.dividendDivisor}`;
  }
  return 'None';
}

// Generate a PDF bill for a sale
export const generateSaleBill = (sale: Sale): jsPDF => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    const orgName = 'MAHASHAY BHAGWAN DAS AYURVED';
    
    // Set up document with header branding
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const orgNameWidth = doc.getStringUnitWidth(orgName) * 20 / doc.internal.scaleFactor;
    const orgNameX = (doc.internal.pageSize.width - orgNameWidth) / 2;
    doc.text(orgName, orgNameX, 20);
    
    // Add a line below the header
    doc.setLineWidth(0.5);
    doc.line(14, 25, doc.internal.pageSize.width - 14, 25);
    
    // Add bill title
    doc.setFontSize(16);
    doc.text('BILL / INVOICE', 14, 35);
    
    // Add the sale information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill No: ${sale.id}`, 14, 45);
    doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 14, 50);
    
    // Add customer information
    doc.text('Customer Details:', 14, 60);
    doc.text(`Name: ${sale.customerName}`, 14, 65);
    doc.text(`Phone: ${sale.customerPhone || 'N/A'}`, 14, 70);
    doc.text(`Address: ${sale.customerAddress || 'N/A'}`, 14, 75);
    
    // Add the items table
    const tableBody = sale.items.map((item, index) => [
      (index + 1).toString(),
      item.item.item_name,
      item.item.item_code,
      item.quantity.toString(),
      item.item.base_unit,
      formatCurrency(item.price),
      getDividendDisplay(item),
      formatCurrency(item.totalPrice)
    ]);
    
    // Using the imported autoTable function directly (notice how we apply it to doc)
    let finalY = 85;
    
    autoTable(doc, {
      startY: 85,
      head: [['#', 'Item Name', 'Item Code', 'Qty', 'Unit', 'MRP', 'Discount', 'Total']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 20, halign: 'right' },
        7: { cellWidth: 25, halign: 'right' }
      },
      didDrawPage: (data) => {
        // Footer on each page
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });
    
    // Get the end position after the table
    // We need to access it via the doc object
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Add the summary section
    doc.text('Summary:', 14, finalY);
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, 14, finalY + 5);
    doc.text(`Discount: ${formatCurrency(sale.totalDiscount)}`, 14, finalY + 10);
    if (sale.totalTax > 0) {
      doc.text(`Tax: ${formatCurrency(sale.totalTax)}`, 14, finalY + 15);
      doc.text(`Grand Total: ${formatCurrency(sale.grandTotal)}`, 14, finalY + 20);
    } else {
      doc.text(`Grand Total: ${formatCurrency(sale.grandTotal)}`, 14, finalY + 15);
    }
    
    // Add payment information
    doc.text(`Payment Method: ${sale.paymentMethod}`, 14, finalY + 30);
    
    // Add notes if they exist
    if (sale.notes) {
      doc.text('Notes:', 14, finalY + 40);
      doc.text(sale.notes, 14, finalY + 45);
    }
    
    // Add a thank you message
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', doc.internal.pageSize.width / 2, finalY + 55, { align: 'center' });
    
    // Add footer with contact information
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${orgName} | Contact: 123-456-7890 | Email: info@mbda.com`, 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 5, 
      { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Save and download the PDF
export const downloadSaleBill = (sale: Sale): void => {
  try {
    const doc = generateSaleBill(sale);
    const fileName = `Bill_${sale.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error downloading bill:", error);
    alert("Failed to download the bill. Please try again.");
  }
};

// Print the PDF directly
export const printSaleBill = (sale: Sale): void => {
  try {
    const doc = generateSaleBill(sale);
    doc.autoPrint();
    doc.output('dataurlnewwindow');
  } catch (error) {
    console.error("Error printing bill:", error);
    alert("Failed to print the bill. Please try downloading instead.");
  }
};

// Export sale to JSON
export const exportSaleToJson = (sale: Sale): void => {
  try {
    // Create a JSON string from the sale object
    const saleData = JSON.stringify(sale, null, 2);
    
    // Create a download link
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(saleData));
    element.setAttribute('download', `Sale_${sale.id}.json`);
    element.style.display = 'none';
    
    // Add to document, click to download, then remove
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  } catch (error) {
    console.error("Error exporting sale to JSON:", error);
    alert("Failed to export sale data to JSON.");
  }
};