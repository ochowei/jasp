
import {
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export default function HomeScreen() {
  const { accessToken, promptAsync, logout } = useSpotifyAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (accessToken) {
      fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then(setProfile)
        .catch(console.error);
      fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => setPlaylists(data.items || []))
        .catch(console.error);
    }
  }, [accessToken]);

  if (!accessToken) {
    return (
      <View style={styles.container}>
        <Button title="Login with Spotify" onPress={() => promptAsync()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile && (
        <>
          <Image
            source={{ uri: profile.images?.[0]?.url }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{profile.display_name}</Text>
        </>
      )}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
        style={styles.playlists}
      />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  playlists: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    flexGrow: 0,
    marginBottom: 20,
  },
});
