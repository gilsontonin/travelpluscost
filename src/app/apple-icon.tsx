import { ImageResponse } from "next/og";

// Home-screen icon (iOS): coral "+" mark, generated from the brand.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff385c",
          color: "#ffffff",
          fontSize: 132,
          fontWeight: 700,
        }}
      >
        +
      </div>
    ),
    size,
  );
}
