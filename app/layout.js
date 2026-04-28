import '../styles/globals.css';

export const metadata = {
  title: 'CloudShare — Secure File Sharing',
  description: 'Share files securely with password protection, expiry links, and instant downloads. Built with Firebase.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
