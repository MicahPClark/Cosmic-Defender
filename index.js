let player;
let bullets = [];
let enemies = [];
let score = 0;
let stars = []; // Add stars for background
let nebulas = []; // Add colorful nebulas for background
let explosions = []; // Add explosions array
let powerups = []; // Add powerups array
let lastPowerupTime = 0; // Track when last powerup was spawned
let scoreIndicators = []; // Add score indicators
let bgParticles = []; // Background particles for ambience

// Game state variables
const GAME_STATE = {
  HOME: 'home',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};
let currentGameState = GAME_STATE.HOME;
let homeButton;

// Wave system variables
let currentWave = 1;
let MAX_WAVES = 20;
let enemiesPerWave = 3;
let enemiesRemaining = 0;
let waveStartTime = 0;
let bossActive = false;
let boss = null;

function setup() {
  createCanvas(600, 400);
  
  // Create home button
  homeButton = {
    x: 30,
    y: 30,
    width: 40,
    height: 40,
    isHovered: false
  };
  
  // Create stars for background
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      twinkleSpeed: random(0.01, 0.05),
      twinkleAmount: random(0.3, 1)
    });
  }
  
  // Create nebula clouds for deep space effect
  for (let i = 0; i < 5; i++) {
    nebulas.push({
      x: random(width),
      y: random(height),
      width: random(80, 200),
      height: random(60, 150),
      color: color(random(100, 255), random(100, 255), random(100, 255), 20),
      rotationSpeed: random(-0.001, 0.001)
    });
  }
  
  // Create background particles
  for (let i = 0; i < 50; i++) {
    bgParticles.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.2, 0.8),
      color: color(random(100, 255), random(100, 255), random(255), random(50, 150))
    });
  }
  
  // Initialize player for later use
  player = new Player(width / 2, height / 2);
}

function startGame() {
  // Reset game variables
  bullets = [];
  enemies = [];
  powerups = [];
  explosions = [];
  scoreIndicators = [];
  score = 0;
  currentWave = 1;
  enemiesRemaining = 0;
  
  // Reset player
  player = new Player(width / 2, height / 2);
  
  // Start first wave
  startWave(currentWave);
  
  // Change state to playing
  currentGameState = GAME_STATE.PLAYING;
}

function startWave(waveNum) {
  // Clear any remaining enemies
  enemies = [];
  bossActive = false;
  boss = null;
  
  // Check if this is a boss wave
  if (waveNum === 10 || waveNum === MAX_WAVES) {
    // Spawn boss for wave 10 and 20
    bossActive = true;
    spawnBoss(waveNum);
    return;
  }
  
  // Set number of enemies for this wave - improved scaling
  // Start with fewer enemies in early waves, gradually increase
  let totalEnemies = 2 + Math.floor(waveNum * 0.7); // Reduced multiplier from 0.8 to 0.7
  
  // Make later waves (15+) much harder but cap at a reasonable amount
  if (waveNum > 15) {
    // Reduced from (waveNum - 15) * 1.5 to (waveNum - 15) * 1.0
    totalEnemies += Math.min(Math.floor((waveNum - 15) * 1.0), 5); // Cap the extra enemies at 5
  }
  
  // Spawn all enemies at once for this wave
  for (let i = 0; i < totalEnemies; i++) {
    spawnEnemy();
  }
  
  // Reset enemy counter since we spawned all at once
  enemiesRemaining = 0;
  
  waveStartTime = millis();
}

function draw() {
  // Create gradient background
  drawGradientBackground();
  
  // Draw nebula clouds for deep space effect
  drawNebulas();
  
  // Draw stars with twinkle effect
  drawStars();
  
  // Draw background particles
  updateAndDrawBgParticles();
  
  // Handle different game states
  switch (currentGameState) {
    case GAME_STATE.HOME:
      drawHomeScreen();
      break;
    case GAME_STATE.PLAYING:
      drawGameScreen();
      break;
    case GAME_STATE.GAME_OVER:
      drawGameOverScreen();
      break;
    case GAME_STATE.VICTORY:
      drawVictoryScreen();
      break;
  }
  
  // Always draw home button except on home screen
  if (currentGameState !== GAME_STATE.HOME) {
    drawHomeButton();
  }
}

