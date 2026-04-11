import { X, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";

interface PaymentModalProps {
  destination: { name: string; price: number };
  onClose: () => void;
}

const UPI_ID = "phutaneprathamesh829@oksbi";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
  `upi://pay?pa=${UPI_ID}&pn=Prathamesh%20Phutane&am=1&cu=INR`
)}`;

const PaymentModal = ({ destination, onClose }: PaymentModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-xl max-w-md w-full p-8 relative" style={{ boxShadow: "var(--shadow-elevated)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-2xl font-bold text-card-foreground mb-2">Book {destination.name}</h3>
        <p className="text-muted-foreground mb-6">Complete payment of <strong className="text-primary">₹{destination.price}</strong> via UPI</p>

        <div className="flex justify-center mb-6">
          <img src={QR_URL} alt="UPI QR Code" className="rounded-lg border border-border" width={200} height={200} />
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-2">Or pay using UPI ID:</p>
          <div className="flex items-center justify-center gap-2 bg-muted rounded-lg px-4 py-3">
            <span className="font-mono text-sm text-foreground">{UPI_ID}</span>
            <button onClick={copyUPI} className="text-primary hover:opacity-80">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          After payment, you'll receive a confirmation on WhatsApp within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default PaymentModal;
