import { jsPDF } from 'jspdf';
// Import autoTable separately
import autoTable from 'jspdf-autotable';
import { Sale, SaleItem } from '../types/sales';
import { InventoryItem } from '../types/inventory';
import { formatCurrency } from './formatters';

// Add extended interface to address TypeScript issues
// with additional properties that might come from different contexts
interface ExtendedInventoryItem extends InventoryItem {
  item_name?: string;
  item_code?: string;
  base_unit?: string;
}

// Helper function to get the discount display text
function getDividendDisplay(item: SaleItem): string {
  if (item.dividendPercentage !== undefined && item.dividendPercentage > 0) {
    return `${item.dividendPercentage}%`;
  } else if (item.dividendDivisor !== undefined && item.dividendDivisor > 0) {
    return `Div. by ${item.dividendDivisor}`;
  }
  return '-';
}

// Generate a PDF bill for a sale
export const generateSaleBill = (sale: Sale): jsPDF => {
  try {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const orgName = 'MAHASHAY BHAGWAN DAS AYURVED';
    
    // Document header with proper branding
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const orgNameWidth = doc.getStringUnitWidth(orgName) * 18 / doc.internal.scaleFactor;
    const orgNameX = (pageWidth - orgNameWidth) / 2;
    doc.text(orgName, orgNameX, 15);
    
    // Add a decorative border line
    doc.setDrawColor(41, 128, 185); // Blue border
    doc.setLineWidth(0.5);
    doc.line(margin, 20, pageWidth - margin, 20);
    
    // Add bill title with better styling
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185); // Blue text
    doc.text('BILL / INVOICE', margin, 30);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Create a styled section for bill information
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, 35, contentWidth / 2 - 5, 25, 'F');
    
    // Bill information with proper formatting
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill Details:', margin + 3, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bill Number: ${sale.id}`, margin + 3, 45);
    
    // Format the date more nicely
    const billDate = new Date(sale.date);
    const formattedDate = billDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Date: ${formattedDate}`, margin + 3, 50);
    
    // Payment method info
    doc.text(`Payment: ${sale.paymentMethod}`, margin + 3, 55);
    
    // Customer information section
    doc.setFillColor(245, 245, 245);
    doc.rect(pageWidth / 2 + 5, 35, contentWidth / 2, 25, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information:', pageWidth / 2 + 8, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${sale.customerName}`, pageWidth / 2 + 8, 45);
    doc.text(`Phone: ${sale.customerPhone || 'N/A'}`, pageWidth / 2 + 8, 50);
    doc.text(`Address: ${sale.customerAddress || 'N/A'}`, pageWidth / 2 + 8, 55);
    
    // Better formatting for table headers
    const tableStartY = 65;
    
    // Add the items table with clean formatting
    const tableBody = sale.items.map((item, index) => {
      // Get item name from the inventory item
      let itemName = 'Unnamed Item';
      if (item.item.desca) {
        itemName = item.item.desca;
      } else if (item.item.hasOwnProperty('item_name') && typeof (item.item as any).item_name === 'string') {
        itemName = (item.item as any).item_name;
      }
      
      // Get item code
      let itemCode = 'No Code';
      if (item.item.mcode) {
        itemCode = item.item.mcode;
      } else if (item.item.hasOwnProperty('item_code') && typeof (item.item as any).item_code === 'string') {
        itemCode = (item.item as any).item_code;
      }
      
      // Get unit
      let unit = 'Each';
      if (item.item.unit) {
        unit = item.item.unit;
      } else if (item.item.hasOwnProperty('base_unit') && typeof (item.item as any).base_unit === 'string') {
        unit = (item.item as any).base_unit;
      }
      
      // Format price and calculate amounts properly
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const totalPrice = typeof item.totalPrice === 'string' ? parseFloat(item.totalPrice) : item.totalPrice;
      
      return [
        (index + 1).toString(),
        itemName,
        itemCode,
        item.quantity.toString(),
        unit,
        formatCurrency(price),
        getDividendDisplay(item),
        formatCurrency(totalPrice)
      ];
    });
    
    autoTable(doc, {
      startY: tableStartY,
      margin: { left: margin, right: margin },
      head: [['#', 'Item Name', 'Code', 'Qty', 'Unit', 'MRP', 'Discount', 'Total']],
      body: tableBody,
      theme: 'grid',
      headStyles: { 
        fillColor: [41, 128, 185], 
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 10,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 18 },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 20, halign: 'center' },
        7: { cellWidth: 22, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      didDrawPage: (data) => {
        // Add running header and footer on each page
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        
        // Add page number at bottom (using 'as any' to handle type issues)
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
        
        // Add header on subsequent pages
        if (pageCount > 1) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('BILL / INVOICE (continued)', margin, 15);
          doc.setLineWidth(0.3);
          doc.line(margin, 18, pageWidth - margin, 18);
        }
      }
    });
    
    // Calculate position for summary section
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    
    // Create a summary box with styled borders
    doc.setDrawColor(41, 128, 185);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(pageWidth - margin - 80, finalY, 80, sale.totalTax > 0 ? 40 : 35, 2, 2, 'FD');
    
    // Add the summary section with right alignment
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMMARY', pageWidth - margin - 75, finalY + 6);
    
    // Draw a separator line
    doc.setLineWidth(0.2);
    doc.line(pageWidth - margin - 75, finalY + 8, pageWidth - margin - 5, finalY + 8);
    
    // Summary details
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - margin - 75, finalY + 15);
    doc.text(formatCurrency(sale.subtotal), pageWidth - margin - 5, finalY + 15, { align: 'right' });
    
    doc.text('Discount:', pageWidth - margin - 75, finalY + 22);
    doc.text(formatCurrency(sale.totalDiscount), pageWidth - margin - 5, finalY + 22, { align: 'right' });
    
    if (sale.totalTax > 0) {
      doc.text('Tax:', pageWidth - margin - 75, finalY + 29);
      doc.text(formatCurrency(sale.totalTax), pageWidth - margin - 5, finalY + 29, { align: 'right' });
      
      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('GRAND TOTAL:', pageWidth - margin - 75, finalY + 36);
      doc.text(formatCurrency(sale.grandTotal), pageWidth - margin - 5, finalY + 36, { align: 'right' });
    } else {
      // Total without tax line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('GRAND TOTAL:', pageWidth - margin - 75, finalY + 29);
      doc.text(formatCurrency(sale.grandTotal), pageWidth - margin - 5, finalY + 29, { align: 'right' });
    }
    
    // Add notes section if present
    if (sale.notes && sale.notes.trim()) {
      // Position notes at the left
      const notesY = Math.max(finalY + 10, finalY + (sale.totalTax > 0 ? 45 : 40));
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, notesY);
      doc.setFont('helvetica', 'normal');
      
      // Handle multi-line notes with proper wrapping
      const notesWidth = pageWidth - (2 * margin) - 90; // Leave space for the summary box
      const splitNotes = doc.splitTextToSize(sale.notes, notesWidth);
      doc.text(splitNotes, margin, notesY + 6);
    }
    
    // Add a thank you message
    const thankYouY = finalY + (sale.totalTax > 0 ? 60 : 55);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Thank you for your business!', pageWidth / 2, thankYouY, { align: 'center' });
    
    // Add a styled footer
    const footerY = doc.internal.pageSize.getHeight() - 8;
    doc.setFillColor(41, 128, 185);
    doc.rect(margin, footerY - 5, pageWidth - (2 * margin), 0.5, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`${orgName} | Contact: 123-456-7890 | Email: info@mbda.com`, 
      pageWidth / 2, 
      footerY, 
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