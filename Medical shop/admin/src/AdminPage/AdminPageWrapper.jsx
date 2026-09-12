import { Loader2, RefreshCcw, AlertCircle } from "lucide-react";

const AdminPageWrapper = ({
  title,
  subtitle,
  loading,
  error,
  onRetry,
  actions,
  children,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-55">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="animate-spin" size={18} />
              <span>Loading data...</span>
            </div>

            <div className="space-y-3">
              <div className="h-12 rounded-xl bg-slate-200 animate-pulse"></div>
              <div className="h-12 rounded-xl bg-slate-100 animate-pulse"></div>
              <div className="h-12 rounded-xl bg-slate-100 animate-pulse"></div>
              <div className="h-12 rounded-xl bg-slate-100 animate-pulse"></div>
              <div className="h-12 rounded-xl bg-slate-100 animate-pulse"></div>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-white p-2 text-red-600">
                <AlertCircle size={18} />
              </div>

              <div>
                <p className="font-medium text-red-700">{error}</p>

                {onRetry ? (
                  <button
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                  >
                    <RefreshCcw size={16} />
                    Retry
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default AdminPageWrapper;