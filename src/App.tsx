import Camera from '../Components/Camera/Camera'
import Chatbox from '../Components/Chatbox/Chatbox'

export default function App() {
  return (
    <main className="overlay-root">
      <Chatbox />
      <Camera />
    </main>
  )
}