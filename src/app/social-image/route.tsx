import { ImageResponse } from "next/og";

export const revalidate = 86400;

export async function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fbfaf8", color: "#06472f", padding: 80, flexDirection: "column", justifyContent: "center", borderBottom: "24px solid #bc8050" }}>
      <div style={{ fontSize: 100, fontWeight: 700 }}>Drape &amp; Line</div>
      <div style={{ marginTop: 30, fontSize: 40 }}>Everyday style for everyone</div>
      <div style={{ marginTop: 45, fontSize: 26 }}>Men · Women · Kids · Accessories</div>
    </div>, { width: 1200, height: 630 },
  );
}
