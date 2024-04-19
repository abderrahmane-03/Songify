export default function TrackSearchResult({ track, chooseTrack }) {
    function handlePlay() {
        chooseTrack(track)
    }
    return (
        <div className="flex items-center m-2" onClick={handlePlay}>
            <img src={track.albumUri} className="h-[64px] w-[64px] cursor-pointer " alt={track.title} />
            <div className="ml-3">
                <div>{track.title}</div>
                <div><small>{track.artist}</small></div>
            </div>
        </div>
    );
}
