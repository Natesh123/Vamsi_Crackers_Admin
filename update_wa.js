const fs = require('fs');

const file = 'app/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const shareStartStr = `  const handleWhatsAppShare = (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {`;
const shareEndStr = `  const openGlobalDiscountModal = () => {`;

const startIndex = content.indexOf(shareStartStr);
const endIndex = content.indexOf(shareEndStr);

if (startIndex !== -1 && endIndex !== -1) {
  const printStartStr = `    const numberToWords = (num: number): string => {`;
  const printEndStr = `    printWindow.document.open();`;
  
  const printStartIdx = content.indexOf(printStartStr);
  const printEndIdx = content.indexOf(printEndStr);
  
  if (printStartIdx === -1 || printEndIdx === -1) {
      console.log("Failed to find print HTML logic");
      process.exit(1);
  }

  const htmlLogic = content.substring(printStartIdx, printEndIdx);
  
  const newFunction = `  const handleWhatsAppShare = async (order: any, extraDiscType?: "amount"|"percentage", extraDiscValue?: string, packingChargeStr?: string) => {
    if (!order) return;
${htmlLogic}
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

  content = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
  fs.writeFileSync(file, content);
  console.log("Updated handleWhatsAppShare");
} else {
  console.log("Failed to find boundaries");
}
