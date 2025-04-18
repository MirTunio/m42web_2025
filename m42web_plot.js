let sketch2 = (p) => {
  let prices = [], lob_hist = [], lob = [];
  const max_lob = 40, max_lob_hist = 50, maxPoints = 50, basePrice = 100;
  let t = 0, price = basePrice, loaded_font;

  p.preload = function() {
    loaded_font = p.loadFont("hasubi.ttf");
  };

  p.setup = function() {
    let cnv = p.createCanvas(600, 300);
    cnv.parent('p5-container-2');
    p.frameRate(25);
    p.strokeWeight(1.5);
    p.textFont(loaded_font);
  };

  p.draw = function() {
  p.background(255);
  price = generatePrice(t);

  if (p.frameCount % 2 === 0) {
    updateData(price);
  }

  p.push();
  p.translate(0, movingAverage(prices, 10));
  drawChart(prices);
  p.pop();

  drawFraming();
  t++;
}

function generatePrice(time) {
  return basePrice + p.height * p.floor((p.noise(time * 0.08) - 0.5) * 100) * 0.012;
}

function updateData(newPrice) {
  prices.push(newPrice);
  lob_hist.push([...lob]);
  if (prices.length > maxPoints) {
    prices.shift();
  }
  if (lob_hist.length > max_lob_hist) {
    lob_hist.shift();
  }
}

function drawFraming() {
  p.noFill();
  p.stroke(0);
  p.strokeWeight(3);
  p.rect(2, 2, p.width - 4, p.height - 4, 15);
  p.erase();
  p.strokeWeight(4);
  p.stroke(255, 0, 0);
  p.rect(-1, -1, p.width + 2, p.height + 2, 16.5);
  p.rect(-2, -2, p.width + 4, p.height + 4, 11);
  p.noErase();
}

function drawChart(data) {
  const len = data.length;
  const y_move = movingAverage(prices, 20);

  drawPriceLine(data);
  drawGrid(data);

  if (len < 2){
    return;
  }
  
  const last_p = -data[len - 1] + p.height / 2;
  const second_last_p = -data[len - 2] + p.height / 2;
  draw_lob(len * 10, last_p, second_last_p);
  const [spread, upper, lower] = get_spread(last_p, lob);

  for (let i = 0; i < lob_hist.length; i++) {
    just_draw_lob(lob_hist[i], i * 10, -data[i - 1] + p.height / 2, -data[i - 2] + p.height / 2);
  }

  drawLabels(data, len, y_move, spread, upper, lower);
}

function drawPriceLine(data) {
  p.stroke(0);
  p.strokeWeight(2);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < data.length; i++) {
    const y = -data[i] + p.height / 2;
    p.vertex((i - 1) * 10, y);
    p.vertex(i * 10, y);
  }
  p.endShape();
}

function drawGrid(data) {
  p.strokeWeight(0.1);
  p.stroke(50);
  const len = data.length + 10;
  for (let i = 0; i < len; i++) {
    p.line(i * 10, -p.height * 4, i * 10, p.height * 4);
  }
  for (let d of data) {
    p.line(0, -d + p.height / 2, p.width, -d + p.height / 2);
  }
}

