import * as THREE from 'three'

const vec3a = new THREE.Vector3()
const vec3b = new THREE.Vector3()
const vec3c = new THREE.Vector3()
const quat = new THREE.Quaternion()

export const isUnskippableAnimation = (anim) => {
  if (!anim || !anim.current) return

  const a = anim.current
  if (a === "cqc dmg") return true
  if (a === "cqc block dmg") return true
  if (a === "cqc jab") return true
  if (a === "cqc straight") return true
  if (a === "cqc roundhouse") return true

  return false
}

export const playAudio = (src, volume=1, mute=false) => {
  if (mute) return
  const audio = new Audio(src)
  audio.volume = volume
  audio.play()
}

export const rotateToVec = (group, dx, dy, rotSpeed=0.1) => {
  if (!group) return

  // Calculate target rotation
  const direction = vec3b.set(dx, 0, dy).normalize()
  const angle = Math.atan2(direction.x, direction.z)

  // Create quaternions for current and target rotations
  const currentQuaternion = group.quaternion.clone()
  const targetQuaternion = quat.setFromAxisAngle(vec3c.set(0, 1, 0), angle)

  // Interpolate rotation using slerp
  currentQuaternion.slerp(targetQuaternion, rotSpeed)
  group.quaternion.copy(currentQuaternion)
}

const camYOffset = 4
const camZOffset = 3
export const updateCamera = (group, camera) => {
  if (!group) return
  const focalpoint = vec3a.copy(group.current.position)
  const zoom = 1

  camera.position.x = focalpoint.x
  camera.position.y = focalpoint.y + camYOffset + zoom
  camera.position.z = focalpoint.z + camZOffset + zoom
}


// ---------------------------------------------------------------------
// Player Functions

export const updateHeldInputs = (heldInputs, inputs) => {
  Object.keys(heldInputs.current).forEach((inputName) => {
    if (inputs.keyboard[inputName] || inputs.gamepad[inputName]) heldInputs.current.interact = true
    else heldInputs.current.interact = false
  })
}

export const playerMovement = (group, inputs, anim, transition, options, baseSpeed, speedMultiplier, delta ) => {
  if (!group.current) return
  transition.current = "cqc stance"

  let dx = 0
  let dy = 0

  // keyboard
  if (inputs.keyboard.forward) dy = -1
  else if (inputs.keyboard.backward) dy = 1
  if (inputs.keyboard.left) dx = -1
  else if (inputs.keyboard.right) dx = 1

  // Normalise horizontal movement
  if (dx && dy) {
    dx *= 0.7
    dy *= 0.7
  }

  // gamepad
  const gpmx = inputs.gamepad.moveX
  const gpmy = inputs.gamepad.moveY
  const moveDeadZone = 0.3
  if (options.useController) {
    if (Math.abs(gpmx) > moveDeadZone) dx = gpmx
    if (Math.abs(gpmy) > moveDeadZone) dy = gpmy * -1
  }

  let speed = baseSpeed * speedMultiplier.current * delta

  // move
  const targetPosition = vec3a.set(group.current.position.x + dx * speed, group.current.position.y, group.current.position.z + dy * speed)

  if (dx || dy) {
    // moving
    rotateToVec(group.current, dx, dy)

    transition.current = "cqc walk"
    if (!isUnskippableAnimation(anim)) {
      anim.current = "cqc walk"
    }
  }
  else {
    // stationary
    transition.current = "cqc stance"
    if (!isUnskippableAnimation(anim)) {
      anim.current = "cqc stance"
    }
  }

  group.current.position.x = targetPosition.x
  group.current.position.y = targetPosition.y
  group.current.position.z = targetPosition.z
}

export const playerAttack = (group, anim, inputs) => {
  if (!group) return
  if (!group.current) return
  if (!inputs.keyboard) return

  if (!inputs.keyboard.interact && !inputs.gamepad.interact) return
  if (inputs.heldInputs.interact) return

  if (!isUnskippableAnimation(anim)) {
    // start attack 
    anim.current = "cqc jab"
  }
}

export const playerFlags = (group, anim, forceAnim) => {
  if (!group) return
  if (!group.current) return

  let updateStatus = []

  // Damage Flag
  if (group.current.flagDmg) {
    const flag = group.current.flagDmg
    const distance = 1.5

    if (flag.range > distance) {
      updateStatus.push("health")
      let dmg = flag.damage

      group.current.health -= dmg
      if (anim.current === "cqc dmg") forceAnim.current = true
      anim.current = "cqc dmg"
    }

    group.current.flagDmg = null
  }

  return updateStatus
}

