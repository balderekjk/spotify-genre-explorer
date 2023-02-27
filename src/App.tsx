import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import './styles.css';

const spotifyGenres = [
  'acoustic',
  'afrobeat',
  'alt-rock',
  'alternative',
  'ambient',
  'anime',
  'black-metal',
  'bluegrass',
  'blues',
  'bossanova',
  'brazil',
  'breakbeat',
  'british',
  'cantopop',
  'chicago-house',
  'children',
  'chill',
  'classical',
  'club',
  'comedy',
  'country',
  'dance',
  'dancehall',
  'death-metal',
  'deep-house',
  'detroit-techno',
  'disco',
  // 'disney',
  'drum-and-bass',
  'dub',
  'dubstep',
  'edm',
  'electro',
  'electronic',
  'emo',
  'folk',
  'forro',
  'french',
  'funk',
  'garage',
  'german',
  'gospel',
  'goth',
  'grindcore',
  'groove',
  'grunge',
  'guitar',
  'happy',
  'hard-rock',
  'hardcore',
  'hardstyle',
  'heavy-metal',
  'hip-hop',
  'holidays',
  'honky-tonk',
  'house',
  'idm',
  'indian',
  'indie',
  'indie-pop',
  'industrial',
  'iranian',
  'j-dance',
  'j-idol',
  'j-pop',
  'j-rock',
  'jazz',
  'k-pop',
  'kids',
  'latin',
  'latino',
  'malay',
  'mandopop',
  'metal',
  'metal-misc',
  'metalcore',
  'minimal-techno',
  'movies',
  'mpb',
  'new-age',
  'new-release',
  'opera',
  'pagode',
  'party',
  // 'philippines-opm',
  'piano',
  'pop',
  'pop-film',
  'post-dubstep',
  'power-pop',
  'progressive-house',
  'psych-rock',
  'punk',
  'punk-rock',
  'r-n-b',
  'rainy-day',
  'reggae',
  'reggaeton',
  'road-trip',
  'rock',
  'rock-n-roll',
  'rockabilly',
  'romance',
  'sad',
  'salsa',
  'samba',
  'sertanejo',
  'show-tunes',
  'singer-songwriter',
  'ska',
  'sleep',
  'songwriter',
  'soul',
  'soundtracks',
  'spanish',
  'study',
  'summer',
  'swedish',
  'synth-pop',
  'tango',
  'techno',
  'trance',
  'trip-hop',
  'turkish',
  'work-out',
  'world-music',
];

function App() {
  const [tracks, setTracks] = useState([]);
  const [total, setTotal] = useState(0);
  const [genre, setGenre] = useState('acoustic');
  const [youtubeId, setYoutubeId] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      let token = sessionStorage.getItem('spotify_token');
      if (!token) {
        let authOptions = {
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(
                `${import.meta.env.VITE_SPOTIFY_CLIENT_ID}:${
                  import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
                }`,
                'utf-8'
              ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        };
        let response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: authOptions.headers,
          body: authOptions.body,
        });
        let data = await response.json();
        token = data.access_token;
        sessionStorage.setItem('spotify_token', token);
        // Schedule token refresh before it expires
        const tokenExpirationTime = data.expires_in * 1000; // Convert seconds to milliseconds
        const timerId = setInterval(getToken, tokenExpirationTime - 5000);
        sessionStorage.setItem(
          'spotify_token_expiration',
          Date.now() + tokenExpirationTime
        );
      } else {
        // Check if the token has expired and refresh it if needed
        const tokenExpirationTime = parseInt(
          sessionStorage.getItem('spotify_token_expiration')
        );
        if (Date.now() >= tokenExpirationTime) {
          sessionStorage.removeItem('spotify_token');
          sessionStorage.removeItem('spotify_token_expiration');
          return await getToken();
        }
      }
      return token;
    };

    const runSearch = async () => {
      setSelectedIndex(-1);
      setLoading(true);
      const token = await getToken();
      fetch(
        `https://api.spotify.com/v1/search?q=genre:${genre}&type=track&offset=${
          page * 20
        }`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          data.tracks && setTracks(data.tracks.items);
          setLoading(false);
          setTotal(data.tracks.total);
        })
        .catch((err) => console.log(err));
    };

    runSearch();
  }, [genre, page]);

  const runYouTubeSearch = (youtubeSearch: string) => {
    setYoutubeId('');
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${youtubeSearch}&type=video&key=${
        import.meta.env.VITE_YOUTUBE_API_KEY
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setYoutubeId(data.items[0].id.videoId);
      });
  };

  return (
    <div
      style={{
        margin: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          color: 'limegreen',
          margin: 0,
        }}
      >
        Music Genre Explorer
      </h2>
      <h4 style={{ marginTop: 0, color: 'limegreen' }}>Powered by Spotify</h4>
      <select
        style={{
          zIndex: 1,
          fontSize: '16px',
          outlineWidth: 0,
          borderRadius: '20px',
        }}
        onChange={(e) => {
          setPage(0);
          setTimeout(() => setGenre(e.target.value), 300);
        }}
        name="genres"
        id="genre-select"
      >
        {spotifyGenres.map((genre) => {
          return (
            <option className="option" key={genre} value={genre}>
              {genre.toUpperCase()}
            </option>
          );
        })}
      </select>
      {tracks.map((track, index) => {
        return (
          <div
            key={index}
            style={{
              outline: '1px solid darkgray',
              padding: '10px 0',
              marginTop: '15px',
              borderRadius: '5px',
              boxShadow: '1px 2px 4px darkgray',
              width: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'hsl(0, 0%, 98%)',
              opacity: `${loading ? '0.5' : '1'}`,
            }}
          >
            <div
              onClick={() => {
                runYouTubeSearch(`${track.name} ${track.artists[0].name}`);
                setSelectedIndex(index);
              }}
              className="youtube-ctr"
            >
              {selectedIndex === index && youtubeId.length ? (
                <iframe
                  width="100%"
                  height="100%"
                  allowFullScreen
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                ></iframe>
              ) : (
                'Load YouTube Player'
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              {/* <span>
                <strong>Preview:</strong>
              </span> */}
              <video
                style={{
                  marginTop: '-96px',
                  outlineWidth: 0,
                }}
                controls
                name="media"
              >
                <source src={track['preview_url']} type="audio/mpeg" />
              </video>
            </div>
            <p style={{ width: '310px' }}>
              <strong>{track.name}</strong> by {track.artists[0].name} (
              {track.album.release_date.substring(0, 4)})
              {track.explicit && (
                <span style={{ color: 'red' }}>
                  <br />
                  explicit
                </span>
              )}
            </p>
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Spotify
            </a>
          </div>
        );
      })}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={() => page && setPage(page - 1)}>Prev</button>
        <span>
          {total ? `Page: ${page + 1}/${total / 20}` : 'No results available'}
        </span>
        <button
          onClick={() => {
            setPage(page + 1);
            window.scrollTo(0, 0);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
