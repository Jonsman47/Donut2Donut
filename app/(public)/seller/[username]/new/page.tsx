"use client";

import Link from "next/link";

export default function NewListingPage() {
  return (
    <div className="new">
      <section className="head">
        <div>
          <h1 className="title">New listing</h1>
          <p className="sub">
            Keep it clear. Proof required. Escrow ON by default.
          </p>
        </div>

        <div className="actions">
          <Link className="btn btn-soft" href="/seller">
            Back
          </Link>
          <button className="btn btn-primary" type="button">
            Publish (UI)
          </button>
        </div>
      </section>

      <section className="grid">
        {/* LEFT */}
        <div className="left">
          <div className="card">
            <h2 className="h">Basics</h2>

            <div className="field">
              <label className="label">Title</label>
              <input className="input" placeholder="Example: Rare kit bundle / PvP coaching 60 min" />
              <div className="hint">Short, specific, no vague promises.</div>
            </div>

            <div className="row2">
              <div className="field">
                <label className="label">Category</label>
                <select className="select">
                  <option>Items</option>
                  <option>Currency</option>
                  <option>Services</option>
                  <option>Digital</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Delivery</label>
                <select className="select">
                  <option>Instant</option>
                  <option>Manual</option>
                  <option>In-game trade</option>
                  <option>Scheduled</option>
                  <option>Milestones</option>
                  <option>Service</option>
                </select>
              </div>
            </div>

            <div className="row2">
              <div className="field">
                <label className="label">Price</label>
                <div className="priceWrap">
                  <span className="euro">€</span>
                  <input className="input priceInput" placeholder="19.99" />
                </div>
              </div>

              <div className="field">
                <label className="label">Quantity</label>
                <input className="input" placeholder="1" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="h">What you receive</h2>

            <div className="field">
              <label className="label">Description</label>
              <textarea
                className="textarea"
                placeholder={
                  "Write exactly what the buyer gets.\n\n- Item name / exact service\n- Any limits\n- Any requirements\n- Delivery steps"
                }
              />
              <div className="hint">This is what disputes are judged against.</div>
            </div>
          </div>

          <div className="card">
            <h2 className="h">Proof rules</h2>

            <div className="proofGrid">
              <div className="proofCard">
                <div className="proofTop">
                  <div className="dot ok" />
                  <div className="proofTitle">Required</div>
                </div>
                <div className="proofText">Screenshot, logs, or short video proof.</div>
              </div>

              <div className="proofCard">
                <div className="proofTop">
                  <div className="dot dim" />
                  <div className="proofTitle">Recommended</div>
                </div>
                <div className="proofText">Time-stamped proof if possible.</div>
              </div>

              <div className="proofCard">
                <div className="proofTop">
                  <div className="dot warn" />
                  <div className="proofTitle">Not allowed</div>
                </div>
                <div className="proofText">Fake screenshots, edited logs, or missing evidence.</div>
              </div>
            </div>

            <div className="field">
              <label className="label">Proof details</label>
              <textarea
                className="textarea smallArea"
                placeholder={
                  "Example:\n- Proof = screenshot of trade + chat logs\n- Buyer name must appear\n- Delivery must be visible"
                }
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="right">
          <div className="sideCard">
            <div className="sideTitle">Safety summary</div>

            <div className="pillRow">
              <span className="pill on">Escrow ON</span>
              <span className="pill dim">Proof required</span>
              <span className="pill dim">Dispute 48h</span>
            </div>

            <div className="sideBox">
              <div className="k">You get paid when</div>
              <div className="v">Buyer confirms delivery</div>
            </div>

            <div className="sideBox">
              <div className="k">If buyer disputes</div>
              <div className="v">Evidence is reviewed</div>
            </div>

            <div className="sideBox">
              <div className="k">Best move</div>
              <div className="v">Be specific + upload proof</div>
            </div>

            <button className="publishBtn" type="button">
              Publish listing (UI)
            </button>

            <Link className="rulesLink" href="/rules">
              Read marketplace rules
            </Link>
          </div>
        </aside>
      </section>

      <style jsx>{`
        .new{ display:flex; flex-direction:column; gap: 14px; }

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
          border-radius: 16px;
          padding: 12px 14px;
          font-weight: 900;
          font-size: 13px;
          border: 1px solid rgba(120,170,255,.16);
          background: rgba(10,16,32,.44);
          color: rgba(234,241,255,.92);
          cursor:pointer;
          text-decoration:none;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          transition: transform .12s ease, box-shadow .12s ease, background .12s ease;
          user-select:none;
        }
        .btn:hover{ transform: translateY(-1px); }
        .btn-primary{
          background: linear-gradient(180deg, rgba(120,220,255,.22), rgba(120,170,255,.12));
          border-color: rgba(120,220,255,.18);
          box-shadow: 0 18px 70px rgba(0,0,0,.30);
        }
        .btn-soft{ background: rgba(120,170,255,.08); }

        .grid{
          display:grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 14px;
        }

        .left{ display:flex; flex-direction:column; gap: 12px; }

        .card{
          border-radius: 22px;
          padding: 14px;
          background: rgba(10,16,32,.38);
          border: 1px solid rgba(120,170,255,.12);
          box-shadow: 0 16px 60px rgba(0,0,0,.26);
          display:flex;
          flex-direction:column;
          gap: 12px;
        }

        .h{ margin:0; font-size: 16px; font-weight: 950; }

        .field{ display:flex; flex-direction:column; gap: 6px; }
        .label{ font-weight: 900; font-size: 12px; color: rgba(234,241,255,.78); }

        .input, .select, .textarea{
          border-radius: 16px;
          border: 1px solid rgba(120,170,255,.16);
          background: rgba(10,16,32,.44);
          color: rgba(234,241,255,.92);
          padding: 12px 12px;
          outline:none;
          font-weight: 700;
        }

        .textarea{ min-height: 140px; resize: vertical; line-height: 1.35; }
        .smallArea{ min-height: 110px; }

        .input:focus, .select:focus, .textarea:focus{
          border-color: rgba(120,220,255,.30);
          box-shadow: 0 0 0 1px rgba(120,220,255,.10) inset, 0 0 50px rgba(120,220,255,.10);
        }

        .hint{
          font-size: 12px;
          color: rgba(234,241,255,.66);
          line-height: 1.35;
        }

        .row2{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .priceWrap{
          display:flex;
          align-items:center;
          gap: 8px;
          padding: 0 10px;
          border-radius: 16px;
          border: 1px solid rgba(120,170,255,.16);
          background: rgba(10,16,32,.44);
        }
        .euro{
          font-weight: 950;
          color: rgba(234,241,255,.78);
        }
        .priceInput{
          border: 0;
          background: transparent;
          padding: 12px 0;
          flex: 1;
        }
        .priceInput:focus{ outline:none; box-shadow:none; }

        .proofGrid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .proofCard{
          border-radius: 18px;
          padding: 12px 12px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
          display:flex;
          flex-direction:column;
          gap: 8px;
        }
        .proofTop{
          display:flex;
          align-items:center;
          gap: 10px;
        }
        .dot{
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: rgba(120,170,255,.18);
          flex: 0 0 auto;
        }
        .ok{
          background: rgba(120,220,255,.28);
          box-shadow: 0 0 30px rgba(120,220,255,.12);
        }
        .dim{ opacity: .75; }
        .warn{
          background: rgba(255,190,120,.20);
          box-shadow: 0 0 30px rgba(255,190,120,.10);
        }
        .proofTitle{ font-weight: 950; font-size: 13px; }
        .proofText{ color: rgba(234,241,255,.70); font-size: 12px; line-height: 1.35; }

        .right{ position: sticky; top: 90px; height: fit-content; }

        .sideCard{
          border-radius: 24px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(14,22,40,.62), rgba(14,22,40,.46));
          border: 1px solid rgba(120,170,255,.18);
          box-shadow: 0 24px 100px rgba(0,0,0,.40);
          display:flex;
          flex-direction:column;
          gap: 12px;
        }
        .sideTitle{ font-weight: 950; font-size: 14px; }

        .pillRow{ display:flex; gap: 8px; flex-wrap: wrap; }

        .pill{
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120,170,255,.14);
          font-weight: 900;
          font-size: 12px;
          background: rgba(10,16,32,.32);
        }
        .on{ background: rgba(120,220,255,.10); }
        .dimP{ opacity: .86; }

        .sideBox{
          border-radius: 18px;
          padding: 10px 10px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
        }
        .k{ color: rgba(234,241,255,.68); font-weight: 900; font-size: 12px; }
        .v{ margin-top: 4px; font-weight: 950; }

        .publishBtn{
          padding: 14px;
          border-radius: 18px;
          font-weight: 950;
          border: 1px solid rgba(120,220,255,.22);
          background: linear-gradient(180deg, rgba(120,220,255,.26), rgba(120,170,255,.14));
          box-shadow: 0 18px 70px rgba(0,0,0,.30);
          color: rgba(234,241,255,.94);
          cursor:pointer;
        }

        .rulesLink{
          text-decoration:none;
          color: rgba(234,241,255,.78);
          font-weight: 900;
          font-size: 12px;
          padding: 10px 10px;
          border-radius: 14px;
          border: 1px solid rgba(120,170,255,.10);
          background: rgba(10,16,32,.28);
          text-align:center;
        }

        @media (max-width: 980px){
          .grid{ grid-template-columns: 1fr; }
          .right{ position: static; }
          .proofGrid{ grid-template-columns: 1fr; }
        }
        @media (max-width: 520px){
          .row2{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
