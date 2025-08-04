
import { Button, StyleSheet, Text, View } from 'react-native';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export default function HomeScreen() {
  const { accessToken, userName, promptAsync, logout } = useSpotifyAuth();

  return (
    <View style={styles.container}>
      {accessToken ? (
        <>
          <Text>Welcome, {userName}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Button title="Login with Spotify" onPress={() => promptAsync()} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
