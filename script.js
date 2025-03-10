// Update translations to include VAT
const translations = {
    cs: {
        invoiceTitle: "FAKTURA č.",
        supplier: "Dodavatel",
        customer: "Odběratel",
        dateIssued: "Datum vystavení",
        dateDue: "Datum splatnosti",
        currency: "Měna",
        item: "Položka",
        quantity: "Počet",
        unitPrice: "Cena za jednotku",
        total: "Celkem",
        totalAmount: "Celková částka k úhradě",
        paymentDetails: "Platební údaje",
        bank: "Banka",
        variableSymbol: "Variabilní symbol",
        message: "Zpráva pro příjemce",
        amount: "Částka",
        scanQR: "Naskenujte pro platbu",
        vat: "DIČ" // Add VAT translation
    },
    sk: {
        invoiceTitle: "FAKTÚRA č.",
        supplier: "Dodávateľ",
        customer: "Odberateľ",
        dateIssued: "Dátum vystavenia",
        dateDue: "Dátum splatnosti",
        currency: "Mena",
        item: "Položka",
        quantity: "Počet",
        unitPrice: "Cena za jednotku",
        total: "Celkom",
        totalAmount: "Celková suma na úhradu",
        paymentDetails: "Platobné údaje",
        bank: "Banka",
        variableSymbol: "Variabilný symbol",
        message: "Správa pre príjemcu",
        amount: "Suma",
        scanQR: "Naskenujte pre platbu",
        vat: "DIČ" // Add VAT translation
    },
    en: {
        invoiceTitle: "INVOICE No.",
        supplier: "Supplier",
        customer: "Customer",
        dateIssued: "Issue Date",
        dateDue: "Due Date",
        currency: "Currency",
        item: "Item",
        quantity: "Quantity",
        unitPrice: "Unit Price",
        total: "Total",
        totalAmount: "Total Amount Due",
        paymentDetails: "Payment Details",
        bank: "Bank",
        variableSymbol: "Variable Symbol",
        message: "Payment Reference",
        amount: "Amount",
        scanQR: "Scan to pay",
        vat: "VAT" // Add VAT translation
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize with today's date
    const today = new Date();
    document.getElementById('dateIssued').valueAsDate = today;
    
    // Set due date to today + 14 days
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    document.getElementById('dateDue').valueAsDate = dueDate;
    
    // Generate invoice number (current year + month + day + random 3 digit number)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 900 + 100);
    document.getElementById('invoiceNumber').value = `${year}${month}${day}${random}`;

    // Set fixed supplier information
    document.getElementById('supplierName').value = 'Vladimír Urík - Development';
    document.getElementById('supplierAddress').value = '97248 Horná Ves, Rudica 389';
    document.getElementById('supplierIC').value = '56435410';
    document.getElementById('supplierDIC').value = '1129968785'; // Add DIČ value
    
    // Make supplier fields read-only
    document.getElementById('supplierName').readOnly = true;
    document.getElementById('supplierAddress').readOnly = true;
    document.getElementById('supplierIC').readOnly = true;
    document.getElementById('supplierDIC').readOnly = true; // Make DIČ field read-only as well
    
    // Add item button
    document.getElementById('addItem').addEventListener('click', addNewItem);
    
    // Generate PDF button
    document.getElementById('generatePDF').addEventListener('click', generatePDF);
    
    // Calculate totals when inputs change
    document.getElementById('items').addEventListener('input', calculateTotals);

    // Add currency change event listener
    document.getElementById('currency').addEventListener('change', calculateTotals);

    // Initial calculation
    calculateTotals();

    // Set default footer message
    document.getElementById('footerMessage').value = "Děkujeme za spolupráci!";

    // Add language change listener
    document.getElementById('language').addEventListener('change', function() {
        // Could update placeholder texts or labels based on selected language
    });

    // Setup validation
    setupValidation();

    // Add remove button functionality to the first item
    document.querySelector('#items .item .remove-item').addEventListener('click', function() {
        removeItem(this.closest('.item'));
    });
});