function drawGradientBackground() {
  // Create a deep space gradient background
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c1 = color(0, 0, 30); // Dark blue at top
    let c2 = color(30, 0, 40); // Dark purple at bottom
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawNebulas() {
  // Draw nebula clouds for deep space effect
  for (let nebula of nebulas) {
    push();
    translate(nebula.x, nebula.y);
    rotate(frameCount * nebula.rotationSpeed);
    noStroke();
    fill(nebula.color);
    
    // Draw a soft cloud-like shape
    beginShape();
    for (let i = 0; i < 20; i++) {
      let angle = map(i, 0, 20, 0, TWO_PI);
      let r = random(0.8, 1.2) * (nebula.width/2); // Random radius for nebula edges
      let x = cos(angle) * r;
      let y = sin(angle) * r * (nebula.height/nebula.width);
      curveVertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}

function drawStars() {
  // Draw stars with twinkle effect
  noStroke();
  for (let star of stars) {
    let twinkle = sin(frameCount * star.twinkleSpeed) * star.twinkleAmount;
    let size = star.size + twinkle;
    let alpha = map(size, star.size - star.twinkleAmount, star.size + star.twinkleAmount, 100, 255);
    
    // Star glow
    fill(255, 255, 255, alpha * 0.3);
    ellipse(star.x, star.y, size * 2);
    
    // Star core
    fill(255, 255, 255, alpha);
    ellipse(star.x, star.y, size);
  }
}

function updateAndDrawBgParticles() {
  // Update and draw background particles
  for (let i = 0; i < bgParticles.length; i++) {
    let p = bgParticles[i];
    p.y += p.speed;
    
    // Reset if off screen
    if (p.y > height) {
      p.y = 0;
      p.x = random(width);
    }
    
    noStroke();
    fill(p.color);
    ellipse(p.x, p.y, p.size);
  }
}

function drawHomeScreen() {
  // Add a glow effect around title
  drawGlowingText("COSMIC DEFENDER", width/2, height/3 - 30, 50, color(0, 150, 255), 30);
  
  // Subtitle with glow
  drawGlowingText("SPACE SHOOTER", width/2, height/3 + 10, 20, color(200), 15);
  
  // Version
  textSize(12);
  fill(150);
  textAlign(CENTER);
  text("VERSION 1.0", width/2, height/3 + 35);
  
  // Draw animated ship
  drawAnimatedPlayerShip();
  
  // Play button with pulsing effect
  drawPulsingButton("PLAY GAME", width/2, height/2 + 100, 180, 50);
  
  // Instructions
  textSize(14);
  fill(180);
  text("CONTROLS: ARROW KEYS - MOVE | MOUSE - AIM | CLICK - SHOOT", width/2, height - 30);
  
  // Reset text alignment
  textAlign(LEFT, TOP);
}

function drawGlowingText(txt, x, y, size, col, glowSize) {
  textAlign(CENTER, CENTER);
  textSize(size);
  
  // Draw multiple layers for glow effect
  for (let i = glowSize; i > 0; i -= 2) {
    let alpha = map(i, glowSize, 0, 20, 100);
    fill(red(col), green(col), blue(col), alpha);
    text(txt, x, y);
  }
  
  // Draw main text
  fill(col);
  stroke(0);
  strokeWeight(3);
  text(txt, x, y);
  noStroke();
}

function drawAnimatedPlayerShip() {
  push();
  translate(width/2, height/2 + 30);
  
  // Animate rotation slightly
  let wobble = sin(frameCount * 0.05) * 0.1;
  rotate(wobble);
  
  // Draw ship larger for home screen
  let shipSize = 30;
  
  // Ship body - main hull
  noStroke();
  fill(20, 100, 200); // Darker blue body
  beginShape();
  vertex(-shipSize/2, -shipSize/2);
  vertex(-shipSize/2, shipSize/2);
  vertex(shipSize/2, shipSize/4);
  vertex(shipSize, 0);
  vertex(shipSize/2, -shipSize/4);
  endShape(CLOSE);
  
  // Ship details - cockpit
  fill(100, 200, 255, 200);
  ellipse(shipSize/4, 0, shipSize/2, shipSize/3);
  
  // Wing accents
  stroke(0, 200, 255);
  strokeWeight(1);
  line(-shipSize/2, -shipSize/2, shipSize/2, -shipSize/4);
  line(-shipSize/2, shipSize/2, shipSize/2, shipSize/4);
  
  // Animated engine glow
  let thrusterSize = 5 + sin(frameCount * 0.2) * 2;
  
  // Engine glow with animation
  noStroke();
  // Main thruster
  fill(255, 150, 0, 200);
  ellipse(-shipSize/2, 0, thrusterSize, thrusterSize/2);
  
  // Outer glow
  fill(255, 50, 0, 100);
  ellipse(-shipSize/2 - 3, 0, thrusterSize * 1.5, thrusterSize);
  
  // Add particle effects for thrusters
  if (frameCount % 3 === 0) {
    for (let i = 0; i < 2; i++) {
      explosions.push(new Particle(
        -shipSize/2 - 10 + random(-3, 3), 
        random(-3, 3), 
        color(255, 150, 0)
      ));
    }
  }
  
  pop();
}

function drawPulsingButton(label, x, y, width, height) {
  // Calculate button position
  let btnX = x - width/2;
  let btnY = y;
  
  // Check if mouse is over button
  let isHovered = mouseX > btnX && mouseX < btnX + width && 
                 mouseY > btnY && mouseY < btnY + height;
  
  // Pulsing effect for button
  let pulse = 0;
  if (isHovered) {
    // Stronger pulse when hovered
    pulse = sin(frameCount * 0.1) * 5;
  } else {
    // Gentle pulse when not hovered
    pulse = sin(frameCount * 0.05) * 3;
  }
  
  // Draw glowing outline
  noFill();
  for (let i = 5; i > 0; i--) {
    let alpha = map(i, 5, 0, 50, 150);
    stroke(0, 100 + pulse, 255, alpha);
    strokeWeight(i);
    rect(btnX - i, btnY - i, width + i*2, height + i*2, 12);
  }
  
  // Draw button
  fill(isHovered ? 0 : 0, isHovered ? 200 : 150, isHovered ? 255 : 200);
  stroke(0, 100, 255);
  strokeWeight(2);
  rect(btnX, btnY, width, height, 10);
  
  // Button text
  textSize(24);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x, btnY + height/2);
}

function drawGameScreen() {
  // Player movement and display
  player.move();
  player.show();
  player.updatePowerups(); // Update player powerups
  
  // Handle bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
      continue;
    }
    
    // Check bullet-boss collision if boss is active
    if (bossActive && boss && bullets[i] && boss.hits(bullets[i])) {
      if (boss.takeDamage(bullets[i].damage)) {
        // Boss is defeated
        createExplosion(boss.x, boss.y, boss.color);
        
        // Add score indicator
        let pointsAwarded = boss.type === 'midBoss' ? 500 : 1000;
        scoreIndicators.push(new ScoreIndicator(boss.x, boss.y, pointsAwarded));
        
        score += pointsAwarded;
        
        // Create multiple explosions for boss death
        for (let j = 0; j < 10; j++) {
          createExplosion(
            boss.x + random(-boss.width/2, boss.width/2), 
            boss.y + random(-boss.height/2, boss.height/2), 
            boss.color
          );
        }
        
        boss = null;
        bossActive = false;
        
        // Move to next wave or win game
        currentWave++;
        if (currentWave > MAX_WAVES) {
          victory();
        } else {
          startWave(currentWave);
        }
      }
      
      // Remove bullet
      bullets.splice(i, 1);
      continue;
    }
    
    // Check bullet-enemy collision
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(enemies[j])) {
        // Apply damage to enemy - pass the bullet's damage value
        if (enemies[j].takeDamage(bullets[i].damage)) {
          // Enemy is destroyed when health reaches 0
          // Create explosion
          createExplosion(enemies[j].x, enemies[j].y, enemies[j].color);
          
          // Add score indicator
          let pointsAwarded = 10 + currentWave * 2;
          scoreIndicators.push(new ScoreIndicator(enemies[j].x, enemies[j].y, pointsAwarded));
          
          enemies.splice(j, 1);
          score += pointsAwarded; // More points in higher waves
          
          // Check if all enemies are destroyed to advance to next wave
          if (enemies.length === 0) {
            // If no more enemies, go to next wave
            currentWave++;
            if (currentWave > MAX_WAVES) {
              victory();
            } else {
              startWave(currentWave);
            }
          }
        }
        
        // Remove bullet regardless of whether enemy is destroyed
        bullets.splice(i, 1);
        break;
      }
    }
  }
  
  // Handle boss if active
  if (bossActive && boss) {
    boss.move(player.x, player.y);
    boss.show();
    
    // Boss shoots periodically
    if (frameCount % 60 === 0) {
      boss.shoot(player.x, player.y);
    }
    
    // Check if boss hits player
    if (boss.hitsPlayer(player) && !player.invincible) {
      if (player.hit()) {
        // Player has died completely
        gameOver();
        return;
      }
    }
  }
  
  // Handle enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].move(player.x, player.y);
    enemies[i].show();
    if (enemies[i].hits(player) && !player.invincible) {
      if (player.hit()) {
        // Player has died completely
        gameOver();
        return;
      } else {
        // Player was hit but survived - destroy enemy
        createExplosion(enemies[i].x, enemies[i].y, enemies[i].color);
        enemies.splice(i, 1);
        
        // Check if all enemies are destroyed to advance to next wave
        if (enemies.length === 0) {
          // If no more enemies, go to next wave
          currentWave++;
          if (currentWave > MAX_WAVES) {
            victory();
          } else {
            startWave(currentWave);
          }
        }
      }
    }
  }
  
  // Update and display explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].show();
    if (explosions[i].finished()) {
      explosions.splice(i, 1);
    }
  }
  
  // Handle powerups
  // Spawn a new powerup every 10 seconds
  if (millis() - lastPowerupTime > 10000) {
    spawnPowerup();
    lastPowerupTime = millis();
  }
  
  // Update and display powerups
  for (let i = powerups.length - 1; i >= 0; i--) {
    powerups[i].update();
    powerups[i].show();
    
    // Check if player collects powerup
    if (powerups[i].hits(player)) {
      player.applyPowerup(powerups[i].type);
      powerups.splice(i, 1);
    }
  }
  
  // Update and display score indicators
  for (let i = scoreIndicators.length - 1; i >= 0; i--) {
    scoreIndicators[i].update();
    scoreIndicators[i].show();
    if (scoreIndicators[i].finished()) {
      scoreIndicators.splice(i, 1);
    }
  }
  
  // Display UI
  drawUI();
}

