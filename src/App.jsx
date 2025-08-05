import './App.css'

function App() {
  const handleLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
    const scope = encodeURIComponent('user-read-email')
    const authEndpoint = 'https://accounts.spotify.com/authorize'

    window.location.href = `${authEndpoint}?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`
  }

  return (
    <div className="login">
      <button onClick={handleLogin}>Log in with Spotify</button>
    </div>
  )
}

export default App
