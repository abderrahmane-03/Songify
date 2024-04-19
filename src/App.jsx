import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";

const code = new URLSearchParams(window.location.search).get("code")


export default function App() {
    return (
        code ? <Dashboard code={code} /> : <Login />
    );
};


