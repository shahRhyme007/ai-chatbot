import '../styles/styles.css'; // Make sure the path to your styles file is correct
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
