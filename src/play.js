import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function play() {
  let mesh
  let renderer
  let scene
  let camera
  let controls // todo

  window.addEventListener("resize", onWindowResize, false)

  const xSize = 7
  const ySize = 7
  const zSize = 14

  let cube

  let dropInterval = 800
  let pause = false
  pauseHandler()

  let dropCounter = 0
  let lastTime = 0
  const arena = createMatrix(zSize, ySize, xSize)
  let pieces = "ILOST"
  let colors = ["#c33", "#3c3", "#33c", "#0cc", "#c0c", "#cc0", "#ccc"]
  let player = {
    piece: pieces[Math.floor(pieces.length * Math.random())],
    color: colors[Math.floor(colors.length * Math.random())],
    pos: {
      x: Math.floor(xSize / 2),
      y: Math.floor(ySize / 2),
      z: 10,
    },
    matrix: createPiece(pieces[Math.floor(pieces.length * Math.random())]),
    score: 0,
  }

  initThree()
  update()

  function init() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10)
    camera.position.z = 1

    scene = new THREE.Scene()

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
  }

  function initThree() {
    scene = new THREE.Scene()

    let focuspoint = new THREE.Vector3(3, 3, 3)
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    camera.position.x = 6.72
    camera.position.y = -12.53
    camera.position.z = 19.73

    camera.up.y = 0
    camera.up.z = 1

    renderer = new THREE.WebGLRenderer({
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.update()

    camera.lookAt(focuspoint)
    controls.enableKeys = false
    controls.target = focuspoint
    // controls.target = focuspoint
    let element = document.querySelector("#container")
    element.appendChild(renderer.domElement)
  }

  function animate() {
    scene.remove.apply(scene, scene.children)
    drawMatrix(player.matrix, player.pos)
    drawLandingPosition()
    drawArenaOutline()
    drawMatrix(arena, {
      x: 0,
      y: 0,
      z: 0,
    })
    renderer.render(scene, camera)
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function update(time = 0) {
    if (!pause) {
      const deltaTime = time - lastTime
      lastTime = time
      dropCounter += deltaTime
      if (dropCounter > dropInterval) {
        playerDrop()
        dropCounter = 0
      }
    }
    animate()

    requestAnimationFrame(update)
  }

  function arenaSweep() {
    let rowCount = 1
    outer: for (let z = 0; z < arena.length - 1; z++) {
      for (let y = 0; y < arena[z].length - 1; y++) {
        for (let x = 0; x < arena[z][y].length; x++) {
          if (arena[z][y][x] === 0) continue outer
        }
      }
      const newSlice = new Array(ySize).fill().map(() => Array(xSize).fill(0))
      arena.splice(z, 1)
      arena.splice(arena.length - 1, 0, newSlice)
      z++
      player.score += rowCount * 10
      rowCount = rowCount * 2
    }
  }
  function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos]
    for (let z = 0; z < m.length; z++) {
      for (let y = 0; y < m[z].length; y++) {
        for (let x = 0; x < m[z][y].length; x++) {
          if (
            m[z][y][x] !== 0 &&
            (arena[z + o.z] && arena[z + o.z][y + o.y] && arena[z + o.z][y + o.y][x + o.x]) !== 0
          ) {
            return true
          }
        }
      }
    }
    return false
  }

  function createMatrix(z, y, x) {
    let m1 = []
    let m2
    let m3
    for (let i = 0; i < z; i++) {
      m2 = []
      for (let j = 0; j < y; j++) {
        m3 = []
        for (let k = 0; k < x; k++) {
          m3.push(0)
        }
        m2.push(m3)
      }
      m1.push(m2)
    }
    return m1
  }
  function createPiece(type) {
    if (type === "I") {
      return [
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 1, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      ]
    } else if (type === "J") {
      return [
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [0, 2, 0],
          [0, 2, 0],
          [2, 2, 0],
        ],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ]
    } else if (type === "L") {
      return [
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [0, 3, 0],
          [0, 3, 0],
          [0, 3, 3],
        ],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ]
    } else if (type === "O") {
      return [
        [
          [4, 4],
          [4, 4],
        ],
        [
          [0, 0],
          [0, 0],
        ],
      ]
    } else if (type === "S") {
      return [
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [0, 5, 5],
          [5, 5, 0],
          [0, 0, 0],
        ],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ]
    } else if (type === "T") {
      return [
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [6, 6, 6],
          [0, 6, 0],
          [0, 0, 0],
        ],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ]
    } else if (type === "Z") {
      return [
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [7, 7, 0],
          [0, 7, 7],
          [0, 0, 0],
        ],
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      ]
    }
  }

  function drawArenaOutline() {
    const geometry = new THREE.BoxGeometry(xSize, ySize, zSize)
    const edges = new THREE.EdgesGeometry(geometry)
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: 0xff00ff,
      })
    )
    line.position.x = Math.floor(xSize / 2)
    line.position.y = Math.floor(ySize / 2)
    line.position.z = Math.floor(zSize / 2) - 0.5
    scene.add(line)
  }
  function drawCube(x, y, z, c = 0x0000ff) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)

    var material = new THREE.MeshBasicMaterial({
      color: c,
    })
    cube = new THREE.Mesh(geometry, material)

    cube.position.x = x
    cube.position.y = y
    cube.position.z = z

    scene.add(cube)
  }

  function drawLineCube(x, y, z, c) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    var edges = new THREE.EdgesGeometry(geometry)
    var line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: c,
      })
    )
    line.position.x = x
    line.position.y = y
    line.position.z = z
    scene.add(line)
  }

  function drawLandingPosition() {
    let z0 = player.pos.z
    while (!collide(arena, player)) {
      player.pos.z--
    }
    player.pos.z++
    drawMatrix(player.matrix, player.pos, false, true, 0xffffff)
    player.pos.z = z0
  }

  function drawMatrix(matrix, offset, drawCubes = true, drawLines = true, lineColor = 0x000) {
    matrix.forEach((surface, z) => {
      surface.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value != 0) {
            if (drawCubes) drawCube(x + offset.x, y + offset.y, z + offset.z, colors[value])
            if (drawLines) drawLineCube(x + offset.x, y + offset.y, z + offset.z, lineColor)
          }
        })
      })
    })
  }

  function merge(arena, player) {
    player.matrix.forEach((sector, z) => {
      sector.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[z + player.pos.z][y + player.pos.y][x + player.pos.x] = value
          }
        })
      })
    })
  }

  document.addEventListener("keydown", event => {
    if (event.keyCode === 32) {
      // space
      pauseHandler()
    } else if (event.keyCode === 38) {
      //up
      playerMove(0, 1)
    } else if (event.keyCode === 39) {
      // right
      playerMove(1, 0)
    } else if (event.keyCode === 40) {
      // down
      playerMove(0, -1)
    } else if (event.keyCode === 37) {
      // left
      playerMove(-1, 0)
    } else if (event.key === "a") {
      playerRotate(1, 0, 0)
      console.log("a")
    } else if (event.key === "s") {
      playerRotate(0, 1, 0)
    } else if (event.key === "d") {
      playerRotate(0, 0, 1)
    } else if (event.key === "f") {
      playerDrop()
    } else if (event.key === "g") {
      playerReset()
    }
  })

  function pauseHandler() {
    pause
      ? (document.querySelector("#start-container").style.display = "none")
      : (document.querySelector("#start-container").style.display = "block")

    pause = !pause
  }

  function playerDrop() {
    player.pos.z--
    if (collide(arena, player)) {
      player.pos.z++
      merge(arena, player)
      playerReset()
      arenaSweep()
    }
  }

  function playerMove(x, y) {
    player.pos.x += x
    player.pos.y += y
    if (collide(arena, player)) {
      player.pos.x -= x
      player.pos.y -= y
    }
  }

  function playerRotate(xr, yr, zr) {
    if (xr) {
      player.matrix = rotateX(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateX(player.matrix)
        player.matrix = rotateX(player.matrix)
        player.matrix = rotateX(player.matrix)
      }
    } else if (yr) {
      player.matrix = rotateY(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateY(player.matrix)
        player.matrix = rotateY(player.matrix)
        player.matrix = rotateY(player.matrix)
      }
    } else if (zr) {
      player.matrix = rotateZ(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateZ(player.matrix)
        player.matrix = rotateZ(player.matrix)
        player.matrix = rotateZ(player.matrix)
      }
    }
  }

  function gameReset() {
    arena.forEach(slice => slice.forEach(row => row.fill(0)))
    pause = true
    showScore()
    player.score = 0
    // playerReset()
  }
  function showScore() {
    console.log(player.score)
  }
  function playerReset() {
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())])
    player.pos = {
      x: Math.floor(xSize / 2),
      y: Math.floor(ySize / 2),
      z: 10,
    }
    player.color = colors[Math.floor(colors.length * Math.random())]
    if (collide(arena, player)) {
      // pause = true
      gameReset()
    }
  }

  function playerRotate(xr, yr, zr) {
    if (xr) {
      player.matrix = rotateX(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateX(player.matrix)
        player.matrix = rotateX(player.matrix)
        player.matrix = rotateX(player.matrix)
      }
    } else if (yr) {
      player.matrix = rotateY(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateY(player.matrix)
        player.matrix = rotateY(player.matrix)
        player.matrix = rotateY(player.matrix)
      }
    } else if (zr) {
      player.matrix = rotateZ(player.matrix)
      if (collide(arena, player)) {
        player.matrix = rotateZ(player.matrix)
        player.matrix = rotateZ(player.matrix)
        player.matrix = rotateZ(player.matrix)
      }
    }
  }

  function rotateZ(matrix) {
    let m = createMatrix(matrix.length, matrix[0].length, matrix[0][0].length)
    for (let z = 0; z < matrix.length; z++) {
      for (let y = 0; y < matrix[z].length; y++) {
        for (let x = 0; x < matrix[z][y].length; x++) {
          m[z][y][x] = matrix[z][x][matrix[z][y].length - 1 - y]
        }
      }
    }
    return m
  }
  function rotateY(matrix) {
    let m = createMatrix(matrix.length, matrix[0].length, matrix[0][0].length)
    for (let z = 0; z < matrix.length; z++) {
      for (let y = 0; y < matrix[z].length; y++) {
        for (let x = 0; x < matrix[z][y].length; x++) {
          m[z][y][x] = matrix[matrix[z][y].length - 1 - y][z][x]
        }
      }
    }
    return m
  }
  function rotateX(matrix) {
    let m = createMatrix(matrix.length, matrix[0].length, matrix[0][0].length)
    for (let z = 0; z < matrix.length; z++) {
      for (let y = 0; y < matrix[z].length; y++) {
        for (let x = 0; x < matrix[z][y].length; x++) {
          m[z][y][x] = matrix[matrix[z][y].length - 1 - x][y][z]
        }
      }
    }
    return m
  }
}