function drawGameOverScreen() {
  // Game over overlay with dark transparent background
  fill(0, 0, 0, 150); // Dark semi-transparent overlay
  rect(0, 0, width, height);
  
  // Fancy header
  textSize(50);
  textAlign(CENTER, CENTER);
  
  // Shadow effect
  fill(255, 0, 0, 200);
  text(`GAME OVER`, width/2 + 3, height/2 - 40 + 3);
  
  // Main text
  fill(255);
  text(`GAME OVER`, width/2, height/2 - 40);
  
  // Score and wave display
  textSize(30);
  fill(255, 200, 0);
  text(`Final Score: ${score}`, width/2, height/2 + 10);
  fill(100, 200, 255);
  text(`Wave Reached: ${currentWave}`, width/2, height/2 + 45);
  
  // Restart button
  let btnWidth = 180;
  let btnHeight = 50;
  let btnX = width/2 - btnWidth/2;
  let btnY = height/2 + 90;
  
  // Check if mouse is over button
  let isHovered = mouseX > btnX && mouseX < btnX + btnWidth && 
                 mouseY > btnY && mouseY < btnY + btnHeight;
  
  // Draw button
  fill(isHovered ? 100 : 50, isHovered ? 255 : 200, isHovered ? 100 : 50);
  stroke(0, 100, 50);
  strokeWeight(2);
  rect(btnX, btnY, btnWidth, btnHeight, 10);
  
  // Button text
  textSize(24);
  fill(255);
  noStroke();
  text("PLAY AGAIN", width/2, btnY + btnHeight/2);
  
  textAlign(LEFT, TOP);
}

function drawHomeButton() {
  // Update hover state
  homeButton.isHovered = mouseX > homeButton.x && mouseX < homeButton.x + homeButton.width &&
                        mouseY > homeButton.y && mouseY < homeButton.y + homeButton.height;
  
  // Draw button
  fill(0, 0, 0, 150);
  stroke(homeButton.isHovered ? 255 : 100, 100, 200);
  strokeWeight(2);
  rect(homeButton.x, homeButton.y, homeButton.width, homeButton.height, 8);
  
  // Draw house icon
  noStroke();
  fill(homeButton.isHovered ? 255 : 200);
  
  // Roof
  triangle(
    homeButton.x + homeButton.width/2, homeButton.y + 8,
    homeButton.x + 10, homeButton.y + homeButton.height/2,
    homeButton.x + homeButton.width - 10, homeButton.y + homeButton.height/2
  );
  
  // House body
  rect(homeButton.x + 13, homeButton.y + homeButton.height/2, homeButton.width - 26, homeButton.height/2 - 8);
  
  // Door
  fill(0, 0, 0);
  rect(homeButton.x + homeButton.width/2 - 4, homeButton.y + homeButton.height/2 + 5, 8, homeButton.height/2 - 13);
}

function mousePressed() {
  if (currentGameState === GAME_STATE.PLAYING) {
    // Check if home button was clicked
    if (homeButton.isHovered) {
      currentGameState = GAME_STATE.HOME;
      return;
    }
    
    // Normal gameplay - shooting
    player.shoot();
  } 
  else if (currentGameState === GAME_STATE.HOME) {
    // Check if play button was clicked
    let btnWidth = 180;
    let btnHeight = 50;
    let btnX = width/2 - btnWidth/2;
    let btnY = height/2 + 100;
    
    if (mouseX > btnX && mouseX < btnX + btnWidth && 
        mouseY > btnY && mouseY < btnY + btnHeight) {
      startGame();
    }
  } 
  else if (currentGameState === GAME_STATE.GAME_OVER || currentGameState === GAME_STATE.VICTORY) {
    // Check if home button was clicked
    if (homeButton.isHovered) {
      currentGameState = GAME_STATE.HOME;
      return;
    }
    
    // Check if play again button was clicked
    let btnWidth = 180;
    let btnHeight = 50;
    let btnX = width/2 - btnWidth/2;
    let btnY = height/2 + 90;
    
    if (mouseX > btnX && mouseX < btnX + btnWidth && 
        mouseY > btnY && mouseY < btnY + btnHeight) {
      startGame();
    }
  }
}

function gameOver() {
  currentGameState = GAME_STATE.GAME_OVER;
}

function spawnEnemy() {
  // Generate random position at the edge of the screen
  let x, y;
  let margin = 50; // Distance from edge of screen
  let minDistFromPlayer = 150; // Minimum distance from player
  
  // Keep generating positions until we find one that's far enough from the player
  do {
    // Decide which edge to spawn on
    let edge = floor(random(4));
    
    switch(edge) {
      case 0: // Top edge
        x = random(margin, width - margin);
        y = margin;
        break;
      case 1: // Right edge
        x = width - margin;
        y = random(margin, height - margin);
        break;
      case 2: // Bottom edge
        x = random(margin, width - margin);
        y = height - margin;
        break;
      case 3: // Left edge
        x = margin;
        y = random(margin, height - margin);
        break;
    }
  } while (dist(x, y, player.x, player.y) < minDistFromPlayer);
  
  // Create an enemy with increased difficulty based on current wave
  let enemy = new Enemy(x, y);
  
  // Improved difficulty scaling
  // Slower speed increase in early waves
  if (currentWave <= 5) {
    enemy.speed += 0.05 * (currentWave - 1); // Small speed increase in early waves
  } else {
    // Reduced speed scaling from 0.1 to 0.08 per wave after wave 5
    enemy.speed += 0.05 * 5 + 0.08 * Math.min((currentWave - 5), 10); // Cap speed increase after wave 15
  }
  
  // Add size increase for higher waves but cap it more aggressively
  if (currentWave > 3) {
    // Reduced size scaling and capped at +8 instead of +10
    enemy.size += Math.min(1.5 + (currentWave - 3) * 0.8, 8); 
  }
  
  enemies.push(enemy);
}

