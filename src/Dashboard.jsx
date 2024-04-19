import useAuth from "./useAuth.jsx";
import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult.jsx";
import axios from "axios";
import Player from "./Player.jsx";

const spotifyApi = new SpotifyWebApi({
    clientId: "f5013bd3f3e74220a58ab1804c84e924",
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
    }

    useEffect(() => {
        if (!playingTrack) return;
        axios
            .get("http://localhost:3001/lyrics", {
                params: {
                    track: playingTrack.title,
                    artist: playingTrack.artist
                }
            })
            .then(res => {
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
        spotifyApi.searchTracks(search)
            .then(res => {
                if (cancel) return;
                setSearchResults(
                    res.body.tracks.items.map(track => {
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
                            albumUri: smallestAlbumImage.url,
                        };
                    })
                );
            });

        return () => (cancel = true);
    }, [search, accessToken]);

    return (
        <div className="flex flex-col py-2 h-screen">
            <input
                className="bg-green-500 w-11/12 md:w-3/5 lg:w-1/3 rounded-lg text-white mx-auto py-2 px-3 placeholder-amber-50 mb-4"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a song"
            />
            <div className="flex flex-col flex-grow overflow-y-auto">
                {searchResults.map(track => (
                    <TrackSearchResult
                        key={track.url}
                        track={track}
                        chooseTrack={chooseTrack}
                    />
                ))}
                {searchResults.length === 0 && (
                    <div className="text-center">
                        <pre>{lyrics}</pre>
                    </div>
                )}
            </div>
            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
            </div>
        </div>
    );
}
