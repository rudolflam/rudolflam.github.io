// Initialize Phaser
var screenWidth = 400;
var screenHeight = 490;
var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'gameDiv');

var player;
var platform;
var bullet;
var score;

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() {
        // This function will be executed at the beginning
        // That's where we load the game's assets

      game.stage.backgroundColor = '#85b5e1';

	    game.load.image('player', 'sprites/tyrunnersaurusrex.png');
    	game.load.image('platform', 'sprites/platform.png');
    	game.load.image('bullet', 'sprites/bullet.png');
	    game.load.image('cactus', 'sprites/cactus.png');
      game.load.image('pterodactyl', 'sprites/pterodactyl.png');
      game.load.audio('boom', ['assets/explode.mp3']);

    },

    create: function() {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.
        this.player = game.add.sprite(50, 50, 'player');
        this.bullet = game.add.sprite(this.player.x, this.player.y, 'bullet');
        this.bullet.exists = false;
        this.bullet.alive = false;
        game.physics.arcade.enable(this.player);
        this.gameOver = false;

        this.player.body.collideWorldBounds = true;
        this.player.body.gravity.y = 500;

        this.cacti = game.add.group(); // Create group of cacti
        this.cacti.enableBody = true; //Adds physics to group
        this.cacti.createMultiple(10, 'cactus'); // Add 20 cacti in group
        this.cactiTimer = game.time.events.loop(500, this.randomlyAddCactus, this);

        this.pterodactyls = game.add.group();
        this.pterodactyls.enableBody = true;
        this.pterodactyls.createMultiple(2, 'pterodactyl');
        this.pterodactylTimer = game.time.events.loop(6500, this.addPterodactly, this);

        this.boom = game.add.audio('boom');

        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        spaceKey.onDown.add(this.jump, this);

        var leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        leftKey.onDown.add(this.left, this);

        var rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        rightKey.onDown.add(this.right, this);

        var shootKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        shootKey.onDown.add(this.shoot, this);

        this.score = 0;
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });
        this.gameOver1 = game.add.text(20, 150, "GAME OVER", { font: "50px Arial", fill: "#ffffff", align: "center" });
        this.gameOver2 = game.add.text(20, 210, "Press space to restart.", { font: "20px Arial", fill: "#ffffff", align: "center" });
        this.gameOver1.anchor.set(0.5);
        this.gameOver2.anchor.set(0.5);
        this.gameOver1.x = Math.floor(screenWidth/2);
    		this.gameOver2.x = Math.floor(screenWidth/2);
        this.gameOver1.y = Math.floor(screenHeight/2);
    		this.gameOver2.y = Math.floor(screenHeight/2 + 50);
        this.gameOver1.visible = false;
        this.gameOver2.visible = false;
    },



    update: function() {
        // This function is called 60 times per second
        // It contains the game's logic
        //game.physics.arcade.overlap(this.bullet, this.cacti, this.collisionHandler, null, this);
        game.physics.arcade.overlap(this.bullet, this.pterodactyls, this.collisionHandler, null, this);
        game.physics.arcade.overlap(this.player, this.pterodactyls, this.endGame, null, this);
        game.physics.arcade.overlap(this.player, this.cacti, this.endGame, null, this);

    },

    jump: function() {
    	if (this.player.body.onFloor() || this.player.body.touching.down) {
        this.player.body.velocity.y = -300;
    	}
    },

    left: function() {
      this.player.x -= 30;
    },

    right: function() {
      this.player.x += 30;
    },

    shoot: function() {
        if(!this.bullet.exists){
        	this.bullet = game.add.sprite(this.player.x, this.player.y, 'bullet');
            game.physics.arcade.enable(this.bullet);
            this.bullet.checkWorldBounds = true;
            this.bullet.outOfBoundsKill = true;
            this.bullet.body.gravity.y = 0;
        	this.bullet.body.velocity.x = 300;
        }
    },

    addCactus: function() {
      if (!this.gameOver) {
      	var cactus = this.cacti.getFirstDead();
      	cactus.reset(400, 445);
       	cactus.body.velocity.x = -200;
      	cactus.checkWorldBounds = true;
      	cactus.outOfBoundsKill = true;
      }
    },

    addPterodactly: function() {
      if (!this.gameOver) {
        var pterodactyl = this.pterodactyls.getFirstDead();
        var min = 400;
        var max = 460;
        var randomY = Math.floor(Math.random() * (max - min + 1)) + min;
        pterodactyl.reset(400, randomY);
        pterodactyl.body.velocity.x = -300;
        pterodactyl.checkWorldBounds = true;
        pterodactyl.outOfBoundsKill = true;
      }
    },

    endGame: function(player, killer) {
      this.gameOver = true;
      this.cacti.forEachAlive(function(cactus) {
        cactus.body.velocity.x = 0;
      },this);
      this.gameOver1.visible = true;
      this.gameOver2.visible = true;
      killer.body.velocity.x = 0;
      this.player.body.velocity.x = 0;
      var k = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
      k.onDown.add(this.restartGame, this);
    },

    restartGame: function() {
        this.gameOver1.visible = false;
        this.gameOver2.visible = false;
        game.state.start('main');
    },

    collisionHandler: function(sprite, spriteInGroup){
        sprite.kill();
        spriteInGroup.kill();
        this.score += 1;
        this.labelScore.text = this.score;
        this.boom.play();
    },

    randomlyAddCactus: function() {
      game.time.events.add(Phaser.Timer.SECOND * (Math.random()*10) + 1, this.addCactus, this);
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');
