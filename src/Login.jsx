
import { Container } from "react-bootstrap"

const AUTH_URL =
  "https://accounts.spotify.com/authorize/?client_id=512a27e957f64618bc90c0433245902d" +
  "&response_type=code" +
  "&redirect_uri=http://localhost:3000" +
  "&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";
export default function Login() {
  return (
    <Container className="flex justify-center items-center h-screen">
      <a className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg" href={AUTH_URL}>
        Login With Songify
      </a>
      
    </Container>
  )
}
