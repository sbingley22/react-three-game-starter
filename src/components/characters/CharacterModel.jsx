import { useRef, useEffect } from "react"
import glb from "../../assets/SurvivorF.glb?url"
import { useSkinnedMeshClone } from "./SkinnedMeshClone.js"
import { useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

const CharacterModel = ({ anim, transition="cqc stance", speedMultiplier={current:1}, forceAnim={current:false} }) => {
  const { scene, nodes, animations } = useSkinnedMeshClone(glb)
  const { mixer, actions } = useAnimations(animations, scene)
  const lastAnim = useRef(anim.current)
  
  // Initial Setup
  useEffect(()=>{
    console.log(nodes, actions)

    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName]
      if (node.type === "Mesh" || node.type === "SkinnedMesh") { 
        //node.visible = false
        node.castShadow = true
      }
    })

    if (actions[anim.current]){
      actions[anim.current].play()
    }

  },[nodes, actions])

  // Mixer Settings
  useEffect(()=>{
    if (!mixer) return

    const oneShotAnims = ["cqc jab", "cqc straight", "cqc roundhouse", "cqc dmg", "cqc block dmg"]
    oneShotAnims.forEach(osa => {
      if (!actions[osa]) {
        console.log("No such action: ", osa)
        return
      }
      actions[osa].clampWhenFinished = true
      actions[osa].repetitions = 1
    })

    mixer.addEventListener("finished", (e) => {
      const action = e.action.getClip().name
      // console.log(action)
      if (anim.current === "cqc ko") return

      if (action === "cqc dmg") {
        if (transition.current) anim.current = transition.current
        return
      }

      anim.current = "cqc stance"
    })

    return mixer.removeEventListener("finished")
  }, [mixer, actions, anim, transition])

  // Animation Speed
  const getTimeScale = () => {
    let timescale = 1

    if (["cqc walk", "cqc stance"].includes(anim.current)) timescale *= speedMultiplier.current
  
    return timescale
  }

  // Update Animations
  const updateAnimations = () => {
    if (forceAnim.current) {
      forceAnim.current = false
    }
    else if (anim.current === lastAnim.current) return
    if (!actions[anim.current]) console.log("Couldnt find animation", anim.current, lastAnim.current)

    const fadeTime = 0.1
    actions[lastAnim.current].fadeOut(fadeTime)

    const action = actions[anim.current].reset().fadeIn(fadeTime).play()

    const timescale = getTimeScale()
    action.setEffectiveTimeScale(timescale)

    lastAnim.current = anim.current
  }

  // Game Loop
  useFrame((state, delta) => {
    updateAnimations()
  })

  return (
    <>
      <primitive object={scene} />
    </>
  )
}

export default CharacterModel