// Player class
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 3;
    this.angle = 0; // Add angle for rotation
    this.powerups = []; // Track active powerups
    this.hasShield = false; // Shield powerup
    this.rapidFire = false; // Rapid fire powerup
    this.lastShotTime = 0; // For rapid fire cooldown
    this.tripleShot = false; // Triple shot powerup
    this.powerupTimers = {}; // Track when powerups expire
    this.lives = 3; // Player starts with 3 lives
    this.invincible = false; // Temporary invincibility after being hit
    this.invincibleTimer = 0; // Timer for invincibility
    this.blinkTimer = 0; // For blinking effect when invincible
    this.thrusterAnimation = 0; // For animating thrusters
    this.damageMultiplier = 1; // Base damage multiplier
    this.damageBoostActive = false; // Damage boost powerup
  }
  
  move() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.x -= this.speed; // 65 is 'A'
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.x += this.speed; // 68 is 'D'
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.y -= this.speed; // 87 is 'W'
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.y += this.speed; // 83 is 'S'
    
    // Update angle to point towards mouse
    this.angle = atan2(mouseY - this.y, mouseX - this.x);
    
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);
    
    // Update thruster animation
    this.thrusterAnimation = (this.thrusterAnimation + 0.2) % 1;
  }
  
  show() {
    // Skip drawing player every few frames when invincible (blinking effect)
    if (this.invincible) {
      this.blinkTimer++;
      if (this.blinkTimer % 10 < 5) {
        return; // Skip drawing to create blink effect
      }
    }
    
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw improved spaceship
    
    // Ship body - main hull
    noStroke();
    fill(20, 100, 200); // Darker blue body
    // Main body shape
    beginShape();
    vertex(-this.size/2, -this.size/2);
    vertex(-this.size/2, this.size/2);
    vertex(this.size/2, this.size/4);
    vertex(this.size, 0);
    vertex(this.size/2, -this.size/4);
    endShape(CLOSE);
    
    // Ship details - cockpit
    fill(100, 200, 255, 200);
    ellipse(this.size/4, 0, this.size/2, this.size/3);
    
    // Wing accents
    stroke(0, 200, 255);
    strokeWeight(1);
    line(-this.size/2, -this.size/2, this.size/2, -this.size/4);
    line(-this.size/2, this.size/2, this.size/2, this.size/4);
    
    // Engine glow with animation
    noStroke();
    // Main thruster
    let thrusterSize = 5 + sin(this.thrusterAnimation * TWO_PI) * 2;
    fill(255, 150, 0, 200);
    ellipse(-this.size/2, 0, thrusterSize, thrusterSize/2);
    
    // Outer glow
    fill(255, 50, 0, 100);
    ellipse(-this.size/2 - 2, 0, thrusterSize * 1.5, thrusterSize);
    
    // Small side thrusters
    fill(255, 100, 0, 150);
    ellipse(-this.size/2, -this.size/3, 3, 2);
    ellipse(-this.size/2, this.size/3, 3, 2);
    
    // Draw shield if active
    if (this.hasShield) {
      noFill();
      stroke(100, 200, 255, 150);
      strokeWeight(2);
      // Animated pulsing shield
      let shieldSize = this.size * 2 + sin(frameCount * 0.1) * 2;
      ellipse(0, 0, shieldSize, shieldSize);
      
      // Add shield details
      for (let i = 0; i < 8; i++) {
        let ang = i * PI/4;
        let x = cos(ang) * this.size;
        let y = sin(ang) * this.size;
        stroke(100, 200, 255, 50);
        line(0, 0, x, y);
      }
    }
    
    pop();
  }
  
  applyPowerup(type) {
    // Add to active powerups list if not the extra-life type or damage-boost
    if (type !== 'extra-life' && type !== 'damage-boost' && !this.powerups.includes(type)) {
      this.powerups.push(type);
    } else if (type === 'damage-boost' && !this.powerups.includes(type)) {
      this.powerups.push(type);
    }
    
    // Set powerup effect
    switch(type) {
      case 'shield':
        this.hasShield = true;
        // Set expiry timer (20 seconds)
        this.powerupTimers[type] = millis() + 20000;
        break;
      case 'rapid-fire':
        this.rapidFire = true;
        // Set expiry timer (20 seconds)
        this.powerupTimers[type] = millis() + 20000;
        break;
      case 'triple-shot':
        this.tripleShot = true;
        // Set expiry timer (20 seconds)
        this.powerupTimers[type] = millis() + 20000;
        break;
      case 'damage-boost':
        this.damageBoostActive = true;
        // Calculate damage boost based on current wave (higher waves = more damage)
        let baseBoost = 1.5; // Base level at wave 6
        let waveScaling = 0;
        
        if (currentWave >= 6) {
          // Increase boost by 0.25 every 2 waves after wave 6
          waveScaling = Math.floor((currentWave - 6) / 2) * 0.25;
        }
        
        // Cap the maximum boost at wave 20 to 3.5x damage
        this.damageMultiplier = Math.min(baseBoost + waveScaling, 3.5);
        
        // Create a score indicator showing the damage boost
        let boostPercent = Math.round((this.damageMultiplier - 1) * 100);
        scoreIndicators.push(new ScoreIndicator(this.x, this.y - 20, `+${boostPercent}% DMG`, color(255, 50, 255)));
        
        // Set expiry timer (15 seconds)
        this.powerupTimers[type] = millis() + 15000;
        break;
      case 'extra-life':
        // Add an extra life up to max of 5
        if (this.lives < 5) {
          this.lives++;
          // Create a score indicator showing +1 LIFE
          scoreIndicators.push(new ScoreIndicator(this.x, this.y - 20, "LIFE", color(255, 50, 100)));
        } else {
          // If at max lives, give points instead
          score += 200;
          scoreIndicators.push(new ScoreIndicator(this.x, this.y - 20, 200));
        }
        break;
    }
  }
  
  updatePowerups() {
    // Check for expired powerups
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      let type = this.powerups[i];
      if (millis() > this.powerupTimers[type]) {
        // Powerup expired
        this.powerups.splice(i, 1);
        
        // Remove effect
        switch(type) {
          case 'shield':
            this.hasShield = false;
            break;
          case 'rapid-fire':
            this.rapidFire = false;
            break;
          case 'triple-shot':
            this.tripleShot = false;
            break;
          case 'damage-boost':
            this.damageBoostActive = false;
            this.damageMultiplier = 1; // Reset damage multiplier
            break;
        }
      }
    }
    
    // Update invincibility
    if (this.invincible && millis() > this.invincibleTimer) {
      this.invincible = false;
    }
  }
  
  hit() {
    // If player has shield, just remove it
    if (this.hasShield) {
      this.hasShield = false;
      // Remove shield from powerups list
      let shieldIndex = this.powerups.indexOf('shield');
      if (shieldIndex !== -1) {
        this.powerups.splice(shieldIndex, 1);
      }
      return false; // Player didn't die
    }
    
    // Otherwise, lose a life
    this.lives--;
    if (this.lives <= 0) {
      return true; // Player died completely
    }
    
    // Set temporary invincibility
    this.invincible = true;
    this.invincibleTimer = millis() + 2000; // 2 seconds of invincibility
    this.blinkTimer = 0;
    
    return false; // Player didn't die completely
  }
  
  shoot() {
    // Check cooldown for rapid fire
    let currentTime = millis();
    // Faster cooldown for both normal and rapid fire
    let cooldown = this.rapidFire ? 80 : 150; // Reduced from 150/300 for much faster shooting
    
    if (currentTime - this.lastShotTime > cooldown) {
      if (this.tripleShot) {
        // Triple shot pattern
        for (let angle = -0.3; angle <= 0.3; angle += 0.3) {
          let adjustedAngle = this.angle + angle;
          let targetX = this.x + cos(adjustedAngle) * 100;
          let targetY = this.y + sin(adjustedAngle) * 100;
          bullets.push(new Bullet(this.x, this.y, targetX, targetY));
        }
      } else {
        // Normal shot
        bullets.push(new Bullet(this.x, this.y, mouseX, mouseY));
      }
      
      this.lastShotTime = currentTime;
    }
  }
}

