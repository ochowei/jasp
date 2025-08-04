
import { useEffect, useState } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
      scopes: ['user-read-email', 'playlist-modify-public', 'playlist-modify-private'],
      usePKCE: true,
      redirectUri: makeRedirectUri({
        scheme: 'jasp',
        path: 'redirect',
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '';
      const clientSecret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || '';
      const redirectUri = makeRedirectUri({
        scheme: 'jasp',
        path: 'redirect',
      });
      const body = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_id=${clientId}&client_secret=${clientSecret}`;
      fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      })
        .then((res) => res.json())
        .then((data) => {
          setAccessToken(data.access_token || null);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [response]);

  const logout = () => setAccessToken(null);

  return { accessToken, promptAsync, logout };
};
