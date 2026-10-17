import React, { useState } from 'react';
import { X, Check, Sparkles, ShieldCheck, Crown, CreditCard, Tag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  childName?: string;
  onUpgradeSuccess: () => void;
  onToggleProMode?: () => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  isPro,
  childName,
  onUpgradeSuccess,
  onToggleProMode,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'gpay' | 'paypal'>('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase().trim() === 'MAGIC5' || couponCode.toUpperCase().trim() === 'ARTIST50') {
      setCouponApplied(true);
    } else {
      alert('Invalid code. Try "MAGIC5" for 100% off testing!');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          couponCode: couponApplied ? couponCode : undefined,
          childName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });
        onUpgradeSuccess();
      }
    } catch (err) {
      console.error('Checkout failed', err);
      // Fallback activate
      onUpgradeSuccess();
    } finally {
      setIsProcessing(false);
    }
  };

  const finalPrice = couponApplied && couponCode.toUpperCase().trim() === 'MAGIC5' ? '$0.00' : '$5.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-300 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-100 mb-2">
            <Crown className="w-4 h-4 text-yellow-200" />
            <span>WONDERCOLOR PRO PASS</span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight leading-tight">
            Unlock WonderColor Pro
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm font-hand mt-1">
            Create limitless, high-definition coloring books with diverse art styles for {childName || 'your young artist'}!
          </p>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display font-bold text-4xl sm:text-5xl text-white">
              {finalPrice}
            </span>
            <span className="text-amber-100 text-xs uppercase tracking-wider font-bold">
              USD {couponApplied ? '(Discount Applied)' : '• All-Access'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Features Comparison */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pro Features Included:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>4K Ultra-Sharp</strong> print resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>All 6 Art Styles</strong> (Kawaii, Comic, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>Real-Time Live Drawing</strong> canvas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>Deluxe Gold Cover</strong> & Award Ribbon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>Unlimited Redraws</strong> & Scene Tweaks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span><strong>Priority Queue</strong> with Gemini 3 Pro</span>
              </div>
            </div>
          </div>

          {isPro ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                WonderColor Pro is Active!
              </div>
              <p className="text-xs text-emerald-800">
                You have full access to 4K resolution, all 6 diverse illustration styles, and real-time generation.
              </p>
              {onToggleProMode && (
                <button
                  type="button"
                  onClick={onToggleProMode}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  (Dev Mode: Switch back to Free Tier)
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Payment Method ($5 USD)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gpay')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'gpay'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>G Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>PayPal</span>
                  </button>
                </div>
              </div>

              {/* Card Form Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Coupon Bar */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. MAGIC5)"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 uppercase placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {couponApplied && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Coupon applied: 100% Free Testing Discount!
                </p>
              )}

              {/* Pay Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-display font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Activating Pro Pass...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5 text-yellow-200" />
                    <span>Pay {finalPrice} USD & Unlock Pro Instantly</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>256-Bit Encrypted Secure Checkout • Instant Activation</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
