
import { useEffect, useState } from 'react';
import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
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
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('spotify_token');
      if (storedToken) {
        setAccessToken(storedToken);
        fetchUserProfile(storedToken);
      }
    };
    loadToken();
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserName(data.display_name);
    } catch (e) {
      console.error('Failed to fetch user profile', e);
    }
  };

  useEffect(() => {
    if (response?.type === 'success' && request) {
      const { code } = response.params;
      const getToken = async () => {
        try {
          const tokenResult = await exchangeCodeAsync(
            {
              clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
              code,
              redirectUri: makeRedirectUri({
                scheme: 'jasp',
                path: 'redirect',
              }),
              codeVerifier: request.codeVerifier || '',
            },
            discovery
          );
          const token = tokenResult.access_token;
          setAccessToken(token);
          await AsyncStorage.setItem('spotify_token', token);
          fetchUserProfile(token);
        } catch (e) {
          console.error('Failed to exchange code', e);
        }
      };
      getToken();
    }
  }, [response, request]);

  const logout = async () => {
    await AsyncStorage.removeItem('spotify_token');
    setAccessToken(null);
    setUserName(null);
  };

  return { accessToken, userName, promptAsync, logout };
};
