import React, { useRef, useState, useEffect } from "react";
import {
  CreditCard,
  Upload,
  Hash,
  CheckCircle2,
  QrCode,
  Smartphone,
  Building2,
  Copy,
  Check,
  FileImage,
  X,
  Info,
  ShieldCheck,
} from "lucide-react";
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
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Clean up preview object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCopy = (text: string, fieldId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateField("proofOfPayment", file.name);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateField("proofOfPayment", "");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const paymentMethods = [
    {
      id: "GCash" as const,
      title: "GCash",
      subtitle: "Mobile Wallet Transfer",
      desc: "Instant transfer via GCash App",
      icon: Smartphone,
      accentColor: "from-blue-500/10 to-emerald-500/10",
      badgeText: "Most Popular",
    },
    {
      id: "Bank Transfer" as const,
      title: "BPI Bank Transfer",
      subtitle: "Direct Bank Deposit",
      desc: "InstaPay or online deposit to BPI",
      icon: Building2,
      accentColor: "from-red-500/10 to-amber-500/10",
    },
    {
      id: "QRPh" as const,
      title: "QRPh Instant Pay",
      subtitle: "Universal QR Scan",
      desc: "Scan via any bank or e-wallet app",
      icon: QrCode,
      accentColor: "from-emerald-500/10 to-teal-500/10",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className={`text-[10px] uppercase font-bold tracking-[0.25em] font-sans ${labelAccent}`}>
            Payment Verification
          </span>
        </div>
        <h3 className="text-xl font-serif text-foreground tracking-wide font-medium">
          Select Downpayment Method
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-light leading-relaxed">
          A secure downpayment is required to confirm your reserved slot. Choose your preferred channel below.
        </p>
      </div>

      {/* Grid of Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {paymentMethods.map((method) => {
          const isSelected = formData.paymentMethod === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => updateField("paymentMethod", method.id)}
              className={`relative rounded-xl border p-4 text-left transition-all duration-300 flex flex-col justify-between min-h-[135px] select-none outline-none group cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/80 shadow-[0_4px_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30"
                  : "bg-card border-card-border hover:border-emerald-500/40 hover:bg-background-alt/30"
              }`}
            >
              {/* Optional Popular Badge */}
              {method.badgeText && (
                <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-sm pointer-events-none">
                  {method.badgeText}
                </span>
              )}

              <div className="flex justify-between items-start w-full">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-background-alt/60 border-card-border text-zinc-500 group-hover:text-foreground"
                  }`}
                >
                  <Icon size={17} />
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
                      : "border-zinc-300 dark:border-zinc-700 bg-transparent opacity-40 group-hover:opacity-80"
                  }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-sans font-bold text-xs text-foreground tracking-wide">
                  {method.title}
                </h4>
                <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 font-light mt-0.5 leading-snug">
                  {method.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Payment Instruction Panel */}
      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4 relative overflow-hidden transition-all">
        {/* Subtle accent line on top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent opacity-80" />

        {/* GCash Instructions */}
        {formData.paymentMethod === "GCash" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-sans">
                GCash Account Coordinates
              </span>
              <span className="text-[10px] font-sans text-zinc-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                Verified Business
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Number Card with Copy */}
              <div className="p-3.5 rounded-lg bg-background-alt/50 border border-card-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block font-sans">
                    GCash Mobile Number
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-wider mt-0.5 block">
                    0917 123 4567
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("09171234567", "gcash-num")}
                  className="px-3 py-1.5 rounded-md border border-card-border bg-card hover:bg-background-alt text-xs font-sans font-medium text-foreground transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedField === "gcash-num" ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-zinc-500" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Name Card */}
              <div className="p-3.5 rounded-lg bg-background-alt/50 border border-card-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block font-sans">
                    Account Name
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-foreground tracking-wide mt-0.5 block">
                    ANTONIONI G.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("ANTONIONI G.", "gcash-name")}
                  className="px-3 py-1.5 rounded-md border border-card-border bg-card hover:bg-background-alt text-xs font-sans font-medium text-foreground transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedField === "gcash-name" ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-zinc-500" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed flex items-start gap-1.5">
              <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
              <span>
                Please transfer the required downpayment, then copy the <strong>Reference Number</strong> and upload your transaction receipt screenshot below.
              </span>
            </p>
          </div>
        )}

        {/* Bank Transfer Instructions */}
        {formData.paymentMethod === "Bank Transfer" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 font-sans">
                BPI Bank Account Coordinates
              </span>
              <span className="text-[10px] font-sans text-zinc-500 flex items-center gap-1">
                <CreditCard size={12} className="text-emerald-500" />
                InstaPay / PesoNet Supported
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Number Card */}
              <div className="p-3.5 rounded-lg bg-background-alt/50 border border-card-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block font-sans">
                    BPI Account Number
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground tracking-wider mt-0.5 block">
                    1234 5678 9012
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("123456789012", "bpi-num")}
                  className="px-3 py-1.5 rounded-md border border-card-border bg-card hover:bg-background-alt text-xs font-sans font-medium text-foreground transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedField === "bpi-num" ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-zinc-500" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Name Card */}
              <div className="p-3.5 rounded-lg bg-background-alt/50 border border-card-border flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block font-sans">
                    Account Name / Bank
                  </span>
                  <span className="font-sans text-sm sm:text-base font-bold text-foreground tracking-wide mt-0.5 block">
                    Antonioni Grounds Café
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("Antonioni Grounds Café", "bpi-name")}
                  className="px-3 py-1.5 rounded-md border border-card-border bg-card hover:bg-background-alt text-xs font-sans font-medium text-foreground transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
                >
                  {copiedField === "bpi-name" ? (
                    <>
                      <Check size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-zinc-500" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed flex items-start gap-1.5">
              <Info size={13} className="shrink-0 mt-0.5 text-zinc-400" />
              <span>
                Transfers from other banks (BDO, Metrobank, UnionBank, Maya, etc.) via <strong>InstaPay</strong> are credited immediately.
              </span>
            </p>
          </div>
        )}

        {/* QRPh Instructions */}
        {formData.paymentMethod === "QRPh" && (
          <div className="flex flex-col sm:flex-row items-center gap-6 py-1">
            {/* Crisp QR Code Container */}
            <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-md shrink-0 flex flex-col items-center">
              <svg width="130" height="130" viewBox="0 0 100 100" fill="none" className="text-zinc-900">
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
              <span className="font-mono text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-1.5">
                QRPH • NATIONAL QR
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600 dark:text-emerald-400 block font-sans">
                  Universal Instant Pay
                </span>
                <h4 className="font-sans font-bold text-sm text-foreground mt-0.5">
                  Scan using Any Bank or E-Wallet
                </h4>
              </div>

              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                Open your banking app (BPI, BDO, Metrobank, UnionBank) or mobile wallet (GCash, Maya, ShopeePay) and point your camera to scan this code.
              </p>

              {/* Supported App Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {["GCash", "Maya", "BPI", "BDO", "UnionBank", "SeaBank"].map((app) => (
                  <span
                    key={app}
                    className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-background-alt/70 border border-card-border text-zinc-600 dark:text-zinc-300"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs Section (No heavy outer box background, clean inputs) */}
      <div className="space-y-6 pt-1">
        {/* Reference Number Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
              Reference / Transaction Number <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-sans">From your payment confirmation</span>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
              <Hash size={15} />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 5001 2345 6789 or 202611039871"
              value={formData.referenceNumber || ""}
              onChange={(e) => updateField("referenceNumber", e.target.value)}
              className="w-full rounded-lg border border-card-border bg-background-alt/50 pl-10 pr-3.5 py-3 font-mono text-sm text-foreground outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-zinc-700"
            />
          </div>
          {errors.referenceNumber && (
            <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.referenceNumber}</span>
          )}
        </div>

        {/* Screenshot Upload Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={`font-sans text-[10px] uppercase font-bold tracking-[0.2em] ${labelAccent} block pl-1`}>
              Proof of Payment Screenshot <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-sans">PNG, JPG up to 10MB</span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            required
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {formData.proofOfPayment ? (
            /* Uploaded Preview Card */
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/15 p-4 flex items-center justify-between gap-3 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-card border border-emerald-500/20 overflow-hidden flex items-center justify-center shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Proof preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileImage size={22} className="text-emerald-500" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span className="font-sans text-xs font-semibold text-foreground truncate block">
                      {formData.proofOfPayment}
                    </span>
                  </div>
                  <span className="font-sans text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Screenshot attached • Ready for verification
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card hover:bg-background-alt text-xs font-sans font-medium text-foreground transition-all cursor-pointer"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-all cursor-pointer"
                  title="Remove file"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Upload Dropzone */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-card-border hover:border-emerald-500/50 bg-background-alt/30 hover:bg-background-alt/60 rounded-xl p-7 transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-card border border-card-border flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 group-hover:border-emerald-500/40 group-hover:scale-105 transition-all shadow-sm">
                <Upload size={18} />
              </div>
              <div className="text-center mt-1">
                <span className="font-sans text-xs font-semibold text-foreground block">
                  Click to browse or drop your payment screenshot
                </span>
                <span className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 font-light mt-0.5 block">
                  Attach receipt confirming your transfer to Antonioni Grounds
                </span>
              </div>
            </button>
          )}

          {errors.proofOfPayment && (
            <span className="type-error block mt-1 text-xs text-red-500 font-sans">{errors.proofOfPayment}</span>
          )}
        </div>
      </div>
    </div>
  );
}
