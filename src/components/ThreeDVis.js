/* eslint-disable react/style-prop-object */
import "./ThreeDVis.css"
import { Canvas, useLoader } from '@react-three/fiber'
import { Environment } from "@react-three/drei"
import { Suspense, useRef } from 'react'
import { Player} from "./Player"
import * as THREE from "three"
import { Physics, usePlane, useBox } from "@react-three/cannon"

export const ThreeDVis = (props) => {

    //const texture = useLoader(THREE.TextureLoader, "/../logo512.png")

    function Plane(props) {
      const [ref] = usePlane(() => ({type: "Static", mass: 0, rotation: [-Math.PI / 2, 0, 0], ...props }))
      return (
        <mesh ref={ref}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial attach="material" color={"lightgrey"} />
        </mesh>
      )
    }

    function Cube(props) {
      const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], ...props }))
      return (
        <mesh ref={ref}>
          <boxGeometry args={[.5, 2, .3]} />
          <meshBasicMaterial attach="material" color={"green"} />
        </mesh>
      )
    }

    return (
        <Canvas className="ThreeDVis" shadowmap="true" >
           <Physics
            broadphase="SAP"
            gravity={[0, -2.6, 0]}
          >
          <ambientLight intensity={0.5} />
          <directionalLight color="white" position={[0, 1, .5]} castshadow="true" shadow-mapSize-height={512}
              shadow-mapSize-width={512} />
          
          
            <Suspense fallback={null}>
                <Player castshadow="true" />
            </Suspense> 


          
        <Plane />
        <Cube />

        <Environment preset="forest" background blur={0.1} />
        </Physics>
        </Canvas>
    )
}

/*
<mesh rotation={[-Math.PI / 2, 0, 0]} receiveshadow >
            <planeBufferGeometry attach="geometry" args={[20, 15]} />
            <meshBasicMaterial attach="material" color={"lightgrey"} />
         </mesh>
*/