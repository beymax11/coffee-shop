import React, { useRef } from "react";
import { CreditCard, Upload, Hash, CheckCircle2, QrCode } from "lucide-react";
import { FormData } from "./ReservationsView";

interface PaymentMethodProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  updateField: (field: keyof FormData, value: any) => void;
  labelAccent: string;
  onFileSelect?: (file: File) => void;
}

export function PaymentMethod({
  formData,
  errors,
  updateField,
  labelAccent,
  onFileSelect,
}: PaymentMethodProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("proofOfPayment", file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const paymentMethods = [
    {
      id: "GCash" as const,
      title: "GCash E-Wallet",
      desc: "Fast downpayment via mobile wallet transfer.",
      icon: "⚡",
    },
    {
      id: "Bank Transfer" as const,
      title: "Bank Transfer (BPI)",
      desc: "Direct deposit/transfer to our official bank account.",
      icon: CreditCard,
    },
    {
      id: "QRPh" as const,
      title: "QRPh Instant Pay",
      desc: "Scan code to transfer from any banking or wallet app.",
      icon: QrCode,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-white/5 pb-4 mb-6">
        <h3 className="text-xl font-serif text-foreground tracking-wide">Select Downpayment Method</h3>
        <p className="text-xs text-zinc-500 mt-1 font-light">
          A downpayment is required to secure your booking. Please choose a method below.
        </p>
      </div>

      {/* Grid of Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentMethods.map((method) => {
          const isSelected = formData.paymentMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => updateField("paymentMethod", method.id)}
              className={`rounded-xl border p-5 text-left transition-all duration-300 flex flex-col justify-between min-h-[140px] select-none outline-none ${
                isSelected
                  ? "bg-gradient-to-br from-[#ECF7F2] to-[#D8ECE1] border-emerald-600/50 shadow-[0_8px_20px_rgba(46,90,68,0.08)] text-foreground dark:from-[#07130E]/95 dark:to-[#0F261B]/95 dark:border-emerald-500/80 dark:shadow-[0_8px_25px_rgba(46,90,68,0.2)]"
                  : "bg-card border-card-border text-neutral-500 hover:border-emerald-600/30 hover:bg-background"
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border text-sm ${
                    isSelected
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-[#2E5A44]/20 dark:text-emerald-400 dark:border-emerald-500/40"
                      : "bg-zinc-100 dark:bg-white/5 text-zinc-500 border-zinc-200 dark:border-white/5"
                  }`}
                >
                  {typeof Icon === "string" ? <span>{Icon}</span> : <Icon size={16} />}
                </div>
                {isSelected && (
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 fill-emerald-600/10" />
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-sans font-bold text-xs text-foreground tracking-wide">{method.title}</h4>
                <p className="font-sans text-[10px] text-zinc-500 dark:text-zinc-400 font-light mt-1 leading-relaxed">
                  {method.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Payment Instruction Panel */}
      <div className="p-5 border border-card-border bg-[#0D1D16]/45 dark:bg-[#07130E]/65 rounded-xl space-y-4">
        {formData.paymentMethod === "GCash" && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block font-sans">
              GCash Transfer Instructions
            </span>
            <div className="space-y-1.5 font-sans text-xs text-zinc-400 leading-relaxed font-light">
              <p>
                1. Send the downpayment amount to GCash account:
              </p>
              <p className="font-mono text-foreground font-bold pl-3 text-sm">
                0917-123-4567 (ANTONIONI G.)
              </p>
              <p>
                2. Input the exact reference number of the transfer and upload a screenshot proof of payment below.
              </p>
            </div>
          </div>
        )}

        {formData.paymentMethod === "Bank Transfer" && (
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block font-sans">
              BPI Bank Transfer Instructions
            </span>
            <div className="space-y-1.5 font-sans text-xs text-zinc-400 leading-relaxed font-light">
              <p>
                1. Transfer the downpayment amount to BPI bank account:
              </p>
              <div className="pl-3 space-y-0.5 text-xs">
                <p>Account Name: <strong className="text-foreground">Antonioni Grounds Café</strong></p>
                <p>Account Number: <strong className="text-foreground font-mono">1234-5678-9012</strong></p>
                <p>Bank: <strong className="text-foreground">Bank of the Philippine Islands (BPI)</strong></p>
              </div>
              <p>
                2. Input the exact transaction / reference number and upload your receipt screenshot proof below.
              </p>
            </div>
          </div>
        )}

        {formData.paymentMethod === "QRPh" && (
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Mock QR Code SVG */}
            <div className="bg-white p-3 rounded-lg border border-zinc-200 dark:border-white/10 shadow-md flex items-center justify-center shrink-0">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="text-zinc-900">
                {/* Border frames */}
                <rect x="5" y="5" width="25" height="25" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="15" height="15" fill="currentColor" />
                <rect x="70" y="5" width="25" height="25" stroke="currentColor" strokeWidth="4" />
                <rect x="75" y="10" width="15" height="15" fill="currentColor" />
                <rect x="5" y="70" width="25" height="25" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="75" width="15" height="15" fill="currentColor" />
                {/* Simulated QR Pixels */}
                <rect x="40" y="10" width="8" height="8" fill="currentColor" />
                <rect x="52" y="15" width="8" height="8" fill="currentColor" />
                <rect x="44" y="28" width="8" height="8" fill="currentColor" />
                <rect x="15" y="45" width="8" height="8" fill="currentColor" />
                <rect x="28" y="40" width="8" height="8" fill="currentColor" />
                <rect x="40" y="44" width="12" height="12" fill="currentColor" />
                <rect x="75" y="45" width="8" height="8" fill="currentColor" />
                <rect x="85" y="38" width="8" height="8" fill="currentColor" />
                <rect x="45" y="75" width="8" height="8" fill="currentColor" />
                <rect x="55" y="82" width="12" height="8" fill="currentColor" />
                <rect x="75" y="75" width="8" height="8" fill="currentColor" />
                {/* Center QR Logo Accent */}
                <rect x="42" y="42" width="16" height="16" fill="white" />
                <path d="M45 45H55V55H45V45Z" fill="#10B981" />
              </svg>
            </div>
            <div className="space-y-2 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 block font-sans">
                Scan via QRPh
              </span>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed font-light">
                Use your bank app (BPI, BDO, Metrobank) or e-wallet (GCash, Maya) to scan the code. After payment, type the reference number and upload the receipt screenshot below.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Downpayment input fields (Reference number and proof screenshot) */}
      <div className="space-y-5 bg-background-alt/40 p-6 rounded-xl border border-card-border backdrop-blur-sm">
        {/* Reference Number Field */}
        <div className="space-y-2">
          <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
            Reference / Transaction Number
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-400 transition-colors">
              <Hash size={14} />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 5001 1234 5678"
              value={formData.referenceNumber || ""}
              onChange={(e) => updateField("referenceNumber", e.target.value)}
              className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-sans text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
            />
          </div>
          {errors.referenceNumber && (
            <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.referenceNumber}</span>
          )}
        </div>

        {/* Screenshot Upload Field */}
        <div className="space-y-2">
          <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
            Screenshot Proof of Payment
          </label>
          <input
            type="file"
            ref={fileInputRef}
            required
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-card-border hover:border-emerald-500/40 bg-background-alt/30 hover:bg-background-alt/50 rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
              <Upload size={18} />
            </div>
            <span className="font-sans text-xs font-semibold text-foreground">
              {formData.proofOfPayment ? "Replace Screenshot" : "Upload Proof Receipt"}
            </span>
            <span className="font-sans text-[10px] text-zinc-500 font-light">
              {formData.proofOfPayment ? `Selected: ${formData.proofOfPayment}` : "Accepts JPG, PNG images"}
            </span>
          </button>
          {errors.proofOfPayment && (
            <span className="type-error block mt-1 text-xs text-red-500 font-sans text-center">{errors.proofOfPayment}</span>
          )}
        </div>
      </div>
    </div>
  );
}