// Add new item row
function addNewItem() {
    const itemsContainer = document.getElementById('items');
    const newItemIndex = itemsContainer.children.length + 1;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
        <div class="form-group">
            <label for="item${newItemIndex}">Popis:</label>
            <input type="text" id="item${newItemIndex}" name="item[]" required>
        </div>
        <div class="form-group">
            <label for="quantity${newItemIndex}">Počet:</label>
            <input type="number" id="quantity${newItemIndex}" name="quantity[]" value="1" min="1" required>
        </div>
        <div class="form-group">
            <label for="price${newItemIndex}">Cena za jednotku:</label>
            <input type="number" id="price${newItemIndex}" name="price[]" step="0.01" required>
        </div>
        <div class="item-total">Celkem: 0.00</div>
        <button type="button" class="remove-item">Odebrat</button>
    `;
    
    itemsContainer.appendChild(itemDiv);

    // Add validation to new input fields
    itemDiv.querySelectorAll('input').forEach(element => {
        element.addEventListener('blur', () => {
            validateField(element);
        });
        
        element.addEventListener('input', () => {
            element.classList.remove('error');
            const errorMsg = element.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.style.display = 'none';
            }
        });
    });
    
    // Add remove button functionality
    itemDiv.querySelector('.remove-item').addEventListener('click', function() {
        removeItem(itemDiv);
    });
}

// Calculate item totals and grand total
function calculateTotals() {
    const items = document.querySelectorAll('.item');
    const currency = document.getElementById('currency').value;
    let grandTotal = 0;
    
    items.forEach((item, index) => {
        const quantity = parseFloat(item.querySelector(`input[name="quantity[]"]`).value) || 0;
        const price = parseFloat(item.querySelector(`input[name="price[]"]`).value) || 0;
        const total = quantity * price;
        
        item.querySelector('.item-total').textContent = `Celkem: ${total.toFixed(2)}`;
        grandTotal += total;
    });
    
    document.getElementById('totalAmount').textContent = `${grandTotal.toFixed(2)} ${currency}`;
}

// Generate PDF from form data
function generatePDF() {
    // Check if form is valid
    if (!validateForm()) {
        alert('Prosím vyplňte všechny povinné pole.');
        return;
    }
    
    // Create invoice HTML
    const invoiceContent = document.getElementById('invoiceContent');
    invoiceContent.innerHTML = createInvoiceHTML();
    
    // Show preview for generation purposes
    const invoicePreview = document.getElementById('invoicePreview');
    invoicePreview.classList.remove('hidden');
    
    // Add PDF-specific styles for better rendering
    const originalStyle = invoiceContent.getAttribute('style') || '';
    invoiceContent.setAttribute('style', originalStyle + '; width: 800px; padding: 40px; font-size: 14px;');
    
    // Generate PDF with better scaling
    const { jsPDF } = window.jspdf;
    
    html2canvas(invoiceContent, {
        scale: 1.5, // Increase quality
        useCORS: true,
        logging: false
    }).then(canvas => {
        // Restore original styles
        invoiceContent.setAttribute('style', originalStyle);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate appropriate scaling to fit the page width while maintaining aspect ratio
        const ratio = pageWidth / canvasWidth;
        const scaledHeight = canvasHeight * ratio;
        
        // If content is too long, split into multiple pages
        if (scaledHeight > pageHeight) {
            let heightLeft = scaledHeight;
            let position = 0;
            let page = 1;
            
            while (heightLeft > 0) {
                pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, scaledHeight);
                heightLeft -= pageHeight;
                position -= pageHeight;
                
                if (heightLeft > 0) {
                    pdf.addPage();
                    page++;
                }
            }
        } else {
            // Content fits on a single page
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, scaledHeight);
        }
        
        pdf.save(`faktura_${document.getElementById('invoiceNumber').value}.pdf`);
        
        // Hide preview
        invoicePreview.classList.add('hidden');
    });
}

// Validate form
function validateForm() {
  const formElements = document.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  for (const element of formElements) {
    // Only validate visible elements that are either required or have a value
    if (element.offsetParent !== null && 
        (element.hasAttribute('required') || element.value.trim())) {
      if (!validateField(element)) {
        isValid = false;
      }
    }
  }
  
  return isValid;
}

// Create invoice HTML content
function createInvoiceHTML() {
    // Get form values
    const supplierName = document.getElementById('supplierName').value;
    const supplierAddress = document.getElementById('supplierAddress').value;
    const supplierIC = document.getElementById('supplierIC').value;
    const supplierDIC = document.getElementById('supplierDIC').value;
    
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerIC = document.getElementById('customerIC').value.trim();
    const customerDIC = document.getElementById('customerDIC').value.trim();
    
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const dateIssued = formatDate(document.getElementById('dateIssued').value);
    const dateDue = formatDate(document.getElementById('dateDue').value);
    const currency = document.getElementById('currency').value;
    const language = document.getElementById('language').value;
    const footerMessage = document.getElementById('footerMessage').value;
    
    // Get translations for selected language
    const t = translations[language];
    
    const bankAccount = document.getElementById('bankAccount').value;
    const bankName = document.getElementById('bankName').value;
    const variableSymbol = invoiceNumber; // Automatically use invoice number
    const paymentReference = `INV-${invoiceNumber}`; // Format as requested

    // Generate items HTML
    const items = document.querySelectorAll('.item');
    let itemsHTML = '';
    let grandTotal = 0;
    
    items.forEach((item, index) => {
        const description = item.querySelector(`input[name="item[]"]`).value;
        const quantity = parseFloat(item.querySelector(`input[name="quantity[]"]`).value) || 0;
        const price = parseFloat(item.querySelector(`input[name="price[]"]`).value) || 0;
        const total = quantity * price;
        
        itemsHTML += `
            <tr>
                <td>${description}</td>
                <td>${quantity}</td>
                <td>${price.toFixed(2)} ${currency}</td>
                <td>${total.toFixed(2)} ${currency}</td>
            </tr>
        `;
        
        grandTotal += total;
    });

    // Generate QR payment code if IBAN is provided
    let qrCodeHTML = '';
    if (bankAccount) {
        // Generate QR code for payment
        const qrData = generateQRPaymentString(
            bankAccount,
            grandTotal,
            currency,
            variableSymbol,
            paymentReference
        );
        
        const qrCode = generateQRCode(qrData);
        qrCodeHTML = `
            <div class="qr-code-container">
                <div class="qr-code">${qrCode}</div>
                <p>${t.scanQR}</p>
            </div>
        `;
    }
    
    // Create complete invoice HTML with translations
    const paymentDetailsHTML = bankAccount ? `
        <div class="payment-details">
            <h3>${t.paymentDetails}</h3>
            <table class="payment-info-table">
                <tr>
                    <th>IBAN:</th>
                    <td>${bankAccount}</td>
                </tr>
                ${bankName ? `<tr>
                    <th>${t.bank}:</th>
                    <td>${bankName}</td>
                </tr>` : ''}
                <tr>
                    <th>${t.variableSymbol}:</th>
                    <td>${variableSymbol}</td>
                </tr>
                <tr>
                    <th>${t.message}:</th>
                    <td>${paymentReference}</td>
                </tr>
                <tr>
                    <th>${t.amount}:</th>
                    <td>${grandTotal.toFixed(2)} ${currency}</td>
                </tr>
            </table>
            ${qrCodeHTML}
        </div>
    ` : '';

    return `
        <div class="invoice-header">
            <h1>${t.invoiceTitle} ${invoiceNumber}</h1>
        </div>
        
        <div class="invoice-info">
            <div class="supplier-info">
                <h3>${t.supplier}:</h3>
                <p><strong>${supplierName}</strong></p>
                <p>${supplierAddress.replace(/\n/g, '<br>')}</p>
                <p>IČ: ${supplierIC}</p>
                ${supplierDIC ? `<p>DIČ: ${supplierDIC}</p>` : ''}
            </div>
            
            <div class="customer-info">
                <h3>${t.customer}:</h3>
                <p><strong>${customerName}</strong></p>
                <p>${customerAddress.replace(/\n/g, '<br>')}</p>
                ${customerIC ? `<p>IČ: ${customerIC}</p>` : ''}
                ${customerDIC ? `<p>${t.vat}: ${customerDIC}</p>` : ''}
            </div>
            
            <div class="dates">
                <p><strong>${t.dateIssued}:</strong> ${dateIssued}</p>
                <p><strong>${t.dateDue}:</strong> ${dateDue}</p>
                <p><strong>${t.currency}:</strong> ${currency}</p>
            </div>
        </div>
        
        <table class="invoice-items">
            <thead>
                <tr>
                    <th>${t.item}</th>
                    <th>${t.quantity}</th>
                    <th>${t.unitPrice}</th>
                    <th>${t.total}</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" class="total-label">${t.totalAmount}:</td>
                    <td class="total-amount">${grandTotal.toFixed(2)} ${currency}</td>
                </tr>
            </tfoot>
        </table>
        
        ${paymentDetailsHTML}
        
        <div class="invoice-footer">
            <p>${footerMessage}</p>
        </div>
    `;
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const language = document.getElementById('language').value;
    
    // Format date based on selected language
    switch (language) {
        case 'en':
            // MM/DD/YYYY for English
            return new Intl.DateTimeFormat('en-US').format(date);
        case 'sk':
            // DD.MM.YYYY for Slovak
            return new Intl.DateTimeFormat('sk-SK').format(date);
        case 'cs':
        default:
            // DD.MM.YYYY for Czech
            return new Intl.DateTimeFormat('cs-CZ').format(date);
    }
}

// Add these new functions for QR code generation

// Function to generate QR payment string according to SEPA/EPC QR code standard
function generateQRPaymentString(iban, amount, currency, variableSymbol, message) {
    // Remove spaces from IBAN
    iban = iban.replace(/\s+/g, '');
    
    // Format amount properly (with decimal point)
    const formattedAmount = amount.toFixed(2);
    
    // Get beneficiary name from supplier name
    const beneficiaryName = document.getElementById('supplierName').value;
    
    // Handle currency - SEPA uses EUR, but we'll be flexible
    let qrCurrency = 'EUR';
    if (currency === '€') {
        qrCurrency = 'EUR';
    } else if (currency === 'Kč' || currency === 'CZK') {
        qrCurrency = 'CZK';
    }
    
    // Build EPC QR code format
    // Format reference: https://en.wikipedia.org/wiki/EPC_QR_code
    const lines = [
        'BCD',                           // Header
        '002',                           // Version
        '1',                             // Encoding (1 = UTF-8)
        'SCT',                           // SEPA Credit Transfer
        '',                              // BIC (can be empty)
        beneficiaryName,                 // Recipient name
        iban,                            // IBAN
        `${qrCurrency}${formattedAmount}`, // Amount with currency
        '',                              // Purpose code (empty)
        variableSymbol,                  // Variable symbol as reference
        message                          // Payment message
    ];
    
    // Join with line breaks
    return lines.join('\n');
}

// Function to generate QR code HTML
function generateQRCode(data) {
    try {
        // Create QR Code using qrcode-generator library
        const typeNumber = 0; // Auto-detect size
        const errorCorrectionLevel = 'L'; // Low error correction
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(data);
        qr.make();
        
        // Return the QR code as HTML SVG
        return qr.createSvgTag({ cellSize: 6, margin: 1 });
    } catch (error) {
        console.error("QR Code generation error:", error);
        return '<div>QR kód nelze vygenerovat</div>';
    }
}

// Validate individual field and show error message
function validateField(element) {
  // Remove any existing error styling
  element.classList.remove('error');
  
  // Get or create error message element
  let errorMsg = element.nextElementSibling;
  if (!errorMsg || !errorMsg.classList.contains('error-message')) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    element.parentNode.insertBefore(errorMsg, element.nextElementSibling);
  }
  
  // Default: no error
  errorMsg.style.display = 'none';
  errorMsg.textContent = '';
  
  // Check if field is required and empty
  if (element.hasAttribute('required') && !element.value.trim()) {
    element.classList.add('error');
    errorMsg.textContent = 'Toto pole je povinné';
    errorMsg.style.display = 'block';
    return false;
  }
  
  // Special field validations
  if (element.id === 'bankAccount' && element.value) {
    // Simple IBAN validation
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(element.value.replace(/\s+/g, ''))) {
      element.classList.add('error');
      errorMsg.textContent = 'Zadejte platný IBAN';
      errorMsg.style.display = 'block';
      return false;
    }
  }
  
  return true;
}

// Setup validation handlers
function setupValidation() {
  document.querySelectorAll('input, textarea, select').forEach(element => {
    if (!element.readOnly) {  // Don't add validation to readonly fields
      element.addEventListener('blur', () => {
        validateField(element);
      });
      
      // Clear error when user starts typing
      element.addEventListener('input', () => {
        element.classList.remove('error');
        const errorMsg = element.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
          errorMsg.style.display = 'none';
        }
      });
    }
  });
}

// Remove item row
function removeItem(itemDiv) {
    const itemsContainer = document.getElementById('items');
    
    // Don't allow removal if it's the last item
    if (itemsContainer.children.length <= 1) {
        alert('Faktura musí obsahovat alespoň jednu položku.');
        return;
    }
    
    // Confirm before removing
    if (confirm('Opravdu chcete odstranit tuto položku?')) {
        itemDiv.remove();
        calculateTotals();
        
        // Renumber remaining items for clarity
        const items = itemsContainer.querySelectorAll('.item');
        items.forEach((item, index) => {
            const newIndex = index + 1;
            
            // Update label and input IDs
            const descInput = item.querySelector('input[name="item[]"]');
            const qtyInput = item.querySelector('input[name="quantity[]"]');
            const priceInput = item.querySelector('input[name="price[]"]');
            
            if (descInput) {
                const label = descInput.previousElementSibling;
                label.setAttribute('for', `item${newIndex}`);
                descInput.id = `item${newIndex}`;
            }
            
            if (qtyInput) {
                const label = qtyInput.previousElementSibling;
                label.setAttribute('for', `quantity${newIndex}`);
                qtyInput.id = `quantity${newIndex}`;
            }
            
            if (priceInput) {
                const label = priceInput.previousElementSibling;
                label.setAttribute('for', `price${newIndex}`);
                priceInput.id = `price${newIndex}`;
            }
        });
    }
}