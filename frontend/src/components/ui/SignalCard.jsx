// components/ui/SignalCard.jsx
export const SignalCard = ({ label, value, detail, icon: Icon }) => (
  <article className="rounded-[24px] border border-[#5ae000] bg-white p-4 dark:border-[#e05200ee] dark:bg-white/5">
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-widest text-[#7d8792] dark:text-[#8ea6cf]">
        {label}
      </p>
      <Icon className="h-4 w-4 text-[#f8003e3d] dark:text-[#50cf15]" />
    </div>
    <p className="mt-4 text-3xl font-semibold dark:text-white">{value}</p>
    <p className="mt-2 text-sm text-[#6b7681] dark:text-[#ff2600]">{detail}</p>
  </article>
);
