import NavBar from "./components/NavBar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
