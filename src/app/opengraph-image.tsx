import { ImageResponse } from "next/og";

// Default share/preview card for every page that doesn't set its own. Generated from the brand — no
// logo asset needed: coral "+" mark + wordmark + the promise. 1200×630.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "travelpluscost — one honest price, the same for everyone";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#0066cc",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 80,
              fontWeight: 700,
            }}
          >
            +
          </div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 800 }}>
            <span style={{ color: "#0066cc" }}>travel</span>
            <span style={{ color: "#15151a" }}>pluscost</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 48, fontWeight: 700, color: "#15151a" }}>
          One honest price. The same for everyone.
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 30, color: "#6b6b73" }}>
          What the hotel charges us, plus one small flat fee — never based on your data.
        </div>
      </div>
    ),
    size,
  );
}
