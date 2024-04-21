import React, { useState, useEffect } from "react";
import useAuth from "./useAuth";
import Player from "./Player";
import TrackSearchResult from "./TrackSearchResult";
import { Container, Form } from "react-bootstrap";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import PropTypes from "prop-types";
import logo from "../public/assets/logo.png";
import './Dashboard.css';

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
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <div className="sidebar">
        <div className="logo">
          <a href="#">
            <img
              src={logo}
              alt="Logo"
              className="img-fluid"
            />
          </a>
        </div>
        <Form.Control
          type="search"
          placeholder="Search Songs/Artists"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
          {searchResults.map((track) => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              chooseTrack={chooseTrack}
            />
          ))}
          {searchResults.length === 0 && (
            <div className="text-center" style={{ whiteSpace: "pre" }}>
              {lyrics}
            </div>
          )}
        </div>
        <div>
          <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
        </div>
        <div className="policies">
          <ul className="nav flex-column">
            <li className="nav-item">
              <a className="nav-link" href="#">
                Cookies
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  );
}