// Bullet class
class Bullet {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.speed = 5;
    let angle = atan2(targetY - y, targetX - x);
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed;
    this.size = 5;
    this.trail = []; // Add trail positions
    this.angle = angle; // Store bullet angle for drawing
    this.trailColor = color(0, 200, 255); // Default bullet color
    this.damage = 1; // Base damage
    
    // Set damage based on player's damage multiplier
    if (player && player.damageBoostActive) {
      this.damage = player.damageMultiplier;
      
      // Visually represent boosted damage bullets
      if (player.damageMultiplier >= 2.5) {
        this.trailColor = color(255, 50, 255); // Purple for high damage
        this.size = 7; // Larger bullets for high damage
      } else if (player.damageMultiplier >= 1.5) {
        this.trailColor = color(255, 150, 255); // Pink for medium damage
        this.size = 6; // Slightly larger bullets for medium damage
      }
    }
  }
  
  update() {
    // Store current position in trail
    this.trail.push({x: this.x, y: this.y});
    
    // Limit trail length
    if (this.trail.length > 5) {
      this.trail.shift();
    }
    
    this.x += this.vx;
    this.y += this.vy;
    
    // Occasionally add particle for enhanced trail effect
    if (random() > 0.9) {
      explosions.push(new Particle(this.x, this.y, this.trailColor));
    }
  }
  
  show() {
    // Draw enhanced trail
    noStroke();
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 50, 255);
      fill(red(this.trailColor), green(this.trailColor), blue(this.trailColor), alpha);
      let size = map(i, 0, this.trail.length, 1, this.size);
      ellipse(this.trail[i].x, this.trail[i].y, size);
    }
    
    // Draw bullet with glow effect
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw glow
    fill(red(this.trailColor), green(this.trailColor), blue(this.trailColor), 100);
    ellipse(0, 0, this.size * 2);
    
    // Draw bullet
    fill(0, 255, 255);
    ellipse(0, 0, this.size);
    
    pop();
  }
  
  offscreen() {
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
  
  hits(enemy) {
    let d = dist(this.x, this.y, enemy.x, enemy.y);
    return d < this.size + enemy.size / 2;
  }
}

// Enemy class
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(15, 25); // Random size
    this.speed = map(this.size, 15, 25, 1.8, 1.2); // Smaller enemies move faster
    this.color = color(random(200, 255), 0, random(0, 100)); // Random reddish color
    this.angle = 0;
    this.rotationSpeed = random(-0.05, 0.05); // Each enemy rotates differently
    this.vertices = floor(random(3, 6)); // Random polygon shape (3-5 sides)
    
    // Significantly reduced base health - now using even slower scaling
    // Changed from currentWave/5 to currentWave/6 to slow health scaling even more
    this.maxHealth = 1 + floor(currentWave / 6);
    
    // Cap maximum health at 2 regardless of wave (reduced from 3)
    this.maxHealth = min(this.maxHealth, 2);
    
    this.health = this.maxHealth;
    
    // Add hit effect properties
    this.isHit = false;
    this.hitTimer = 0;
  }
  
  move(targetX, targetY) {
    let angle = atan2(targetY - this.y, targetX - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
    this.angle += this.rotationSpeed; // Rotate the enemy
    
    // Update hit effect
    if (this.isHit && millis() > this.hitTimer) {
      this.isHit = false;
    }
  }
  
  takeDamage(damageAmount = 1) {
    // Apply damage based on bullet's damage value instead of fixed 1 damage
    // This will be called with bullet.damage from the collision check
    let wholeDamage = Math.floor(damageAmount);
    let fractionalDamage = damageAmount - wholeDamage;
    
    // Apply whole damage
    this.health -= wholeDamage;
    
    // Apply potential extra point of damage based on probability
    if (random() < fractionalDamage) {
      this.health -= 1;
    }
    
    // Activate hit effect
    this.isHit = true;
    this.hitTimer = millis() + 200; // Hit effect lasts for 200ms
    
    // Create a small hit effect particle - more particles for higher damage
    let particleCount = Math.min(5 + Math.floor(damageAmount * 2), 12);
    for (let i = 0; i < particleCount; i++) {
      explosions.push(new Particle(this.x, this.y, color(255, 255, 255)));
    }
    
    return this.health <= 0; // Return true if enemy should be destroyed
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw enemy as a polygon
    if (this.isHit) {
      // When hit, flash white
      fill(255);
      stroke(255);
    } else {
      fill(this.color);
      stroke(255, 255, 255, 100);
    }
    strokeWeight(1);
    beginShape();
    for (let i = 0; i < this.vertices; i++) {
      let angle = map(i, 0, this.vertices, 0, TWO_PI);
      let x = cos(angle) * this.size/2;
      let y = sin(angle) * this.size/2;
      vertex(x, y);
    }
    endShape(CLOSE);
    
    // Draw "eye" - not visible during hit flash
    if (!this.isHit) {
      fill(255, 255, 0);
      noStroke();
      circle(this.size/4, 0, this.size/4);
    }
    
    pop();
    
    // Draw health bar above enemy
    this.drawHealthBar();
  }
  
  drawHealthBar() {
    let barWidth = this.size * 1.2;
    let barHeight = 3;
    let barY = this.y - this.size/2 - 10;
    
    // Background of health bar (empty part)
    noStroke();
    fill(100, 100, 100, 150);
    rect(this.x - barWidth/2, barY, barWidth, barHeight);
    
    // Filled part of health bar
    let healthRatio = this.health / this.maxHealth;
    let healthColor;
    
    // Color coding: red when low health, yellow for medium, green for full
    if (healthRatio < 0.3) {
      healthColor = color(255, 0, 0); // Red for low health
    } else if (healthRatio < 0.6) {
      healthColor = color(255, 255, 0); // Yellow for medium health
    } else {
      healthColor = color(0, 255, 0); // Green for high health
    }
    
    fill(healthColor);
    rect(this.x - barWidth/2, barY, barWidth * healthRatio, barHeight);
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size/2 + player.size/2;
  }
}

// Create explosion at x,y position
function createExplosion(x, y, enemyColor) {
  // Add sound effect here if available
  
  // Create main explosion particles
  for (let i = 0; i < 20; i++) {
    explosions.push(new Particle(x, y, enemyColor));
  }
  
  // Add some white/yellow sparks
  for (let i = 0; i < 10; i++) {
    explosions.push(new Particle(x, y, color(255, 255, random(100, 200))));
  }
  
  // Add shockwave effect
  createShockwave(x, y);
}

function createShockwave(x, y) {
  explosions.push(new Shockwave(x, y));
}

// Particle class for explosions
class Particle {
  constructor(x, y, particleColor) {
    this.x = x;
    this.y = y;
    this.origX = x;
    this.origY = y;
    this.color = particleColor;
    this.vel = p5.Vector.random2D().mult(random(1, 3));
    this.size = random(2, 8);
    this.life = 255;
    this.decay = random(5, 10);
    this.rotation = random(TWO_PI);
    this.rotationSpeed = random(-0.2, 0.2);
  }
  
  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;
    this.life -= this.decay;
    this.rotation += this.rotationSpeed;
    
