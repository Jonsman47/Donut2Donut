import MarketMessages from "@/components/MarketMessages";

export default function MarketMessagesPage() {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Messages</span>
          <h1 className="h2">Your conversations</h1>
        </div>
        <MarketMessages />
      </div>
    </section>
  );
}
