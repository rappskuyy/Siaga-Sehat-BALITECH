import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      expand
      closeButton
      icons={{
        info: (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(59,130,246,0.12)] text-[#3B82F6]">
            <Info className="h-5 w-5" strokeWidth={2} />
          </div>
        ),
        success: (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(22,163,74,0.12)] text-[#16A34A]">
            <Check className="h-5 w-5" strokeWidth={2.5} />
          </div>
        ),
        warning: (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(245,158,11,0.14)] text-[#F59E0B]">
            <TriangleAlert className="h-5 w-5" strokeWidth={2} />
          </div>
        ),
        error: (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(239,68,68,0.12)] text-[#EF4444]">
            <CircleAlert className="h-5 w-5" strokeWidth={2} />
          </div>
        ),
      }}
      toastOptions={{
        duration: 6000,
        classNames: {
          toast:
            "group toast relative w-[min(92vw,420px)] overflow-hidden rounded-[18px] border border-slate-200 bg-white px-5 py-4 pr-10 text-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] motion-safe:animate-[toast-slide-in_320ms_cubic-bezier(0.16,1,0.3,1)] before:pointer-events-none before:absolute before:inset-0 before:content-['']",
          title: "relative z-10 text-[15px] font-semibold leading-snug text-gray-900",
          description: "relative z-10 mt-0.5 text-[13.5px] leading-snug text-gray-400",
          closeButton:
            "!absolute !left-auto !right-3 !top-3 !m-0 !flex !h-7 !w-7 !items-center !justify-center !rounded-full !border-0 !bg-transparent !p-0 !text-gray-400 !shadow-none hover:!bg-gray-100 hover:!text-gray-600",
          actionButton: "bg-[color:var(--color-clinic-blue)] text-white hover:bg-[color:var(--color-clinic-blue-dark)]",
          cancelButton: "bg-slate-100 text-slate-600 hover:bg-slate-200",
          icon: "!mr-3 !mt-0.5 !h-10 !w-10 !rounded-full !bg-transparent !border-0 !shadow-none !text-current",
          info: "before:bg-[radial-gradient(120px_90px_at_0%_0%,rgba(59,130,246,0.16),transparent_70%)] border-slate-200 text-sky-900",
          success: "before:bg-[radial-gradient(120px_90px_at_0%_0%,rgba(22,163,74,0.16),transparent_70%)] border-slate-200 text-emerald-900",
          warning: "before:bg-[radial-gradient(120px_90px_at_0%_0%,rgba(245,158,11,0.18),transparent_70%)] border-slate-200 text-amber-900",
          error: "before:bg-[radial-gradient(120px_90px_at_0%_0%,rgba(239,68,68,0.16),transparent_70%)] border-slate-200 text-rose-900",
          default: "before:bg-[radial-gradient(120px_90px_at_0%_0%,rgba(148,163,184,0.12),transparent_70%)] border-slate-200 bg-white text-slate-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
