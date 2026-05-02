export const metadata = {
  title: "FlickPick",
  description: "A playful movie picker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
