import "@/styles/globals.css";
import type { AppProps } from "next/app";
import UserLayout from '../layouts/UserLayout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserLayout>
      <Component {...pageProps} />
    </UserLayout>
);
}
