import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
import laserParty, { Laser } from 'three-laser-party'

var camera, orbit, renderer,
    scene = new THREE.Scene()

var geoBox, geoPlane

var groups = [],
    colorPoses = [],
    colorAnims = [],
    movementAnims = []

var startBtn = 
    document.querySelector('.center-button')

startBtn.onclick = handleClick

function handleClick() {
    
    startBtn.innerText = 'Loading'
    startBtn.onclick = null

    setTimeout( init, 100 )
}

function init() {

// Build scene
    geoBox = new THREE.BoxGeometry( 1, 1, 1 )
    geoPlane = new THREE.PlaneGeometry( 1, 1 )

    initRendererAndCamera()
    createBackground()

    buildRoom()
    buildStage()
    buildLights()
    buildLasers()

// Animations
    createAnimations()
    makeColorPoses()
    dispatchAnims()

    animate()

// DOM stuff
    startBtn.style.opacity = 0

    var centerWrap = 
        document.querySelector('.center-wrap')

    centerWrap.style.opacity = 0
    centerWrap.style.pointerEvents = 'none'

    setTimeout( () => centerWrap.remove(), 1000 )
}

function animate() {

    laserParty.updateAll()
    renderer.render( scene, camera )
    requestAnimationFrame( animate )
}

function buildLasers() {

// Desk laser wrap
    var laserWrapperDesk = new THREE.Object3D()
    laserWrapperDesk.position.set( 0, 5, -31.25 )

// Set defaults
    laserParty.defaults.set({
        addTo: laserWrapperDesk,
        thickness: 1.5,
        distance: 85,
        count: 16,
    })

// Desk lasers
    var laserDeskL = new Laser({ x: -7 })
    var laserDeskR = new Laser({ x: 7 })

// Stands laser wrap
    var laserWrapperStands = new THREE.Object3D()
    laserWrapperStands.position.set( 0, 8, -33.875 )

// Change defaults
    laserParty.defaults.addTo = laserWrapperStands

// Stand lasers
    var laserStandL = new Laser({ x: -18 })
    var laserStandR = new Laser({ x: 18 })

// Add wraps to scene
    scene.add( 
        laserWrapperDesk,
        laserWrapperStands
    )

// Make laser groups
    groups.push(

        laserParty.group(
            laserStandL,
            laserStandR
        ), 
        laserParty.group(
            laserDeskL,
            laserDeskR
        ) 

    )
}

function buildStage() {

// Stage stuff
    var stageWrap = new THREE.Object3D()
    stageWrap.position.set( 0, 0, -32)

    var stageMaterial = new THREE.MeshPhongMaterial({
        color: 0x111111,
        shininess: 0,
    })

// Main stage mesh
    var stageMesh = new THREE.Mesh(
        geoBox,
        stageMaterial
    )
    stageMesh.scale.set( 44, 2, 16 )
    stageMesh.position.set( 0, 1, 0 )
    stageMesh.receiveShadow = true

// Desk mesh
    var deskMesh = new THREE.Mesh(
        geoBox,
        stageMaterial
    )
    deskMesh.scale.set( 20, 3, 2 )
    deskMesh.position.set( 0, 3.5, 0 )
    deskMesh.castShadow = true

// Laser stands
    var standL = new THREE.Mesh(
        geoBox,
        stageMaterial
    )
    standL.scale.set( .75, 6, .75 )
    standL.position.set( -18, 5, -2 )
    standL.castShadow = true
    
    var standR = new THREE.Mesh(
        geoBox,
        stageMaterial
    )
    standR.scale.set( .75, 6, .75 )
    standR.position.set( 18, 5, -2 )
    standR.castShadow = true

// Add to scene
    stageWrap.add( stageMesh, deskMesh, standL, standR )
    scene.add( stageWrap )
}

function buildRoom() {

// Walls
    var wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        side: THREE.BackSide,
        roughness: 1,
    })

    var wallMesh = new THREE.Mesh(
        geoBox,
        wallMaterial
    )
    wallMesh.position.y = 8
    wallMesh.scale.set( 60, 16, 80 )
    wallMesh.receiveShadow = true

    laserParty.raycast.addGlobal( wallMesh )
    scene.add( wallMesh )

