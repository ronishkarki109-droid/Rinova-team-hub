import "./globals.css";

export const metadata = {
  title: "Rinova Team Hub",
  description: "Internal team chat app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
