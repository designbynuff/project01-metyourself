// Eventually want to implement cooler animated/organic waves, kinda like this but dark:
// https://editor.p5js.org/StevesMakerspace/sketches/HI1Algi8w

let canvas;
let h;
let bg;

function setup() {
  // Make a fullscreen bg canvas
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0, 'fixed');
  canvas.style("z-index", "-1");

  background(27, 28, 33);

  // HSB, random hue for stroke
  colorMode(HSB, 100);
  h = random(100);
  bg = random(100);
  console.log(h);
}

function draw() {
  // Create Flow Fields using Perlin Noise (I Let Copilot do this for me and tweaked some variables)
  let xoff = 0;
  for (let x = 0; x < width; x += 100) {
    let yoff = 0;
    for (let y = 0; y < height; y += 100) {
      let angle = noise(xoff, yoff, frameCount * 0.005) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);

      // set stroke colour to hsb and randomise the hue
      stroke(h, 90, 50, 2);

      push();
      translate(x, y);
      rotate(v.heading());
      line(0, 0, 300, 0);
      pop();
      yoff += 0.1;
    }
    xoff += 0.1;
  }

  // redraw the background every 30s
  if (frameCount % 1800 == 0) {
    background(bg, 20, 15);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}