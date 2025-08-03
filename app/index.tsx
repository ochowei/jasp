
import { Button, StyleSheet, Text, View } from 'react-native';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';

export default function HomeScreen() {
  const { accessToken, promptAsync } = useSpotifyAuth();

  return (
    <View style={styles.container}>
      {accessToken ? (
        <Text>Logged In</Text>
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