function drawLabels(data, len, y_move, spread, upper, lower) {
  const raw_price = data[len - 1];
  const price_str = p.nf(100 + raw_price / 100, 1, 2);
  const spread_str = p.nf(spread, 1, 2);
  const pred_y = draw_predict(t, (len - 1) * 10);

  p.textSize(16);
  p.strokeWeight(0.5);
  p.stroke(50);
  p.fill(50);
  price_y_move = movingAverage(prices, 8);
  p.line((len - 1) * 10 + 45, -price_y_move + p.height / 2 - 10, (len - 1) * 10 + 5, -raw_price + p.height / 2);
  p.text(price_str, (len - 1) * 10 + 50, -price_y_move + p.height / 2 - 10);

  p.textSize(16);
  p.strokeWeight(0.5);
  p.stroke(0, 0, 180);
  p.fill(0, 0, 180);
  p.line((len - 1) * 10 + 45, -price_y_move + p.height / 2 + 15, (len - 1) * 10 + 13, (lower + upper) / 2);
  p.text(spread_str, (len - 1) * 10 + 50, -price_y_move + p.height / 2 + 15);
  p.noFill();
  drawCurlyBracket((len - 1) * 10 + 5, upper, lower, 'right');

  // pred
  const pred_str = p.nf(100 + pred_y / 100, 1, 2); //p.nf(100 + pred_y / 100, 1, 2);
  pred_tween = ( 3 * pred_y + y_move) / 4 ;
  
  p.textSize(16);
  p.strokeWeight(0.5);
  p.stroke(209, 128, 12);
  p.fill(209, 128, 12);
  p.line((len - 1) * 10 + 45, -price_y_move + p.height / 2 + 40, (len - 1) * 10 + 12, pred_y - 6);
  p.text(pred_str, (len - 1) * 10 + 50, -price_y_move + p.height / 2 + 40);
  
  //line((len - 1) * 10 + 45, -y_move + p.height / 2 + 40, (len - 1) * 10 + 12, pred_y - 6);
  //text(pred_str, (len - 1) * 10 + 50, -y_move + p.height / 2 + 40);
  
  //line((len - 1) * 10 + 45, pred_tween - 6, (len - 1) * 10 + 12, pred_y - 6);
  //text(pred_str, (len - 1) * 10 + 50, pred_tween - 6); //-y_move + p.height / 2 + 40);
}

function draw_predict(t, xx) {
  const pred_len = 20;
  const y_preds = Array.from({ length: pred_len }, (_, i) => generatePrice(t + i));
  const y_p = movingAverage(y_preds, pred_len);
  const y = -y_p + p.height / 2;
  const x = xx + 6;

  p.textSize(24);
  p.noStroke();
  p.fill(209, 128, 12);
  p.text("<", x, y);
  return y;
}

function draw_lob(last_t, last_p, second_last_p) {
  p.strokeWeight(5);
  p.strokeCap(p.SQUARE);
  const order_guess = p.floor(p.random(-20, 20));
  lob.push(last_p + order_guess * 5);
  if (lob.length > max_lob) lob.shift();

  const [lower, upper] = [p.min(last_p, second_last_p) - 5, p.max(last_p, second_last_p) + 5];
  lob = lob.filter(p => p < lower || p > upper);

  for (let pt of lob) {
    p.stroke(pt < last_p ? p.color(0, 85, 0, 120) : p.color(85, 0, 0, 120));
    p.line(last_t - 20, pt, last_t - 10, pt);
}
}

function just_draw_lob(t_lob, last_t, last_p, second_last_p) {
  p.strokeWeight(5);
  p.strokeCap(p.SQUARE);
  const [lower, upper] = [p.min(last_p, second_last_p) - 5, p.max(last_p, second_last_p) + 5];

  for (let pt of t_lob.filter(pt => pt < lower || pt > upper)) {
    p.stroke(pt < last_p ? p.color(0, 85, 0, 120) : p.color(85, 0, 0, 120));
    p.line(last_t - 20, pt, last_t - 10, pt);
}
}

function get_spread(target, arr) {
  let closestBelow = null, closestAbove = null;
  let minDiffBelow = Infinity, minDiffAbove = Infinity;

  for (let num of arr) {
    const diff = num - target;
    if (diff < 0 && -diff < minDiffBelow) {
      minDiffBelow = -diff;
      closestBelow = num;
    } else if (diff > 0 && diff < minDiffAbove) {
      minDiffAbove = diff;
      closestAbove = num;
    }
  }

  return [p.abs(closestAbove / 100 - closestBelow / 100), closestAbove, closestBelow];
}

function movingAverage(arr, len) {
  if (arr.length < len) return arr[arr.length - 1];
  return arr.slice(-len).reduce((a, b) => a + b, 0) / len;
}

function drawCurlyBracket(x, yTop, yBottom, side = 'left') {
  let w = 10; // horizontal width of the bracket
  let h = yBottom - yTop;
  let third = h / 3;
  let dir = side === 'left' ? -1 : 1;

  p.bezier(x, yTop,
         x + dir * w, yTop,
         x + dir * w, yBottom,
         x, yBottom);
  p.endShape();
}


  // Define all helper functions here, replacing all global p5 calls with p prefixed versions
};

new p5(sketch2);