    // Add slight movement variation
    this.vel.x += random(-0.1, 0.1);
    this.vel.y += random(-0.1, 0.1);
  }
  
  show() {
    if (this.life > 0) {
      push();
      translate(this.x, this.y);
      rotate(this.rotation);
      
      noStroke();
      
      // Draw particle glow
      let glowSize = this.size * 2;
      fill(red(this.color), green(this.color), blue(this.color), this.life * 0.3);
      ellipse(0, 0, glowSize);
      
      // Draw particle
      fill(red(this.color), green(this.color), blue(this.color), this.life);
      
      // Use different shapes randomly
      if (random() > 0.7) {
        ellipse(0, 0, this.size);
      } else {
        rect(-this.size/2, -this.size/2, this.size, this.size);
      }
      
      pop();
    }
  }
  
  finished() {
    return this.life <= 0;
  }
}

// Shockwave effect for explosions
class Shockwave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 5;
    this.maxSize = random(30, 50);
    this.speed = random(1, 2);
    this.life = 255;
  }
  
  update() {
    this.size += this.speed;
    this.life -= 10;
  }
  
  show() {
    if (this.life > 0) {
      noFill();
      stroke(255, this.life);
      strokeWeight(2);
      ellipse(this.x, this.y, this.size);
    }
  }
  
  finished() {
    return this.size > this.maxSize || this.life <= 0;
  }
}

function drawUI() {
  // Display score and wave info at top
  drawInfoPanel();
  
  // Display game title in the center top
  textAlign(CENTER);
  textSize(24);
  fill(0, 150, 255);
  stroke(0);
  strokeWeight(1);
  text("COSMIC DEFENDER", width/2, 25);
  textAlign(LEFT, TOP);
  strokeWeight(1);
  
  // Display active powerups with icons
  if (player.powerups.length > 0) {
    drawPowerupIcons();
  }
  
  // Draw HUD at bottom
  drawHUD();
}

function drawInfoPanel() {
  // Create a translucent panel for score and wave
  fill(0, 0, 0, 180);
  stroke(0, 150, 255, 100);
  strokeWeight(1);
  rect(85, 5, 180, 35, 5); // Left panel for other game info if needed
  rect(width - 185, 5, 180, 85, 5); // Increased height for wave, score, AND progress bar with more spacing
  
  // Wave indicator in top right
  fill(200, 230, 255);
  textAlign(RIGHT);
  text(`Wave: ${currentWave}/${MAX_WAVES}`, width - 15, 22);
  
  // Score text now appears below wave number in the same panel
  textSize(18);
  fill(255, 255, 100); // Changed to yellow for better distinction
  text(`Score: ${score}`, width - 15, 47);
  
  // Draw wave progress bar - now placed further below the score text
  let progressWidth = 100;
  let progressHeight = 5;
  let progressX = width - 15 - progressWidth;
  let progressY = 70; // Moved lower to be clearly underneath the score
  
  // Background bar
  fill(50, 50, 80);
  rect(progressX, progressY, progressWidth, progressHeight, 3);
  
  // Progress fill
  let completion = currentWave / MAX_WAVES;
  fill(0, 150, 255);
  rect(progressX, progressY, progressWidth * completion, progressHeight, 3);
  
  textAlign(LEFT);
}

function drawPowerupIcons() {
  // Moved starting Y position to be below the home button (40px height + 30px Y position + 10px spacing)
  let startX = 15;
  let y = 85; // Increased from 55 to 85 to move below home button
  let iconSize = 15;
  let spacing = 25;
  
  for (let i = 0; i < player.powerups.length; i++) {
    let type = player.powerups[i];
    let x = startX + i * spacing;
    
    // Draw icon background
    fill(0, 0, 30, 180);
    stroke(getPowerupColor(type));
    strokeWeight(1);
    rect(x - 5, y - 5, iconSize + 10, iconSize + 10, 3);
    
    // Draw icon
    noStroke();
    fill(getPowerupColor(type));
    
    // Draw different shape based on powerup type
    if (type === 'shield') {
      ellipse(x + iconSize/2, y + iconSize/2, iconSize);
    } else if (type === 'rapid-fire') {
      rect(x, y, iconSize, iconSize);
    } else if (type === 'triple-shot') {
      triangle(
        x + iconSize/2, y,
        x, y + iconSize,
        x + iconSize, y + iconSize
      );
    }
    
    // Draw timer
    let timeLeft = Math.ceil((player.powerupTimers[type] - millis()) / 1000);
    textSize(10);
    fill(255);
    text(timeLeft + "s", x + iconSize + 5, y + iconSize/2 + 3);
  }
}

function getPowerupColor(type) {
  switch(type) {
    case 'shield':
      return color(100, 200, 255); // Blue
    case 'rapid-fire':
      return color(255, 100, 0); // Orange
    case 'triple-shot':
      return color(0, 255, 0); // Green
    case 'damage-boost':
      return color(255, 50, 255); // Purple
  }
}

function drawHUD() {
  // Draw lives
  fill(255);
  textSize(16);
  text("LIVES:", 15, height - 25);
  
  // Draw life icons with improved style
  for (let i = 0; i < player.lives; i++) {
    let x = 75 + i * 30;
    let y = height - 25;
    
    // Ship icon for lives
    push();
    translate(x, y);
    
    // Ship body
    fill(0, 150, 255);
    stroke(0, 200, 255);
    strokeWeight(1);
    beginShape();
    vertex(-8, -5);
    vertex(-8, 5);
    vertex(0, 3);
    vertex(8, 0);
    vertex(0, -3);
    endShape(CLOSE);
    
    // Thruster glow
    noStroke();
    fill(255, 100, 0, 150);
    ellipse(-8, 0, 4, 2);
    
    pop();
  }
  
  // Draw center divider with improved style
  stroke(0, 150, 255, 100);
  line(width/2, height - 42, width/2, height - 3);
  noStroke();
  
  // Draw weapon status on right side
  let weaponType = player.tripleShot ? "TRIPLE SHOT" : "SINGLE SHOT";
  let fireRate = player.rapidFire ? "RAPID" : "NORMAL";
  
  textAlign(RIGHT);
  fill(200);
  textSize(12);
  text(`WEAPON: ${weaponType}`, width - 15, height - 30);
  text(`FIRE RATE: ${fireRate}`, width - 15, height - 15);
  
  // Display damage multiplier if active
  if (player.damageBoostActive) {
    let dmgPercent = Math.round((player.damageMultiplier - 1) * 100);
    fill(255, 100, 255);
    text(`DAMAGE: +${dmgPercent}%`, width - 15, height - 45);
  }
  
  // Draw instructions
  fill(150);
  textSize(12);
  textAlign(CENTER);
  text("CONTROLS: ARROW KEYS - MOVE | MOUSE - AIM | CLICK - SHOOT", width/2, height - 15);
  
  // Reset alignment
  textAlign(LEFT, TOP);
}

// Powerup class
class Powerup {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 15;
    this.angle = 0;
    this.types = ['shield', 'rapid-fire', 'triple-shot', 'extra-life'];
    
    // Add damage-boost to possible powerups after wave 5
    if (currentWave >= 6) {
      this.types.push('damage-boost');
    }
    
