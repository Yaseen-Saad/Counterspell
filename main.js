  // Set up canvas
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to the window size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Define the horizontal path for the characters
  const pathY = canvas.height / 2;  // Y-coordinate of the horizontal path
  
  // Define player and shadow
  const player = {
      x: 100,
      y: pathY,
      width: 50,
      height: 50,
      speed: 5,
      color: 'blue',
      dx: 0,
      dy: 0,
      gravity: 0.8,
      jumpStrength: -15,
      isJumping: false,
      jumpHeight: 0,
      image: new Image()
  };
  player.image.src = 'stickman-running.gif';  // Set player image source
  
  const shadow = {
      x: player.x - 100,  // Start behind the player by 100px
      y: pathY,
      width: 50,
      height: 50,
      speed: 4.2,  // Shadow speed slightly below the player's speed
      color: 'red',
      dx: 0,  // Direction is controlled based on player's movement
      dy: 0,
      gravity: 0.8,
      jumpStrength: -12,
      isJumping: false,
      jumpHeight: 0,
      image: new Image()
  };
  shadow.image.src = '+a3kTl.gif';  // Set shadow image source
  
  // Obstacles (initial set)
  let obstacles = [
      { x: 300, y: pathY - 50, width: 50, height: 100, image: new Image() },
      { x: 500, y: pathY - 50, width: 50, height: 100, image: new Image() },
      { x: 700, y: pathY - 50, width: 50, height: 100, image: new Image() },
      { x: 900, y: pathY - 50, width: 50, height: 100, image: new Image() },
      { x: 1100, y: pathY - 50, width: 50, height: 100, image: new Image() }
  ];
  
  // Set obstacle images source
  obstacles.forEach(obstacle => {
      obstacle.image.src = 'obstacle.gif';
  });
  
  // Key event listeners
  document.addEventListener('keydown', movePlayer);
  document.addEventListener('keyup', stopPlayer);
  
  // Handle player movement
  function movePlayer(e) {
      if (e.key === 'ArrowUp' && !player.isJumping) jump(player);  // Jump for player
      if (e.key === 'ArrowDown' && player.y < pathY + player.height) player.dy = player.speed;  // Prevent going below the path
      if (e.key === 'ArrowLeft') {
          player.dx = -player.speed;
      }
      if (e.key === 'ArrowRight') {
          player.dx = player.speed;
      }
  }
  
  function stopPlayer(e) {
      if (e.key === 'ArrowDown') player.dy = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
  }
  
  // Jump function
  function jump(character) {
      character.dy = character.jumpStrength;  // Set initial jump velocity
      character.isJumping = true;
  }
  
  // Update the game (called on each frame)
  function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Move player
      player.x += player.dx;
      player.y += player.dy;
  
      // Check for collision with obstacles and prevent penetration
      obstacles.forEach(obstacle => {
          if (checkCollision(player, obstacle)) {
              if (player.dy > 0) {  // Falling down onto the obstacle
                  player.y = obstacle.y - player.height;
                  player.dy = 0;
                  player.isJumping = false;
              } else if (player.dx > 0) {  // Moving right
                  player.x = obstacle.x - player.width;
              } else if (player.dx < 0) {  // Moving left
                  player.x = obstacle.x + obstacle.width;
              }
          }
      });
  
      // Apply gravity and update vertical position for both player and shadow
      applyGravity(player);
      applyGravity(shadow);
  
      // Move shadow always forward
      shadow.dx = shadow.speed;
      shadow.x += shadow.dx;
  
      // Update camera position to follow the player
      const cameraX = -player.x + canvas.width / 2;
  
      // Draw player and shadow (adjust for camera position)
      ctx.save();
      ctx.translate(cameraX, 0);
  
      // Draw player
      if (player.image.complete && player.image.naturalWidth !== 0) {
          ctx.drawImage(player.image, player.x, player.y, player.width, player.height);
      } else {
          ctx.fillStyle = player.color;
          ctx.fillRect(player.x, player.y, player.width, player.height);
      }
  
      // Draw shadow
      if (shadow.image.complete && shadow.image.naturalWidth !== 0) {
          ctx.drawImage(shadow.image, shadow.x, shadow.y, shadow.width, shadow.height);
      } else {
          ctx.fillStyle = shadow.color;
          ctx.fillRect(shadow.x, shadow.y, shadow.width, shadow.height);
      }
  
      // Draw obstacles
      obstacles.forEach(obstacle => {
          if (obstacle.image.complete && obstacle.image.naturalWidth !== 0) {
              ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          } else {
              ctx.fillStyle = 'green';
              ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          }
      });
  
      ctx.restore();
  
      // Check for collision with the shadow (Game Over if shadow reaches player's x position)
      if (shadow.x >= player.x) {
          alert('Game Over! The shadow caught you!');
          resetGame();
      }
  
      // Spawn new obstacles as the player moves forward
      if (player.x > obstacles[obstacles.length - 1].x - 200) {
          spawnObstacle();
      }
  
      requestAnimationFrame(update);
  }
  
  // Collision detection function for player vs. other objects
  function checkCollision(rect1, rect2) {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
  }
  
  // Function to apply gravity to a character (player or shadow)
  function applyGravity(character) {
      character.y += character.dy;
      character.dy += character.gravity;  // Simulate gravity by increasing downward velocity
  
      // If the character has landed back on the path, stop the jump
      if (character.y >= pathY) {
          character.y = pathY;
          character.dy = 0;
          character.isJumping = false;
      }
  }
  
  // Reset game function (reset positions and obstacles)
  function resetGame() {
      player.x = 100;
      player.y = pathY;
      shadow.x = player.x - shadow.distanceBehind;  // Shadow starts behind the player again
      shadow.y = pathY;  // Shadow stays on the path
      shadow.speed = 4.8;
  
      // Reset obstacles to initial set
      obstacles = [
          { x: 300, y: pathY - 50, width: 50, height: 100, image: new Image() },
          { x: 500, y: pathY - 50, width: 50, height: 100, image: new Image() },
          { x: 700, y: pathY - 50, width: 50, height: 100, image: new Image() },
          { x: 900, y: pathY - 50, width: 50, height: 100, image: new Image() },
          { x: 1100, y: pathY - 50, width: 50, height: 100, image: new Image() }
      ];
  
      // Set obstacle images source
      obstacles.forEach(obstacle => {
          obstacle.image.src = 'obstacle.png';
      });
  }
  
  // Function to spawn a new obstacle ahead of the player
  function spawnObstacle() {
      const x = obstacles[obstacles.length - 1].x + 100 + Math.random() * 200;  // Randomize x distance between obstacles
      const y = pathY - 50 - Math.random() * 100;  // Randomize y position within a range above the horizontal line
      const newObstacle = { x, y, width: 50, height: 100, image: new Image() };
      newObstacle.image.src = 'obstacle.png';
      obstacles.push(newObstacle);
  }
  
  // Start the game
  update();
