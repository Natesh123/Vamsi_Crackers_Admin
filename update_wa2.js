const fs = require('fs');

const file = 'app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const printStartStr = `  const handlePrintOrder = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {`;
const printEndStr = `  const openGlobalDiscountModal = () => {`;

const startIndex = content.indexOf(printStartStr);
const endIndex = content.indexOf(printEndStr);

if (startIndex !== -1 && endIndex !== -1) {
  let printFunc = content.substring(startIndex, endIndex);
  
  const numToWordsStart = printFunc.indexOf(`    const numberToWords = `);
  const htmlStart = printFunc.indexOf(`    const html = \``);
  const htmlEnd = printFunc.indexOf(`    \`;\n`, htmlStart) + 7;
  
  const htmlString = printFunc.substring(numToWordsStart, htmlEnd);
  
  const commonLogic = `
  const getInvoiceHTML = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return null;
${htmlString}
    return html;
  };
`;

  const newPrintOrder = `
  const handlePrintOrder = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print invoices", "error");
      return;
    }
    
    const html = getInvoiceHTML(order, extraDiscType, extraDiscValue, packingChargeStr);
    if (!html) return;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };
`;

  const newWhatsAppShare = `
  const handleWhatsAppShare = async (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return;
    const html = getInvoiceHTML(order, extraDiscType, extraDiscValue, packingChargeStr);
    if (!html) return;
    
    try {
      showToast("Generating PDF for WhatsApp...", "success");
      // @ts-ignore
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;
      
      const container = document.createElement('div');
      container.innerHTML = html;
      
      const opt = {
        margin:       0,
        filename:     \`Estimate_\${order.id}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      const file = new File([pdfBlob], \`Estimate_\${order.id}.pdf\`, { type: 'application/pdf' });
      let shared = false;
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: \`Estimate \${order.id}\`,
            text: \`Hi \${order.customer_name}, here is your estimate quotation from Vamsi Crackers.\`
          });
          shared = true;
        } catch (err) {
          console.log("Share failed, falling back to download", err);
        }
      }
      
      if (!shared) {
        // Download fallback
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`Estimate_\${order.id}.pdf\`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast("PDF downloaded. Please attach it in WhatsApp.", "success");
        
        let phone = order.customer_phone.replace(/\\D/g,'');
        if (phone.length === 10) phone = '91' + phone;
        const text = \`Hi \${order.customer_name}, here is your estimate quotation (PDF) from Vamsi Crackers. I am sending the document now.\`;
        window.open(\`https://wa.me/\${phone}?text=\${encodeURIComponent(text)}\`, '_blank');
      }
    } catch(err: any) {
      console.error(err);
      showToast("Failed to generate PDF.", "error");
    }
  };
`;

  content = content.substring(0, startIndex) + commonLogic + newPrintOrder + newWhatsAppShare + "\n" + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Successfully extracted logic and updated functions!");
} else {
  console.log("Failed to find boundaries");
}
