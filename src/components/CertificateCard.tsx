import React from 'react';
import { Award, Star } from 'lucide-react';

interface CertificateCardProps {
  childName: string;
  theme: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ childName, theme }) => {
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white rounded-3xl border-4 border-yellow-400 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl">
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 fill-white text-white" />
          <span className="font-display font-bold text-sm tracking-wider uppercase">
            Official Award Certificate
          </span>
        </div>
        <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
          Included in PDF
        </span>
      </div>

      <div className="p-6 bg-amber-50/30 flex-1 flex flex-col justify-between text-center relative">
        <div className="border-4 border-double border-slate-700 rounded-2xl p-6 bg-white flex flex-col justify-between h-full shadow-inner">
          <div>
            <div className="flex justify-center items-center gap-1 text-amber-500 mb-2">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-5 h-5 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
            </div>

            <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">
              CERTIFICATE OF ARTISTIC EXCELLENCE
            </p>

            <h3 className="font-display font-bold text-2xl text-slate-900 mt-2 uppercase">
              Master Coloring Artist
            </h3>

            <p className="text-xs text-slate-500 mt-1">This official certificate is proudly awarded to:</p>

            <div className="my-4 inline-block">
              <span className="font-display font-bold text-2xl sm:text-3xl text-indigo-600 border-b-2 border-indigo-400 pb-1 px-4">
                {childName.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-body max-w-sm mx-auto leading-relaxed">
              For showing fantastic imagination, vibrant creativity, and successfully completing all
              5 black-and-white coloring pages of the <strong>"{theme}"</strong> coloring book!
            </p>
          </div>

          {/* Medal Seal & Signatures */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex justify-around items-end text-left">
              <div>
                <div className="w-28 sm:w-36 border-b border-slate-400 pb-1 text-center font-hand text-slate-400 text-xs">
                  {childName}
                </div>
                <p className="text-[10px] font-bold text-slate-500 text-center mt-1">Child Artist</p>
              </div>

              {/* Seal */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-600 shadow-md flex flex-col items-center justify-center text-white shrink-0">
                <Star className="w-5 h-5 fill-white" />
                <span className="text-[8px] font-bold uppercase tracking-tight">Verified</span>
              </div>

              <div>
                <div className="w-28 sm:w-36 border-b border-slate-400 pb-1 text-center font-hand text-slate-400 text-xs">
                  Official Seal
                </div>
                <p className="text-[10px] font-bold text-slate-500 text-center mt-1">Parent / Teacher</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 italic">Awarded on {today}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
