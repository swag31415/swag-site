paper.install(window)
const disp = document.getElementById("disp")
paper.setup(disp)
let path = new Path()
path.strokeColor = "black"
let start = new Point(100,100)
path.moveTo(start)
path.lineTo(start.add([200,-50]))
view.draw()