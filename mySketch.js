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

let sketch1 = (p) => {
  let newbg_r = 0, newbg_g = 0, newbg_b = 0;
  let bg_r = 0, bg_g = 0, bg_b = 0;
  let tprime = 0, oldsec = 0, trigger_time = false;
  let line_seed = 0;
  let new_string_1 = [], string_1 = [], ns2 = [], s2 = [], ns3 = [], s3 = [];
  let num_points = 1;
  let loaded_font;

  p.disableFriendlyErrors = true;

  p.preload = function() {
    loaded_font = p.loadFont("hasubi.ttf");
  };

  p.setup = function() {
    let cnv = p.createCanvas(250, 250);
    cnv.parent('p5-container');
    cnv.style('display', 'block');
    cnv.style('margin', '0 auto');
    p.frameRate(60);
    string_1 = get_new_string(num_points, 123123123, 0.0);
    s2 = get_new_string(num_points, 456456456, 0.0);
    p.noiseSeed("thisisalawoflife");
    p.textFont(loaded_font);
  };

  p.draw = function() {
  cursec = p.floor(new Date().getTime() / 1000);

  if (cursec > oldsec) {
    trigger_time = true;
  }

  if (trigger_time) {
    newbg_r = 255 * p.noise(cursec);
    newbg_g = 255 * p.noise(cursec + 9000);
    newbg_b = 255 * p.noise(cursec + 18000);
    line_seed = 98989678908989 * p.noise(cursec);
    new_string_1 = get_new_string(num_points, 123123123, 1.3); // 1.0
    ns2 = get_new_string(num_points, 456456456, 1.3); // 1.0
    trigger_time = false;
    oldsec = cursec;
  }

  // making the background
  bg_r = bg_r + 0.15 * (newbg_r - bg_r);
  bg_g = bg_g + 0.15 * (newbg_g - bg_g);
  bg_b = bg_b + 0.15 * (newbg_b - bg_b);
  p.noStroke();
  p.fill(251, 230);
  p.rect(0, 0, p.width, p.height);
  p.fill(bg_r, bg_g, bg_b, 220); // 200
  p.rect(0, 0, p.width, p.height, 15);

  // draw strings
  string_1 = tween_string(string_1, new_string_1);
  draw_string(string_1, 255);
  s2 = tween_string(s2, ns2);
  draw_string(s2, 0);

  // time step
  tprime += 100 * p.noise(cursec);

  // print time
  p.textStyle(p.BOLD);
  current_time = get_current_time();
  //show_full = format_time(get_full_time(current_time, 0), false); // just time
  show_full = format_time(get_full_time(current_time, 0), true); //  actually full date

  p.noStroke();
  p.textSize(p.width / 13);
  p.fill(0);
  p.textAlign(p.CENTER, p.BOTTOM);
  p.text(show_full, p.width/2, p.height-8);
}

function get_new_string(num_points, disp, mult) {
  out_string = [];
  rd = disp ;

  ww = mult * p.width;
  wadj = (ww-p.width)/2;
  hh = mult * p.height;
  hadj = (hh-p.height)/2;

  // starting vertex
  tx = ww * p.noise(rd + line_seed + -1 * 100) - wadj;
  ty =  hh * p.noise(rd + line_seed + 10 + -1 * 100) - hadj;
  out_string.push(tx); // 0
  out_string.push(ty);  // 1 // (0,1) starting coordinates
  let c = 0;
  for (let i=0; i < num_points; i++) {
    sx = ww * p.noise(rd + line_seed + 20 + (i-1) * 100) - wadj;
    sy = hh * p.noise(rd + line_seed + 30 + (i-1) * 100) - hadj;
    fx =  ww * p.noise(rd + line_seed + 40 + (i+1) * 100) - wadj;
    fy =  hh * p.noise(rd + line_seed + 50 + (i+1) * 100) - hadj;
    x3 =  ww * p.noise(rd + line_seed + 60 + i * 100) - wadj;
    y3 =  hh * p.noise(rd + line_seed + 70 + i * 100) - hadj;
    out_string.push(sx, sy, fx, fy, x3, y3); // i + 2, 3, 4, 5, 6, 7
    c+=1;
  }
  // ending vertex
  ex = ww * p.noise(rd + line_seed + 80 + (c+1) * 100) - wadj;
  ey = hh * p.noise(rd + line_seed + 90 + (c+1) * 100) - hadj;
  out_string.push(ex, ey);

  return out_string;
}

function draw_string(ts, clr) {
  p.stroke(clr, 225);
  p.noFill();
  p.strokeWeight(5);

  p.beginShape();
  p.curveVertex(ts[0], ts[1]);

  for (let i=2; i<(ts.length - 2); i++) {
    p.bezierVertex(ts[i+2], ts[i+3], ts[i+4], ts[i+5], ts[i+6], ts[i+7]);
  }

  p.curveVertex(ts[ts.lenght-2], ts[ts.lenght-2]);
  p.endShape();
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
    return `${p.nf(yearnow, 2)}:${p.nf(monthnow, 2)}:${p.nf(daynow, 2)}:${p.nf(hoursInDay, 2)}:${p.nf(minutesInHour, 2)}:${p.nf(secondsInMinute, 2)}:${p.nf(msnow, 3)}`;
  } else {
    return `${p.nf(hoursInDay, 2)}:${p.nf(minutesInHour, 2)}:${p.nf(secondsInMinute, 2)}`;
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



};

new p5(sketch1);
