import Link from "next/link";

export default function SellerPage() {
  return (
    <div className="seller">
      {/* HEADER */}
      <section className="head">
        <div>
          <h1 className="title">Sell</h1>
          <p className="sub">
            Create a listing. Set your rules. Escrow stays ON by default.
          </p>
        </div>

        <div className="actions">
          <Link className="btn btn-soft" href="/market">
            See Market
          </Link>
          <Link className="btn btn-primary" href="/seller/new">
            New Listing
          </Link>
        </div>
      </section>

      {/* INFO STRIP */}
      <section className="strip">
        <div className="strip-card">
          <div className="k">Default protection</div>
          <div className="v">Escrow ON</div>
          <div className="m">Funds held until buyer confirms delivery.</div>
        </div>
        <div className="strip-card">
          <div className="k">Proof required</div>
          <div className="v">Yes</div>
          <div className="m">Upload proof to get paid. No proof = no release.</div>
        </div>
        <div className="strip-card">
          <div className="k">Disputes</div>
          <div className="v">48h</div>
          <div className="m">If a buyer disputes, staff reviews evidence.</div>
        </div>
      </section>

      {/* MAIN */}
      <section className="grid">
        <div className="card">
          <h2 className="h">Seller checklist</h2>

          <div className="check">
            <span className="dot ok" />
            <div>
              <div className="t">Choose category</div>
              <div className="d">Items, currency, services, digital.</div>
            </div>
          </div>

          <div className="check">
            <span className="dot ok" />
            <div>
              <div className="t">Write clear “what you receive”</div>
              <div className="d">Short, specific, no vague promises.</div>
            </div>
          </div>

          <div className="check">
            <span className="dot ok" />
            <div>
              <div className="t">Set delivery method</div>
              <div className="d">Instant, manual, in-game, scheduled, milestones.</div>
            </div>
          </div>

          <div className="check">
            <span className="dot ok" />
            <div>
              <div className="t">Proof rules</div>
              <div className="d">Screenshots / logs / video. Keep it clean.</div>
            </div>
          </div>

          <div className="divider" />

          <div className="ctaRow">
            <Link className="btn btn-primary" href="/seller/new">
              Create listing
            </Link>
            <Link className="btn btn-ghost" href="/rules">
              Read rules
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="h">Trust levels (UI)</h2>

          <div className="trust">
            <div className="badge tone">Standard</div>
            <div className="trustText">
              New seller. Builds trust via reviews + completed orders.
            </div>
          </div>

          <div className="trust">
            <div className="badge toneBlue">Verified</div>
            <div className="trustText">
              Identity / staff verification. Badge shows on listings.
            </div>
          </div>

          <div className="trust">
            <div className="badge toneOk">Top seller</div>
            <div className="trustText">
              High trust % + strong history. Priority in search later.
            </div>
          </div>

          <div className="divider" />

          <div className="small">
            Later we’ll connect real verification + trust scoring. For now this is
            the clean UI layout.
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="note">
        <div className="noteCard">
          <div className="noteTitle">No corporate BS</div>
          <div className="noteText">
            If you deliver what you listed and upload proof, you get paid. Simple.
          </div>
        </div>
      </section>

      <style jsx>{`
        .seller{ display:flex; flex-direction:column; gap: 14px; }

        .head{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap: 12px;
        }

        .title{
          margin:0;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -.4px;
        }

        .sub{
          margin: 6px 0 0;
          color: rgba(234,241,255,.72);
          font-size: 14px;
        }

        .actions{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content:flex-end;
        }

        .btn{
          text-decoration:none;
          border-radius: 16px;
          padding: 12px 14px;
          font-weight: 900;
          font-size: 13px;
          border: 1px solid rgba(120,170,255,.16);
          display:inline-flex;
          align-items:center;
          justify-content:center;
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          user-select:none;
          color: rgba(234,241,255,.92);
        }
        .btn:hover{ transform: translateY(-1px); }
        .btn-primary{
          background: linear-gradient(180deg, rgba(120,220,255,.22), rgba(120,170,255,.12));
          box-shadow:
            0 18px 70px rgba(0,0,0,.30),
            0 0 0 1px rgba(120,220,255,.10) inset;
          border-color: rgba(120,220,255,.18);
        }
        .btn-ghost{ background: rgba(10,16,32,.44); }
        .btn-soft{ background: rgba(120,170,255,.08); }

        .strip{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .strip-card{
          border-radius: 20px;
          padding: 12px 12px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.24);
        }

        .k{ color: rgba(234,241,255,.68); font-weight: 900; font-size: 12px; }
        .v{ margin-top: 6px; font-weight: 950; font-size: 18px; }
        .m{ margin-top: 6px; color: rgba(234,241,255,.70); font-size: 12px; line-height: 1.35; }

        .grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .card{
          border-radius: 22px;
          padding: 14px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.26);
          display:flex;
          flex-direction:column;
          gap: 10px;
        }

        .h{ margin:0 0 2px; font-size: 16px; font-weight: 950; }

        .check{
          display:flex;
          gap: 10px;
          align-items:flex-start;
          padding: 10px 10px;
          border-radius: 18px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
        }

        .dot{
          width: 12px;
          height: 12px;
          border-radius: 999px;
          margin-top: 4px;
          background: rgba(120,170,255,.18);
          flex: 0 0 auto;
        }
        .ok{
          background: rgba(120,220,255,.28);
          box-shadow: 0 0 30px rgba(120,220,255,.12);
        }

        .t{ font-weight: 950; font-size: 13px; }
        .d{ margin-top: 4px; color: rgba(234,241,255,.70); font-size: 12px; }

        .divider{
          height: 1px;
          background: rgba(120,170,255,.10);
          margin: 6px 0;
        }

        .ctaRow{
          display:flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content:flex-end;
        }

        .trust{
          display:flex;
          align-items:flex-start;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 18px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
        }

        .badge{
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.14);
          font-weight: 950;
          font-size: 12px;
          white-space: nowrap;
          background: rgba(10,16,32,.34);
          flex: 0 0 auto;
        }
        .tone{ opacity: .88; }
        .toneBlue{
          border-color: rgba(120,220,255,.22);
          background: rgba(120,220,255,.10);
        }
        .toneOk{
          border-color: rgba(140,255,210,.16);
          background: rgba(140,255,210,.06);
        }

        .trustText{
          color: rgba(234,241,255,.76);
          font-size: 13px;
          line-height: 1.35;
          font-weight: 850;
        }

        .small{
          color: rgba(234,241,255,.66);
          font-size: 12px;
          line-height: 1.4;
        }

        .noteCard{
          border-radius: 24px;
          border: 1px solid rgba(120,170,255,.14);
          background:
            radial-gradient(900px 420px at 20% 20%, rgba(120,220,255,.12), transparent 60%),
            linear-gradient(180deg, rgba(14,22,40,.56), rgba(14,22,40,.44));
          box-shadow: 0 22px 90px rgba(0,0,0,.36);
          padding: 16px 16px;
        }
        .noteTitle{ font-weight: 950; font-size: 14px; }
        .noteText{ margin-top: 6px; color: rgba(234,241,255,.70); font-size: 13px; }

        @media (max-width: 900px){
          .strip{ grid-template-columns: 1fr; }
          .grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
