// TUNIO 2023
// nuClock
// No moment is the same
// Ephermal seconds tick by
// And no moment will ever be repeated
// Not today
// Not in your lifetime
// Not in the history of the universe
// Every moment is unprecedented
// Here we present a unique glyph for every moment
// A new language with as many words as there are moments in all of time
// Because this clock doesnt till time, it is an equally stubborn and persistant reminder
// that each moment is unique and unprecedented
// Because every moment is unique and ephermal
// The 24 7 365 cycle is only a stubbornly persistant illusion

// EXPLAINER: A bunch of stills different times, and diff days same time
// AND same times and days different years
// And a morphing timeline that flexes into the x axis
// DO THAT animorphs kind of thing


let newbg_r = 0;
let newbg_g = 0;
let newbg_b = 0;
let bg_r = 0;
let bg_g = 0;
let bg_b = 0;
let tprime = 0;
let oldsec = 0;
let trigger_time = false;
let line_seed = 0;
let new_string_1= [];
let string_1 = [];
let ns2 = [];
let s2 = [];
let ns3 =[];
let s3 = [];
let num_points = 1; // on bezier vertexes not include start and end
p5.disableFriendlyErrors = true;

function preload() {
  loaded_font = loadFont("hasubi.ttf"); // hasubi pit_thin
}

function setup() {
  mindim = min(windowWidth, windowHeight);
  let cnv = createCanvas(mindim - mindim/4, mindim - mindim/4);
  cnv.parent('p5-container'); 
  background(0);
  frameRate(60);
  string_1 = get_new_string(num_points, 123123123, 0.0);
  s2 = get_new_string(num_points, 456456456, 0.0);
  noiseSeed("thisisalawoflife");
  textFont(loaded_font);
}


function draw() {
  cursec = floor(new Date().getTime() / 1000);

  if (cursec > oldsec) {
    trigger_time = true;
  }

  if (trigger_time) {
    newbg_r = 255 * noise(cursec);
    newbg_g = 255 * noise(cursec + 9000);
    newbg_b = 255 * noise(cursec + 18000);
    line_seed = 98989678908989 * noise(cursec);
    new_string_1 = get_new_string(num_points, 123123123, 1.3); // 1.0
    ns2 = get_new_string(num_points, 456456456, 1.3); // 1.0
    trigger_time = false;
    oldsec = cursec;
  }

  // making the background
  bg_r = bg_r + 0.15 * (newbg_r - bg_r);
  bg_g = bg_g + 0.15 * (newbg_g - bg_g);
  bg_b = bg_b + 0.15 * (newbg_b - bg_b);
  noStroke();
  fill(251, 230);
  rect(0, 0, width, height);
  fill(bg_r, bg_g, bg_b, 220); // 200
  rect(0, 0, width, height, 15);

  // draw strings
  string_1 = tween_string(string_1, new_string_1);
  draw_string(string_1, 255);
  s2 = tween_string(s2, ns2);
  draw_string(s2, 0);

  // time step
  tprime += 100 * noise(cursec);

  // print time
  textStyle(BOLD);
  current_time = get_current_time();
  //show_full = format_time(get_full_time(current_time, 0), false); // just time
  show_full = format_time(get_full_time(current_time, 0), true); //  actually full date

  noStroke();
  textSize(width / 13);
  fill(0);
  textAlign(CENTER, BOTTOM);
  text(show_full, width/2, height-8);
}

function get_new_string(num_points, disp, mult) {
  out_string = [];
  rd = disp ;

  ww = mult * width;
  wadj = (ww-width)/2;
  hh = mult * height;
  hadj = (hh-height)/2;

  // starting vertex
  tx = ww * noise(rd + line_seed + -1 * 100) - wadj;
  ty =  hh * noise(rd + line_seed + 10 + -1 * 100) - hadj;
  out_string.push(tx); // 0
  out_string.push(ty);  // 1 // (0,1) starting coordinates
  let c = 0;
  for (let i=0; i < num_points; i++) {
    sx = ww * noise(rd + line_seed + 20 + (i-1) * 100) - wadj;
    sy = hh * noise(rd + line_seed + 30 + (i-1) * 100) - hadj;
    fx =  ww * noise(rd + line_seed + 40 + (i+1) * 100) - wadj;
    fy =  hh * noise(rd + line_seed + 50 + (i+1) * 100) - hadj;
    x3 =  ww * noise(rd + line_seed + 60 + i * 100) - wadj;
    y3 =  hh * noise(rd + line_seed + 70 + i * 100) - hadj;
    out_string.push(sx, sy, fx, fy, x3, y3); // i + 2, 3, 4, 5, 6, 7
    c+=1;
  }
  // ending vertex
  ex = ww * noise(rd + line_seed + 80 + (c+1) * 100) - wadj;
  ey = hh * noise(rd + line_seed + 90 + (c+1) * 100) - hadj;
  out_string.push(ex, ey);

  return out_string;
}

function draw_string(ts, clr) {
  stroke(clr, 225);
  noFill();
  strokeWeight(5);

  beginShape();
  curveVertex(ts[0], ts[1]);

  for (let i=2; i<(ts.length - 2); i++) {
    bezierVertex(ts[i+2], ts[i+3], ts[i+4], ts[i+5], ts[i+6], ts[i+7]);
  }

  curveVertex(ts[ts.lenght-2], ts[ts.lenght-2]);
  endShape();
}

function tween_string(os, ns) {
  for (let i=0; i<ns.length; i++) {
    os[i] = os[i] + 0.15 * (ns[i] - os[i]); // 0.15 mult good 0.15 was good as well  
  }
  return os;
}

function format_time(full_time, yearsetc) {
  hoursInDay = full_time[0];
  minutesInHour = full_time[1];
  secondsInMinute = full_time[2];
  if (yearsetc) {
    now = new Date();
    yearnow = now.getFullYear();
    monthnow = now.getMonth() + 1;
    daynow = now.getDate();
    msnow = now.getMilliseconds();
    return `${nf(yearnow, 2)}:${nf(monthnow, 2)}:${nf(daynow, 2)}:${nf(hoursInDay, 2)}:${nf(minutesInHour, 2)}:${nf(secondsInMinute, 2)}:${nf(msnow, 3)}`;
  } else {
    return `${nf(hoursInDay, 2)}:${nf(minutesInHour, 2)}:${nf(secondsInMinute, 2)}`;
  }
}

function get_full_time(currentTime, phase) {
  currentTime += phase; // phase in milliseconds
  seconds = Math.floor(currentTime / 1000);
  secondsInMinute = seconds % 60;
  minutesInHour = Math.floor(seconds / 60) % 60;
  hoursInDay = Math.floor(seconds / 3600) % 24;
  return [hoursInDay, minutesInHour, secondsInMinute];
}

function get_current_time() {
  currentTime = new Date().getTime();
  timeZoneOffset = new Date().getTimezoneOffset() * 60;
  currentTime -= timeZoneOffset * 1000;
  return currentTime;
}

