import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import { Container} from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import PropTypes from "prop-types";
import logo from "../public/assets/logo.png";
import "./style.css"

Dashboard.propTypes = {
  code: PropTypes.string.isRequired,
};

const spotifyApi = new SpotifyWebApi({
  clientId: "512a27e957f64618bc90c0433245902d",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");

    axios
      .get("https://sridurgayadav-chart-lyrics-v1.p.rapidapi.com/apiv1.asmx/SearchLyricDirect", {
        params: {
          artist: track.artist,
          song: track.title,
        },
        headers: {
          'X-RapidAPI-Key': 'efdc45b376msh5d42ea8fc526852p16ac38jsna346a77081a0',
          'X-RapidAPI-Host': 'sridurgayadav-chart-lyrics-v1.p.rapidapi.com'
        }
      })
      .then((res) => {
        setLyrics(res.data);
      })
      .catch((error) => {
        console.error(error);
        setLyrics("Lyrics not found");
      });
  }

  useEffect(() => {
    if (!playingTrack) return;

    axios
      .get("http://localhost:3001/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  return (
    <Container className="flex flex-col bg-gradient-to-b from-green-600 to-green-800 text-white min-h-screen">
  <div className="sidebar flex-grow p-4">
    <div className="logo mb-8">
      <a href="#">
        <img
          src={logo}
          alt="Logo"
          className="rounded-md w-44 h-auto"
        />
      </a>
    </div>
    <div className="input-container">
  <input type="search" name="text" value={search} className="input text-black" onChange={(e) => setSearch(e.target.value)} placeholder="search..."/>
  <span className="icon"> 
    <svg width="19px" height="19px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="1" d="M14 5H20" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path opacity="1" d="M14 8H17" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M21 11.5C21 16.75 16.75 21 11.5 21C6.25 21 2 16.75 2 11.5C2 6.25 6.25 2 11.5 2" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path> <path opacity="1" d="M22 22L20 20" stroke="#000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
  </span>
</div>
    
    <div className="overflow-y-auto my-4">
      {searchResults.length ? (
        searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))
      ) : (
        <div className="text-center whitespace-pre">{lyrics}</div>
      )}
    </div>
    <div className="rounded-3xl mt-auto">
      <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
    </div>
  
  </div>
</Container>

  );
}
