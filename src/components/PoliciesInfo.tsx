import ExpandableText from "@/components/ExpandableText";

export default function PoliciesInfo({
  policies,
  importantInfo,
  name,
}: {
  policies: { name: string; description: string }[];
  importantInfo: string | null;
  name?: string;
}) {
  if (!policies.length && !importantInfo) return null;
  return (
    <section id="policies" className="mt-10 scroll-mt-32">
      <h2 className="text-xl font-semibold mb-4">{name ? `${name} policies` : "Policies"}</h2>
      {policies.length ? (
        <div className="space-y-4 max-w-3xl">
          {policies.map((p) => (
            <div key={p.name} className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-sm text-black/65 whitespace-pre-line">{p.description}</p>
            </div>
          ))}
        </div>
      ) : null}
      {importantInfo ? (
        <div className="mt-6 max-w-3xl border-t border-black/[0.07] pt-5">
          <h3 className="font-medium text-sm mb-2">{name ? `You need to know about ${name}` : "You need to know"}</h3>
          <ExpandableText text={importantInfo} threshold={240} />
        </div>
      ) : null}
    </section>
  );
}