// Blue decoration planes
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x4499ff
    })

    var floorPlane1 = new THREE.Mesh(
        geoPlane,
        planeMaterial
    )
    floorPlane1.rotation.x = Math.PI / -2
    floorPlane1.position.set( 29.75, .01, 0 )
    floorPlane1.scale.set( .5, 80 )

    var floorPlane2 = floorPlane1.clone()
    floorPlane2.position.set( -29.75, .01, 0 )

    var floorPlane3 = floorPlane1.clone()
    floorPlane3.scale.set( 60, .5 )
    floorPlane3.position.set( 0, .01, -39.75 )

    var floorPlane4 = floorPlane1.clone()
    floorPlane4.scale.set( 60, .5 )
    floorPlane4.position.set( 0, .01, 39.75 )

    var floorPlaneWrap = new THREE.Object3D()
    floorPlaneWrap.add( 
        floorPlane1, 
        floorPlane2, 
        floorPlane3, 
        floorPlane4 
    )

// Clone recursively
    var ceilingPlaneWrap = floorPlaneWrap.clone( true )

    ceilingPlaneWrap.position.y = 16
    ceilingPlaneWrap.rotation.z = Math.PI

// Add to scene
    scene.add( floorPlaneWrap, ceilingPlaneWrap )
}

function buildLights() {

// Ambient light
    var ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = .5
    scene.add( ambientLight )

// SpotLight targets
    var targets = new Array( 3 ).fill( new THREE.Object3D() )
    targets[ 0 ].position.set( 7, 2, -32 )
    targets[ 1 ].position.set( -7, 2, -32 )
    targets[ 2 ].position.set( 0, 6, -32 )
    targets.forEach( target => scene.add( target ) )
    
// Spot lights
    var spots = [
        new THREE.SpotLight( 0xffffff, 2, 100),
        new THREE.SpotLight( 0xffffff, 2, 100),
        new THREE.SpotLight( 0xffffff, 2, 50) 
    ]

    spots[ 0 ].position.set( 20, 8, -20 )
    spots[ 1 ].position.set( -20, 8, -20 )
    spots[ 2 ].position.set( 0, 8, -15 )

    var angle = Math.PI / 5
    spots[ 0 ].angle = angle
    spots[ 1 ].angle = angle
    spots[ 2 ].angle = angle * 2

    spots.forEach( ( spot, i ) => {
        spot.penumbra = 1
        spot.castShadow = true
        spot.autoUpdate = false
        spot.shadow.mapSize.set( 2048, 2048 )
        spot.target = targets[ i ]
        scene.add( spot )
    })
}

