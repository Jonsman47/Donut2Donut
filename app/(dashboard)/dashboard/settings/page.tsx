import Link from "next/link";

export default function Settings() {
  return (
    <div className="card">
      <h1 style={{marginTop:0}}>Seller settings</h1>
      <div className="small">Set bio, rules, timezone, connect Stripe, enable 2FA, etc.</div>
      <div style={{ marginTop: 12 }}>
        <Link className="btn2" href="/verify/setup">Edit verification setup</Link>
      </div>
    </div>
  );
}
