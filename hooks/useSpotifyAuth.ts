
import { useEffect, useState } from 'react';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const TOKEN_KEY = 'spotify-token';
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
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((token) => {
        if (token) {
          setAccessToken(token);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

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
          if (data.access_token) {
            SecureStore.setItemAsync(TOKEN_KEY, data.access_token).catch(
              console.error
            );
          }
          setAccessToken(data.access_token || null);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [response]);

  const logout = () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(console.error);
    setAccessToken(null);
  };

  return { accessToken, promptAsync, logout, loading };
};