function createAnimations() {

// Color animations
    colorAnims.push(

        laserParty.anim({
            type: 'color',
            fn( { deltaTime } ) {

                this.hue += deltaTime * 100
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { time } ) {
                    
                this.hue = Math.sin( time * 10 ) * 30
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { time } ) {
                    
                this.hue = Math.sin( time * 10 ) * 60 + 60
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { time } ) {
                    
                this.hue = Math.sin( time * 5 ) * 30 + 160
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { time } ) {

                for ( let [ i, bP ] of this.getBeamParents ) {
                    
                    if ( i % 2 ) 
                        bP.hue = Math.sin( time * 5 ) * 30 + 260

                    else bP.hue = Math.sin( time ) * 60 + 260
                }
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { deltaTime } ) {

                for ( let [ i, bP ] of this.getBeamParents ) {
                    
                    if ( i % 2 ) bP.hue += deltaTime * 100
                    else bP.hue -= deltaTime * 80
                }
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { deltaTime } ) {

                for ( let [ i, bP ] of this.getBeamParents ) {
                    
                    if ( i % 2 ) bP.lightness = 1
                    else bP.hue -= deltaTime * 80
                }
            }
        }),
        laserParty.anim({
            type: 'color',
            fn( { time } ) {

                for ( let [ i, bP ] of this.getBeamParents ) {
                    
                    bP.hue = time * 2000 + i * 20
                }
            }
        })

    )

// Movement animations
    movementAnims.push(

        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startTime = 0

                return function( { init, time } ) {

                    if ( init ) {
                        startTime = time
                        this.reset()
                        this.spread = .025
                    }

                    this.side = Math.sin( time )

                    if ( time - startTime > 5 ) 
                        dispatchAnims()
                }
            })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startTime = 0

                return function( { init, time } ) {

                    if ( init ) {
                        startTime = time
                        this.reset()
                        this.spread = .025
                    }

                    this.side = Math.cos( time )

                    if ( time - startTime > 5 ) 
                        dispatchAnims()
                }
            })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startTime = 0

                return function( { init, time } ) {

                    if ( init ) {
                        startTime = time
                        this.reset()
                    }

                    this.spread = Math.sin( time )

                    if ( time - startTime > 5 ) 
                        dispatchAnims()
                }
            })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startTime = 0

                return function( { init, time } ) {

                    if ( init ) {
                        startTime = time

                        // reset
                        this.reset()
                        this.spread = .1
                        this.angleX = .1
                    }

                    this.spin = Math.sin( ( 
                        ( time * .5 ) 
                        + this.position.x 
                    ) * 7 )

                    this.angleY = Math.sin( time ) * .25

                    if ( time - startTime > 5 ) 
                        dispatchAnims()
                }
            })()
        }),
        laserParty.anim({
        type: 'movement',
        fn: (() => {

            var startAdjust = 0
            var timeMult = .5

            var lastSide
            var direction

            return function( { init, time } ) {

                if ( init ) {

                    // reset
                    lastSide = 1
                    direction = -1
                    this.reset()

                    // start side at 1
                    startAdjust = 
                        ( time * timeMult ) 
                        + Math.PI / 2
                }
                
                // full back and forth
                // adjusted to start at side 1
                this.side = 
                    Math.sin( 
                        ( time * timeMult ) 
                        - startAdjust 
                    ) * .95

                // raise angleX more as 
                // side gets closer to 0
                this.angleX = 
                    1 - Math.abs( 
                        Math.sin( 
                            ( time * timeMult ) 
                            - startAdjust 
                        ) 
                    )

                // check direction for cycle
                if ( 
                    this.side < lastSide 
                    && direction != -1 
                ) dispatchAnims()

                else if ( 
                    this.side > lastSide 
                    && direction != 1 
                ) direction = 1

                lastSide = this.side
            }
        })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startAdjust = 0
                var timeMult = .5

                var lastSide
                var direction

                return function( { init, time } ) {

                    if ( init ) {

                        // reset
                        lastSide = 1
                        direction = 1
                        this.reset()

                        // start side at 1
                        startAdjust = 
                            ( time * timeMult ) 
                            - Math.PI / 2
                    }
                    
                    // full back and forth
                    // adjusted to start at side 1
                    this.side = 
                        Math.sin( 
                            ( time * timeMult ) 
                            - startAdjust 
                        ) * .95

                    // raise angleX more as 
                    // side gets closer to 0
                    this.angleX = 
                        1 - Math.abs( 
                            Math.sin( 
                                ( time * timeMult ) 
                                - startAdjust 
                            ) 
                        )

                    // check direction for cycle
                    if ( 
                        this.side < lastSide 
                        && direction != -1 
                    ) direction = -1

                    else if ( 
                        this.side > lastSide 
                        && direction != 1 
                    ) dispatchAnims()

                    lastSide = this.side
                }
            })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startAdjust = 0
                var timeMult = .5

                var lastSide
                var direction

                return function( { init, time } ) {

                    if ( init ) {

                        // reset
                        lastSide = 1
                        direction = -1
                        this.reset()

                        // start side at 1
                        startAdjust = 
                            ( time * timeMult ) 
                            + Math.PI / 2
                    }
                    
                    // full back and forth
                    // adjusted to start at side 1
                    this.side = 
                        Math.sin( 
                            ( time * timeMult ) 
                            - startAdjust 
                        ) * .95

                    // only animate spread if beams 
                    // aren't fully to the side
                    if ( Math.abs( this.side ) < .9 )
                        this.spread = 
                            Math.abs( 
                                Math.sin( 
                                    ( 
                                        ( time * timeMult ) 
                                        - startAdjust 
                                    ) * 4 ) 
                            )  

                    // check direction for cycle
                    if ( 
                        this.side < lastSide 
                        && direction != -1 
                    ) dispatchAnims()

                    else if ( 
                        this.side > lastSide 
                        && direction != 1 
                    ) direction = 1

                    lastSide = this.side
                }
            })()
        }),
        laserParty.anim({
            type: 'movement',
            fn: (() => {

                var startAdjust = 0
                var timeMult = .5

                var lastSide
                var direction

                return function( { init, time } ) {

                    if ( init ) {

                        // reset
                        lastSide = -1
                        direction = 1
                        this.reset()

                        // start side at 1
                        startAdjust = 
                            ( time * timeMult ) 
                            - Math.PI / 2
                    }
                    
                    // full back and forth
                    // adjusted to start at side 1
                    this.side = 
                        Math.sin( 
                            ( time * timeMult ) 
                            - startAdjust 
                        ) * .95

                    // only animate spread if beams 
                    // aren't fully to the side
                    if ( Math.abs( this.side ) < .9 )
                        this.spread =   
                            Math.abs( 
                                Math.sin( 
                                    ( 
                                        ( time * timeMult ) 
                                        - startAdjust 
                                    ) * 4 ) 
                            )

                    // check direction for cycle
                    if ( 
                        this.side < lastSide 
                        && direction != -1 
                    ) direction = -1

                    else if ( 
                        this.side > lastSide 
                        && direction != 1 
                    ) dispatchAnims()
                    
                    lastSide = this.side
                }
            })()
        })

    )
}

