import MarketMessages from "@/components/MarketMessages";

export default function MarketMessagesDetailPage({
  params,
}: {
  params: { conversationId: string };
}) {
  return (
    <section className="container section">
      <div className="stack-16">
        <div className="stack-6">
          <span className="kicker">Messages</span>
          <h1 className="h2">Conversation</h1>
        </div>
        <MarketMessages initialConversationId={params.conversationId} />
      </div>
    </section>
  );
}
