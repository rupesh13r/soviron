'use client';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan') || 'Custom';
  const amount = searchParams.get('amount') || '0';
  const paymentId = searchParams.get('payment_id') || 'Unknown';

  const downloadReceipt = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('SOVIRON', 20, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('soviron.tech', 20, 38);
    doc.text('support@soviron.tech', 20, 44);
    
    // Divider line
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);
    
    // Receipt title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Receipt', 20, 65);
    
    // Receipt details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 82);
    doc.text(`Payment ID: ${paymentId}`, 20, 92);
    doc.text(`Plan/Items: ${planName.toUpperCase()} Plan/Top-up`, 20, 102);
    doc.text(`Amount Paid: Rs. ${amount}`, 20, 112);
    doc.text(`Status: Paid`, 20, 122);
    
    // Divider
    doc.line(20, 132, 190, 132);
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you for using Soviron.', 20, 145);
    doc.text('This is a computer-generated receipt and does not require a signature.', 20, 152);
    
    doc.save(`soviron-receipt-${paymentId}.pdf`);
  };

  return (
    <>
      <style>{`
        .success-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #FFFFFF; font-family: inherit; }
        .success-card { max-w-[500px] w-full; padding: 48px; text-align: center; background: #FFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 24px; box-shadow: 0 4px 40px rgba(0,0,0,0.04); }
        .success-icon { width: 64px; height: 64px; margin: 0 auto 24px; color: #22c55e; }
        .success-title { font-size: 32px; font-weight: 700; color: #080808; margin-bottom: 12px; letter-spacing: -0.02em; }
        .success-desc { font-size: 15px; color: #6B7280; margin-bottom: 32px; line-height: 1.6; }
        .success-details { background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #6B7280; font-weight: 500; }
        .detail-value { color: #080808; font-weight: 600; }
        .btn-primary { display: block; width: 100%; padding: 14px; background: #080808; color: #FFF; font-size: 14px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; margin-bottom: 12px; text-decoration: none; font-family: inherit; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .btn-secondary { display: block; width: 100%; padding: 14px; background: transparent; color: #080808; font-size: 14px; font-weight: 600; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; cursor: pointer; transition: background 0.2s; text-decoration: none; font-family: inherit; }
        .btn-secondary:hover { background: rgba(0,0,0,0.02); }
      `}</style>

      <div className="success-page">
        <div className="success-card">
          <CheckCircle2 className="success-icon" />
          <h1 className="success-title">Payment Successful</h1>
          <p className="success-desc">Your payment has been successfully processed and your account limits have been updated.</p>
          
          <div className="success-details">
            <div className="detail-row">
              <span className="detail-label">Plan/Item</span>
              <span className="detail-value" style={{ textTransform: 'capitalize' }}>{planName.replace('topup-', '')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount Paid</span>
              <span className="detail-value">₹{amount}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date</span>
              <span className="detail-value">{new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction ID</span>
              <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>{paymentId}</span>
            </div>
          </div>

          <button onClick={downloadReceipt} className="btn-primary">Download Receipt (PDF)</button>
          <a href="/dashboard" className="btn-secondary">Go to Dashboard</a>
        </div>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