function makeColorPoses() {

// Solid color poses for 6 main colors
    for ( let j = 0; j < 6; j++ ) {

        colorPoses.push(
            laserParty.pose({
                hue: j * 60,
                resetAnimationOnApply: 0,
            })
        )
    }

// Poses for colorAnimations
    for ( let colorAnimation of colorAnims ) {

        colorPoses.push( 
            laserParty.pose({ 
                colorAnimation
            }) 
        )
    }
}

const dispatchAnims = (() => {

    var recentlyDispatched = false

    return function dispatchAnimsInner() {

        // prevent multiple calls from lasers 
        // ending animations at the same time

        if ( recentlyDispatched ) return
        recentlyDispatched = true

        setTimeout( () => 
            recentlyDispatched = false, 500 )

        // set random color poses
        // and movement animations
        // for each laser group

        for ( let group of groups ) {

            group.apply(
                colorPoses[ 
                    THREE.MathUtils
                    .randInt( 0, colorPoses.length - 1 )
                ]
            )
            
            group.animation = 
                movementAnims[ 
                    THREE.MathUtils
                    .randInt( 0, movementAnims.length - 1 )
                ]
        }
    }
})()

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight )
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

function createBackground() {

// Canvas
    var c = document.createElement( 'canvas' ).getContext( '2d' )

    c.canvas.width = 4096
    c.canvas.height = 2048

    c.fillRect( 0, 0, c.canvas.width, c.canvas.height )

    var img = c.getImageData( 0, 0, c.canvas.width, c.canvas.height )

    for ( let j = img.data.length - 4; j >= 0; j -= 4 ) {
        
        if ( Math.random() < .001 ) {

            let value = Math.floor( Math.random() * 255 )

            img.data[ j ] = value
            img.data[ j + 1 ] = value
            img.data[ j + 2 ] = value
        }
    }

    c.putImageData( img, 0, 0 )

// Texture
    var texture = new THREE.Texture( c.canvas )
    texture.needsUpdate = true

// Render target
    var renderTarget = 
        new THREE.WebGLCubeRenderTarget( 
            texture.image.height, 
            texture.image.width 
        )

    renderTarget.fromEquirectangularTexture( 
        renderer, 
        texture 
    )

    scene.background = renderTarget.texture
}

function initRendererAndCamera() {

// Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    })
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( window.innerWidth, window.innerHeight )

    renderer.shadowMap.enabled = true
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = true

    document.body.appendChild( renderer.domElement )

// Camera
    var aspect = window.innerWidth / window.innerHeight
    camera = new THREE.PerspectiveCamera( 70, aspect, .1, 500 )
    camera.position.set( 0, 2, 15 )

    var camMesh = new THREE.Mesh( geoBox )
    camMesh.scale.set( .3, .3, .2 )
    camera.add( camMesh )
    laserParty.raycast.addGlobal( camMesh )

// Orbit
    orbit = new OrbitControls( camera, renderer.domElement )
    orbit.target.set( 0, 5, -32 )
    orbit.update()

    window.addEventListener( 'resize', onWindowResize )
}