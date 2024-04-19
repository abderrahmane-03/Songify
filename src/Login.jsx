const AUTH_URL =
    "https://accounts.spotify.com/authorize/" +
    "?client_id=4f2ed15a0d204edf91688cae04c31c29" +
    "&response_type=code" +
    "&redirect_uri=http://localhost:3000" +
    "&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";

export default function Login() {
    return (
        <div className="flex justify-center items-center mx-auto min-h-[100vh]">
            <a
                href={AUTH_URL}
                className="bg-green-700 p-3 rounded-lg text-white hover:bg-green-500 "
            >
                Login with Spotify
            </a>
        </div>
    );
}
