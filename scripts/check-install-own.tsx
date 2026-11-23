// A part of a product that is not Damsko's, for scripts/check-install.ts: its own markup in its own
// Tailwind classes. The check draws it in the app beside Tailwind before anything of Damsko's is
// there and again after, and holds it to the same pixels and the same computed styles: installing
// Damsko restyles nothing of the product's. It is copied into the app as src/Own.tsx; never run here.
const Own = () => (
  <section id="own" className="flex w-64 flex-col gap-2 p-4">
    <h2 className="text-lg font-semibold">Invoices</h2>
    <p className="text-sm text-black/60">
      Three are waiting on a second approval.
    </p>
    <div className="flex gap-2">
      <span className="truncate">
        A-long-unbroken-supplier-name-that-does-not-fit
      </span>
      <button type="button" className="rounded bg-black px-3 py-1 text-white">
        Approve
      </button>
    </div>
    <input
      aria-label="Note"
      className="border px-2"
      defaultValue="Draft"
      type="text"
    />
  </section>
);

export default Own;
