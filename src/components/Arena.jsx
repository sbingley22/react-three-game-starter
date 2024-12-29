import { useGameStore } from "../useGameStore.js"
import { Environment, Stars } from "@react-three/drei"
import Player from "./characters/Player"

const Arena = () => {
  const { player } = useGameStore()

  return (
    <>
      <Stars />
      <Environment preset='warehouse' />

      <Player />
    </>
  )
}

export default Arena
