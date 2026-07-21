import { Prescription, MedicalRecord, MedicineEntry } from './clinical';
import { Bill } from './billing';

export function downloadPrescriptionPDF(prescription: Prescription) {
  let parsedMedicines: MedicineEntry[] = [];
  try {
    parsedMedicines = JSON.parse(prescription.medicines);
  } catch (e) {
    parsedMedicines = [
      {
        name: prescription.medicines,
        dosage: prescription.dosage,
        frequency: 'As prescribed',
        duration: 'As needed',
      },
    ];
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription #${prescription.id.substring(0, 8)} - CityCare Hospital</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .hospital-title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
          }
          .hospital-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .doc-meta {
            text-align: right;
            font-size: 12px;
            color: #475569;
          }
          .patient-bar {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 13px;
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #2563eb;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .rx-symbol {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          th {
            background: #f1f5f9;
            text-align: left;
            padding: 10px 12px;
            font-weight: bold;
            color: #334155;
            border-bottom: 2px solid #cbd5e1;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .instructions-box {
            background: #eff6ff;
            border-left: 4px solid #2563eb;
            padding: 14px;
            font-size: 13px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 40px;
          }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 12px;
            color: #64748b;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #94a3b8;
            text-align: center;
            padding-top: 6px;
            font-weight: bold;
            color: #1e293b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="hospital-title">CityCare Smart Hospital</h1>
            <div class="hospital-subtitle">Medical Consultation & Electronic Prescription</div>
          </div>
          <div class="doc-meta">
            <div><strong>Rx ID:</strong> #${prescription.id.substring(0, 8)}</div>
            <div><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div class="patient-bar">
          <div>
            <strong>Patient Name:</strong> ${prescription.patient?.user.fullName || 'N/A'}<br>
            <strong>Email:</strong> ${prescription.patient?.user.email || 'N/A'}
          </div>
          <div>
            <strong>Attending Doctor:</strong> Dr. ${prescription.doctor?.user.fullName || 'N/A'}<br>
            <strong>Department:</strong> ${prescription.doctor?.department || 'General Practice'}
          </div>
        </div>

        <div class="section-title">Clinical Diagnosis</div>
        <p style="font-size: 14px; font-weight: 500; color: #1e293b; margin-bottom: 25px;">
          ${prescription.diagnosis}
        </p>

        <div class="rx-symbol">&#8478; Prescribed Medications</div>
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${parsedMedicines
              .map(
                (med) => `
              <tr>
                <td><strong>${med.name}</strong></td>
                <td>${med.dosage}</td>
                <td>${med.frequency}</td>
                <td>${med.duration}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        ${
          prescription.instructions
            ? `
          <div class="section-title">Instructions & Guidance</div>
          <div class="instructions-box">
            ${prescription.instructions}
          </div>
        `
            : ''
        }

        <div class="footer">
          <div>
            Generated electronically by CityCare Health Management System.
          </div>
          <div class="signature-line">
            Dr. ${prescription.doctor?.user.fullName || 'Physician Signature'}
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function downloadMedicalRecordPDF(record: MedicalRecord) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Medical Chart #${record.id.substring(0, 8)} - CityCare Hospital</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0891b2;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .hospital-title {
            font-size: 24px;
            font-weight: bold;
            color: #0891b2;
            margin: 0;
          }
          .hospital-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .patient-bar {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 13px;
            margin-bottom: 25px;
          }
          .vitals-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 30px;
          }
          .vital-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            text-align: center;
            font-size: 12px;
          }
          .vital-card span { color: #64748b; font-size: 11px; display: block; }
          .vital-card strong { color: #0891b2; font-size: 14px; margin-top: 4px; display: block; }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #0891b2;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 20px;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .text-block {
            font-size: 13px;
            color: #334155;
            line-height: 1.6;
            margin-bottom: 15px;
          }
          .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 12px;
            color: #64748b;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #94a3b8;
            text-align: center;
            padding-top: 6px;
            font-weight: bold;
            color: #1e293b;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="hospital-title">CityCare Smart Hospital</h1>
            <div class="hospital-subtitle">Official Electronic Health Record (EHR) Summary</div>
          </div>
          <div>
            <strong>Chart ID:</strong> #${record.id.substring(0, 8)}<br>
            <strong>Visit Date:</strong> ${new Date(record.visitDate).toLocaleDateString()}
          </div>
        </div>

        <div class="patient-bar">
          <div>
            <strong>Patient Name:</strong> ${record.patient?.user.fullName || 'N/A'}<br>
            <strong>Email:</strong> ${record.patient?.user.email || 'N/A'}
          </div>
          <div>
            <strong>Examining Physician:</strong> Dr. ${record.doctor?.user.fullName || 'N/A'}<br>
            <strong>Department:</strong> ${record.doctor?.department || 'General Medicine'}
          </div>
        </div>

        <div class="vitals-grid">
          <div class="vital-card">
            <span>Blood Pressure</span>
            <strong>${record.bloodPressure || 'N/A'}</strong>
          </div>
          <div class="vital-card">
            <span>Pulse Rate</span>
            <strong>${record.pulseRate || 'N/A'}</strong>
          </div>
          <div class="vital-card">
            <span>Body Temp</span>
            <strong>${record.bodyTemperature || 'N/A'}</strong>
          </div>
          <div class="vital-card">
            <span>Height / Weight</span>
            <strong>${record.height || '--'} cm / ${record.weight || '--'} kg</strong>
          </div>
        </div>

        <div class="section-title">Chief Complaint</div>
        <div class="text-block">${record.chiefComplaint}</div>

        <div class="section-title">Clinical Diagnosis</div>
        <div class="text-block"><strong>${record.diagnosis}</strong></div>

        ${
          record.treatment
            ? `
          <div class="section-title">Treatment Plan & Medical Procedures</div>
          <div class="text-block">${record.treatment}</div>
        `
            : ''
        }

        <div class="footer">
          <div>
            Confidential Medical Record Document.
          </div>
          <div class="signature-line">
            Dr. ${record.doctor?.user.fullName || 'Physician Signature'}
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export function downloadInvoicePDF(bill: Bill) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${bill.invoiceNumber} - CityCare Hospital</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .hospital-title {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            margin: 0;
          }
          .hospital-subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .meta-box {
            text-align: right;
            font-size: 13px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 6px;
          }
          .status-PAID { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
          .status-PENDING { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
          .status-PARTIAL { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
          .status-REFUNDED { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }

          .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 30px;
            font-size: 13px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          th {
            background: #f1f5f9;
            text-align: left;
            padding: 12px;
            font-weight: bold;
            color: #334155;
            border-bottom: 2px solid #cbd5e1;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .text-right { text-align: right; }
          .total-row {
            font-size: 16px;
            font-weight: bold;
            background: #f0fdf4;
            color: #047857;
          }
          .footer {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 12px;
            color: #64748b;
          }
          .stamp-box {
            border: 2px dashed #059669;
            color: #059669;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 8px;
            text-transform: uppercase;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="hospital-title">CityCare Hospital</h1>
            <div class="hospital-subtitle">Official Billing Statement & Medical Tax Invoice</div>
          </div>
          <div class="meta-box">
            <div><strong>Invoice:</strong> #${bill.invoiceNumber}</div>
            <div><strong>Date:</strong> ${new Date(bill.generatedAt).toLocaleDateString()}</div>
            <div class="status-badge status-${bill.paymentStatus}">${bill.paymentStatus}</div>
          </div>
        </div>

        <div class="parties-grid">
          <div>
            <strong style="color: #059669;">Billed To (Patient):</strong><br>
            <strong>${bill.patient?.user.fullName || 'N/A'}</strong><br>
            ${bill.patient?.user.email || ''}<br>
            ${bill.patient?.user.phoneNumber ? `Phone: ${bill.patient.user.phoneNumber}` : ''}
          </div>
          <div>
            <strong style="color: #059669;">Consultation Details:</strong><br>
            <strong>Dr. ${bill.appointment?.doctor?.user.fullName || 'N/A'}</strong><br>
            ${bill.appointment?.doctor?.department || 'Medical Department'}<br>
            Visit Date: ${bill.appointment?.appointmentDate ? new Date(bill.appointment.appointmentDate).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description / Fee Breakdown</th>
              <th class="text-right">Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Physician Consultation Fee</td>
              <td class="text-right">$${bill.consultationFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Additional Medical Charges & Procedures</td>
              <td class="text-right">$${bill.additionalCharges.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Applied Hospital Discount</td>
              <td class="text-right" style="color: #dc2626;">-$${bill.discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Applicable Tax (GST/VAT)</td>
              <td class="text-right">+$${bill.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount Payable</td>
              <td class="text-right">$${bill.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        ${
          bill.paymentMethod
            ? `<p style="font-size: 13px; color: #334155;"><strong>Payment Method:</strong> ${bill.paymentMethod}</p>`
            : ''
        }

        <div class="footer">
          <div>
            CityCare Hospital Billing Department.<br>
            Thank you for choosing CityCare Hospital for your healthcare needs.
          </div>
          <div class="stamp-box">
            Official Billing Receipt
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
