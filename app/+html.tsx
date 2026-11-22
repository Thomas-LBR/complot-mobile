import React, { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Html({ children }: PropsWithChildren) {
  return <html lang="fr"><head>
    <meta charSet="utf-8"/>
    <title>La Table des Amis</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta name="theme-color" content="#111E24"/>
    <meta name="application-name" content="La Table des Amis"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
    <meta name="apple-mobile-web-app-title" content="Table des Amis"/>
    <link rel="manifest" href="/manifest.webmanifest"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
    <ScrollViewStyleReset/>
    <script defer src="/pwa.js"/>
  </head><body>{children}</body></html>;
}
