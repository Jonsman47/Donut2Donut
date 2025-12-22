import DevToolsPanel from "@/components/DevToolsPanel";

export default function MarketDevToolsPage() {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Admin</span>
          <h1 className="h2">Market dev tools</h1>
          <p className="p">Hidden tools for counts and demo seed data.</p>
        </div>
        <DevToolsPanel />
      </div>
    </section>
  );
}
