import "./globals.css";

export const metadata = {
  title: "DashImportados",
  description: "Dashboard da empresa de importados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
