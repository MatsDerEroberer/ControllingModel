/* eslint-disable no-unused-expressions */
import React, { useRef, useEffect } from 'react'
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei'
import { useInput } from '../hooks/useInput'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from "three"
import { useBox } from '@react-three/cannon'

let walkDirection = new THREE.Vector3()
let rotateAngle = new THREE.Vector3(0, 1, 0)
let rotateQuarternion = new THREE.Quaternion()
let cameraTarget = new THREE.Vector3()

const directionOffset = ({ forward, backward, left, right }) => {
  let directionOffset = 0

  if (forward) {
    if(left) {
      directionOffset = Math.PI / 4
    }else if (right) {
      directionOffset = -Math.PI / 4
    }
  }else if (backward) {
    if (left) {
      directionOffset = Math.PI / 4 + Math.PI / 2
    } else if (right) {
      directionOffset = -Math.PI / 4 - Math.PI / 2
    } else {
      directionOffset = Math.PI
    }
  } else if (left) {
    directionOffset = Math.PI / 2
  } else if (right) {
    directionOffset = -Math.PI / 2
  }

  return directionOffset
}

export function Player(props) {

  //const model = useGLTF('../public/Player.glb')

  const {forward, backward, left, right, jump, shift} = useInput()
  const group = useRef()
  const { nodes, materials, animations } = useGLTF('/ModelWalk.glb')
  const { actions } = useAnimations(animations, group)
  const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }))

  const currentAction = useRef("")
  const controlsRef = useRef()
  const camera = useThree((state) => state.camera)

  const updateCameraTarget = (moveX, moveZ) => {
    camera.position.x += moveX
    camera.position.z += moveZ

    cameraTarget.x = group.current.position.x
    cameraTarget.y = group.current.position.y + 2
    cameraTarget.z = group.current.position.z
    if (controlsRef.current) {
      controlsRef.current.target = cameraTarget
    }

  }

  useEffect(() => {
    let action = ""

    if (forward || backward || left || right) {
      action = "walking"
      if (shift) {
        action = "running"
      }
    } else if (jump) {
      action = "jump"
    } else {
      action = "idle"
    }
    
    if (currentAction != action) {
      const nextActionToPlay = actions[action]  
      const current = actions[currentAction.current]
        current?.fadeOut(0.2)
      nextActionToPlay.reset().fadeIn(0.2).play()
      currentAction.current = action
    }

  }, [forward, backward, left, right, jump, shift])

  useFrame((state, delta) => {
    if (currentAction.current === "running" || currentAction.current === "walking") {
      let angleYCameraDirection = Math.atan2(
        camera.position.x - group.current.position.x,
        camera.position.z - group.current.position.z
      )

    let newDirectionalOffset = directionOffset({ forward, backward, left, right })

      rotateQuarternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + newDirectionalOffset
      )
      group.current.quaternion.rotateTowards(rotateQuarternion, 0.2)
      
      camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, newDirectionalOffset)

      const velocity = currentAction.current === "running" ? 10 : 5

      const moveX = walkDirection.x * velocity * delta
      const moveZ = walkDirection.z * velocity * delta
      group.current.position.x += moveX
      group.current.position.z += moveZ
      updateCameraTarget(moveX, moveZ)
    } 
  })
 //maxPolarAngle={Math.PI / 2 -0.01}
  return (  
    <>
      <OrbitControls ref={controlsRef} enablePan={false}  />
      <group ref={group} {...props} dispose={null} >
      <group name="Scene">
        <group name="MocapGuy_HiRes_Meshes" rotation={[Math.PI / 2, 0, 0]} scale={0.01} />
        <group name="Armature" rotation={[Math.PI, 0, Math.PI]}>
          <primitive object={nodes.mixamorigHips} />
          <primitive object={nodes.Ctrl_Master} />
          <primitive object={nodes.Ctrl_ArmPole_IK_Left} />
          <primitive object={nodes.Ctrl_Hand_IK_Left} />
          <primitive object={nodes.Ctrl_ArmPole_IK_Right} />
          <primitive object={nodes.Ctrl_Hand_IK_Right} />
          <primitive object={nodes.Ctrl_Foot_IK_Left} />
          <primitive object={nodes.Ctrl_LegPole_IK_Left} />
          <primitive object={nodes.Ctrl_Foot_IK_Right} />
          <primitive object={nodes.Ctrl_LegPole_IK_Right} />
          <group name="MocapGuy_Body">
            <skinnedMesh name="MocapGuy_Body_1" geometry={nodes.MocapGuy_Body_1.geometry} material={materials.Body_MAT} skeleton={nodes.MocapGuy_Body_1.skeleton} />
            <skinnedMesh name="MocapGuy_Body_2" geometry={nodes.MocapGuy_Body_2.geometry} material={materials.Reflectors} skeleton={nodes.MocapGuy_Body_2.skeleton} />
          </group>
          <skinnedMesh name="MocapGuy_BrowsLashes" geometry={nodes.MocapGuy_BrowsLashes.geometry} material={materials.Brows_MAT} skeleton={nodes.MocapGuy_BrowsLashes.skeleton} />
          <skinnedMesh name="MocapGuy_Caruncula" geometry={nodes.MocapGuy_Caruncula.geometry} material={materials.Body_MAT} skeleton={nodes.MocapGuy_Caruncula.skeleton} />
          <skinnedMesh name="MocapGuy_Eyes" geometry={nodes.MocapGuy_Eyes.geometry} material={materials.Eyes_MAT} skeleton={nodes.MocapGuy_Eyes.skeleton} />
          <group name="MocapGuy_Hat">
            <skinnedMesh name="MocapGuy_Hat_1" geometry={nodes.MocapGuy_Hat_1.geometry} material={materials.Body_MAT} skeleton={nodes.MocapGuy_Hat_1.skeleton} />
            <skinnedMesh name="MocapGuy_Hat_2" geometry={nodes.MocapGuy_Hat_2.geometry} material={materials.Reflectors} skeleton={nodes.MocapGuy_Hat_2.skeleton} />
          </group>
          <skinnedMesh name="MocapGuy_Teeth" geometry={nodes.MocapGuy_Teeth.geometry} material={materials.Body_MAT} skeleton={nodes.MocapGuy_Teeth.skeleton} />
        </group>
        <group name="cs_grp">
          <group name="cs_arm_fk" position={[1.5, 8.5, 0]} scale={0.82} />
          <group name="cs_calf_fk" position={[0.5, 8.5, 0]} scale={0.82} />
          <group name="cs_circle" position={[0.5, 4.5, 0]} scale={0.21} />
          <group name="cs_circle001" position={[0.5, 4.5, 0]} scale={0.21} />
          <group name="cs_circle_025" position={[2.5, 4.5, 0]} scale={0.21} />
          <group name="cs_foot" position={[0.5, 10.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.31} />
          <group name="cs_foot001" position={[0.5, 10.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.31} />
          <group name="cs_foot002" position={[0.5, 10.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.31} />
          <group name="cs_foot_01" position={[0.5, 18.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={2.19} />
          <group name="cs_foot_roll" position={[0.5, 12.5, 0]} scale={0.59} />
          <group name="cs_forearm_fk" position={[2.5, 8.5, 0]} scale={0.82} />
          <group name="cs_hand" position={[0.5, 19.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.31} />
          <group name="cs_head" position={[0.5, 13.5, 0]} scale={0.21} />
          <group name="cs_hips" position={[0.5, 11.5, 0]} scale={0.21} />
          <group name="cs_master" position={[0.5, 17.5, 0]} scale={0.1} />
          <group name="cs_neck" position={[0.5, 14.5, 0]} scale={0.21} />
          <group name="cs_shoulder_left" position={[0.5, 15.5, 0]} rotation={[-Math.PI, -Math.PI / 2, 0]} scale={1.04} />
          <group name="cs_shoulder_right" position={[0.5, 16.5, 0]} rotation={[-Math.PI, -Math.PI / 2, 0]} scale={1.04} />
          <group name="cs_sphere" position={[0.5, 2.5, 0]} scale={0.21} />
          <group name="cs_sphere_012" position={[3.5, 2.5, 0]} scale={0.21} />
          <group name="cs_square" position={[1.5, 1.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.15} />
          <group name="cs_square_2" position={[0.5, 1.5, 0]} rotation={[-Math.PI, 0, 0]} scale={0.15} />
          <group name="cs_thigh_fk" position={[0.5, 7.5, 0]} scale={0.82} />
          <group name="cs_toe" position={[0.5, 9.5, 0]} scale={0.43} />
        </group>
      </group>
    </group>
    </>
  )
}

useGLTF.preload('../public/ModelWalk.glb')
 /*

 
 */