    // Make certain powerups rarer
    if (random() < 0.2) {
      this.type = 'extra-life'; // 20% chance for extra life
    } else if (currentWave >= 6 && random() < 0.35) {
      this.type = 'damage-boost'; // 35% chance for damage boost (only from wave 6+)
    } else {
      // Choose from the other types
      this.type = random(['shield', 'rapid-fire', 'triple-shot']);
    }
    
    this.color = this.getColor();
  }
  
  getColor() {
    switch(this.type) {
      case 'shield':
        return color(100, 200, 255); // Blue
      case 'rapid-fire':
        return color(255, 100, 0); // Orange
      case 'triple-shot':
        return color(0, 255, 0); // Green
      case 'extra-life':
        return color(255, 50, 100); // Pink/Red for life
      case 'damage-boost':
        return color(255, 50, 255); // Purple for damage boost
    }
  }
  
  update() {
    this.angle += 0.05; // Rotate the powerup
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw powerup
    fill(this.color);
    stroke(255);
    strokeWeight(2);
    
    // Draw shape based on type
    if (this.type === 'shield') {
      circle(0, 0, this.size);
    } else if (this.type === 'rapid-fire') {
      rect(-this.size/2, -this.size/2, this.size, this.size);
    } else if (this.type === 'triple-shot') {
      triangle(0, -this.size/2, -this.size/2, this.size/2, this.size/2, this.size/2);
    } else if (this.type === 'extra-life') {
      // Heart shape for extra life
      beginShape();
      // Left half of heart
      vertex(0, this.size/2);
      bezierVertex(-this.size/2, 0, -this.size/2, -this.size/2, 0, -this.size/2);
      // Right half of heart
      bezierVertex(this.size/2, -this.size/2, this.size/2, 0, 0, this.size/2);
      endShape(CLOSE);
    } else if (this.type === 'damage-boost') {
      // Star shape for damage boost
      let outerRadius = this.size/2;
      let innerRadius = this.size/4;
      let numPoints = 5;
      
      beginShape();
      for (let i = 0; i < numPoints * 2; i++) {
        let radius = i % 2 === 0 ? outerRadius : innerRadius;
        let angle = TWO_PI / (numPoints * 2) * i - HALF_PI;
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
    
    // Glowing effect
    noFill();
    stroke(this.color);
    strokeWeight(1);
    circle(0, 0, this.size * 1.5);
    
    pop();
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size/2 + player.size/2;
  }
}

function spawnPowerup() {
  let x = random(50, width - 50);
  let y = random(50, height - 50);
  powerups.push(new Powerup(x, y));
}

// Score indicator class
class ScoreIndicator {
  constructor(x, y, points, customColor) {
    this.x = x;
    this.y = y;
    this.points = points;
    this.isText = typeof points === 'string'; // Check if points is a text string
    this.lifespan = 255;
    this.velocity = createVector(0, -1.5); // Move upward
    this.scale = 1;
    this.maxScale = 1.5;
    this.growing = true;
    this.color = customColor || color(255, 255, 0); // Default yellow or use custom color
  }
  
  update() {
    this.y += this.velocity.y;
    this.lifespan -= 5;
    
    // Add a bounce/pop effect
    if (this.growing) {
      this.scale += 0.05;
      if (this.scale >= this.maxScale) {
        this.growing = false;
      }
    } else {
      this.scale -= 0.03;
      if (this.scale <= 1) {
        this.scale = 1;
        this.growing = false;
      }
    }
  }
  
  show() {
    textAlign(CENTER);
    textSize(16 * this.scale);
    
    // Draw text shadow for depth
    fill(0, 0, 0, this.lifespan * 0.6);
    if (this.isText) {
      text(`+1 ${this.points}`, this.x + 2, this.y + 2);
    } else {
      text(`+${this.points}`, this.x + 2, this.y + 2);
    }
    
    // Draw main text
    fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
    stroke(0, 0, 0, this.lifespan * 0.8);
    strokeWeight(2);
    if (this.isText) {
      text(`+1 ${this.points}`, this.x, this.y);
    } else {
      text(`+${this.points}`, this.x, this.y);
    }
    
    textAlign(LEFT, TOP); // Reset alignment
    strokeWeight(1);
  }
  
  finished() {
    return this.lifespan <= 0;
  }
}

function spawnBoss(waveNum) {
  let bossType = waveNum === 10 ? 'midBoss' : 'finalBoss';
  boss = new Boss(width/2, 50, bossType);
}

function drawVictoryScreen() {
  // Victory overlay with animated background
  fill(0, 0, 0, 100);
  rect(0, 0, width, height);
  
  // Additional star effects for victory screen
  for (let i = 0; i < 5; i++) {
    fill(random(100, 255), random(100, 255), random(100, 255), random(100, 200));
    let size = random(2, 5);
    ellipse(random(width), random(height), size);
  }
  
  // Victory header with glow effect
  textSize(60);
  textAlign(CENTER, CENTER);
  
  // Glow effect
  fill(100, 200, 255, 150);
  text(`VICTORY!`, width/2 + 3, height/3 - 40 + 3);
  
  // Main text
  fill(255, 255, 100);
  text(`VICTORY!`, width/2, height/3 - 40);
  
  // Congratulations text
  textSize(24);
  fill(255);
  text(`You've defeated all enemies and saved the galaxy!`, width/2, height/2 - 20);
  
  // Score display
  textSize(30);
  fill(255, 200, 0);
  text(`Final Score: ${score}`, width/2, height/2 + 30);
  
  // Play again button
  let btnWidth = 180;
  let btnHeight = 50;
  let btnX = width/2 - btnWidth/2;
  let btnY = height/2 + 90;
  
  // Check if mouse is over button
  let isHovered = mouseX > btnX && mouseX < btnX + btnWidth && 
                 mouseY > btnY && mouseY < btnY + btnHeight;
  
  // Draw button
  fill(isHovered ? 0 : 50, isHovered ? 200 : 150, isHovered ? 255 : 200);
  stroke(0, 100, 255);
  strokeWeight(2);
  rect(btnX, btnY, btnWidth, btnHeight, 10);
  
  // Button text
  textSize(24);
  fill(255);
  noStroke();
  text("PLAY AGAIN", width/2, btnY + btnHeight/2);
  
  textAlign(LEFT, TOP);
}

function victory() {
  currentGameState = GAME_STATE.VICTORY;
}

// Boss class
class Boss {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 'midBoss' or 'finalBoss'
    
    // Set boss properties based on type
    if (type === 'midBoss') {
      this.width = 80;
      this.height = 60;
      this.maxHealth = 30;
      this.color = color(255, 0, 100);
      this.speed = 0.8;
    } else {
      this.width = 120;
      this.height = 80;
      this.maxHealth = 50;
      this.color = color(255, 50, 0);
      this.speed = 0.6;
    }
    
    this.health = this.maxHealth;
    this.angle = 0;
    this.bullets = [];
    
    // Hit effect
    this.isHit = false;
    this.hitTimer = 0;
  }
  
  move(playerX, playerY) {
    // Boss moves back and forth at the top of the screen
    this.x += Math.sin(frameCount * 0.02) * this.speed;
    
    // Occasionally move toward player
    if (frameCount % 180 === 0) {
      // Move toward player briefly
      this.y += this.speed * 2;
    }
    
    // Keep boss in bounds
    this.x = constrain(this.x, this.width/2, width - this.width/2);
    this.y = constrain(this.y, this.height/2, height/3);
    
    // Update boss bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update();
      this.bullets[i].show();
      
      // Check if bullets hit player
      if (this.bullets[i].hits(player) && !player.invincible) {
        if (player.hit()) {
          gameOver();
          return;
        }
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Remove offscreen bullets
      if (this.bullets[i].offscreen()) {
        this.bullets.splice(i, 1);
      }
    }
    
    // Update hit effect
    if (this.isHit && millis() > this.hitTimer) {
      this.isHit = false;
    }
  }
  
  show() {
    push();
    translate(this.x, this.y);
    
    // Boss body
    if (this.isHit) {
      fill(255); // Flash white when hit
    } else {
      fill(this.color);
    }
    
    stroke(255, 255, 255, 150);
    strokeWeight(2);
    
    // Draw different boss shapes based on type
    if (this.type === 'midBoss') {
      // Mid-boss shape
      beginShape();
      vertex(-this.width/2, -this.height/3);
      vertex(-this.width/3, -this.height/2);
      vertex(this.width/3, -this.height/2);
      vertex(this.width/2, -this.height/3);
      vertex(this.width/2, this.height/3);
      vertex(this.width/3, this.height/2);
      vertex(-this.width/3, this.height/2);
      vertex(-this.width/2, this.height/3);
      endShape(CLOSE);
      
      // Details
      if (!this.isHit) {
        // Eyes
        fill(255, 255, 0);
        ellipse(-this.width/5, 0, 10, 10);
        ellipse(this.width/5, 0, 10, 10);
        
        // Mouth
        stroke(255, 0, 0);
        line(-this.width/4, this.height/4, this.width/4, this.height/4);
      }
    } else {
      // Final boss - more complex shape
      beginShape();
      vertex(-this.width/2, -this.height/4);
      vertex(-this.width/3, -this.height/2);
      vertex(this.width/3, -this.height/2);
      vertex(this.width/2, -this.height/4);
      vertex(this.width/2, this.height/4);
      vertex(this.width/3, this.height/2);
      vertex(-this.width/3, this.height/2);
      vertex(-this.width/2, this.height/4);
      endShape(CLOSE);
      
      // Additional wings
      beginShape();
      vertex(-this.width/2, -this.height/4);
      vertex(-this.width - 10, 0);
      vertex(-this.width/2, this.height/4);
      endShape(CLOSE);
      
      beginShape();
      vertex(this.width/2, -this.height/4);
      vertex(this.width + 10, 0);
      vertex(this.width/2, this.height/4);
      endShape(CLOSE);
      
      // Details
      if (!this.isHit) {
        // Eyes
        fill(255, 0, 0);
        ellipse(-this.width/5, 0, 15, 10);
        ellipse(this.width/5, 0, 15, 10);
        
        // Center core
        fill(0, 255, 255);
        ellipse(0, 0, 20, 20);
      }
    }
    
    pop();
    
    // Draw health bar
    this.drawHealthBar();
  }
  
  drawHealthBar() {
    let barWidth = this.width * 1.2;
    let barHeight = 8;
    let barY = this.y - this.height/2 - 15;
    
    // Background of health bar
    noStroke();
    fill(100, 100, 100, 150);
    rect(this.x - barWidth/2, barY, barWidth, barHeight);
    
    // Filled part of health bar
    let healthRatio = this.health / this.maxHealth;
    
    // Color based on health
    let healthColor;
    if (healthRatio < 0.3) {
      healthColor = color(255, 0, 0);
    } else if (healthRatio < 0.6) {
      healthColor = color(255, 150, 0);
    } else {
      healthColor = color(0, 255, 0);
    }
    
    fill(healthColor);
    rect(this.x - barWidth/2, barY, barWidth * healthRatio, barHeight);
    
    // Boss health text
    fill(255);
    textAlign(CENTER);
    textSize(10);
    text(`${this.health}/${this.maxHealth}`, this.x, barY - 5);
    textAlign(LEFT, TOP);
  }
  
  takeDamage(damageAmount = 1) {
    // Apply damage based on bullet's damage value
    let wholeDamage = Math.floor(damageAmount);
    let fractionalDamage = damageAmount - wholeDamage;
    
    // Apply whole damage
    this.health -= wholeDamage;
    
    // Apply potential extra point of damage based on probability
    if (random() < fractionalDamage) {
      this.health -= 1;
    }
    
    // Activate hit effect
    this.isHit = true;
    this.hitTimer = millis() + 200;
    
    // Create hit particles - more for higher damage
    let particleCount = Math.min(3 + Math.floor(damageAmount), 8);
    for (let i = 0; i < particleCount; i++) {
      explosions.push(new Particle(
        this.x + random(-this.width/4, this.width/4), 
        this.y + random(-this.height/4, this.height/4), 
        color(255, 255, 255)
      ));
    }
    
    return this.health <= 0;
  }
  
  shoot(playerX, playerY) {
    // Fire pattern based on boss type
    if (this.type === 'midBoss') {
      // 3-way shot for mid boss
      for (let i = -1; i <= 1; i++) {
        let angle = atan2(playerY - this.y, playerX - this.x) + i * 0.3;
        let bx = this.x + cos(angle) * 30;
        let by = this.y + sin(angle) * 30;
        this.bullets.push(new BossBullet(bx, by, angle));
      }
    } else {
      // 5-way shot for final boss
      for (let i = -2; i <= 2; i++) {
        let angle = atan2(playerY - this.y, playerX - this.x) + i * 0.25;
        let bx = this.x + cos(angle) * 30;
        let by = this.y + sin(angle) * 30;
        this.bullets.push(new BossBullet(bx, by, angle));
      }
      
      // Add an extra bullet every few seconds
      if (frameCount % 180 === 0) {
        // Circle pattern
        for (let i = 0; i < 8; i++) {
          let angle = i * PI/4;
          let bx = this.x + cos(angle) * 30;
          let by = this.y + sin(angle) * 30;
          this.bullets.push(new BossBullet(bx, by, angle));
        }
      }
    }
  }
  
  hits(bullet) {
    return (bullet.x > this.x - this.width/2 &&
            bullet.x < this.x + this.width/2 &&
            bullet.y > this.y - this.height/2 &&
            bullet.y < this.y + this.height/2);
  }
  
  hitsPlayer(player) {
    return (
      player.x > this.x - this.width/2 - player.size/2 &&
      player.x < this.x + this.width/2 + player.size/2 &&
      player.y > this.y - this.height/2 - player.size/2 &&
      player.y < this.y + this.height/2 + player.size/2
    );
  }
}

// Boss bullet class
class BossBullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.angle = angle;
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed;
    this.size = 8;
    this.color = color(255, 0, 0);
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Draw bullet
    fill(this.color);
    noStroke();
    
    // Draw enemy bullet as a diamond shape
    beginShape();
    vertex(-this.size/2, 0);
    vertex(0, -this.size/2);
    vertex(this.size/2, 0);
    vertex(0, this.size/2);
    endShape(CLOSE);
    
    // Add glow effect
    fill(255, 100, 100, 100);
    ellipse(0, 0, this.size * 1.5);
    
    pop();
  }
  
  offscreen() {
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
  
  hits(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size/2 + player.size/2;
  }
}
