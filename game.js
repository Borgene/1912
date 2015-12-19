var game = new Phaser.Game(960, 540, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });

        function preload () {
            game.load.image('logo', 'phaser.png');
            game.load.image('diamond', 'diamond.png');
            game.load.image('firstaid', 'firstaid.png');
            game.load.image('ground', 'platform.png');
            game.load.image('sky', 'sky.png');
            game.load.image('star', 'star.png');
            game.load.image('square', 'square.png');
            game.load.image('enemy', 'enemy.png');
            game.load.image('bg', 'background.png');
            game.load.image('dot', 'blackdot.png');
            game.load.spritesheet('dude', 'dude.png', 32, 48);
            game.load.spritesheet('baddie', 'baddie.png', 32, 32);
        }

var platforms;
var player;
var stars;
var cursors;
var bullets;
var pausedText;
var enemies;
var enemyHealthText;
var bullet
var nextFire = 0;
var nextHit = 0;
var playerCollisionGroup;
var enemyCollisionGroup;
var ledgeCollisionGroup;
var bulletsCollisionGroup;

   // STATS //
var playerFireRate = 100;
var playerRange = 2000;
var playerSpeed = 150;
var playerDamage = 1;
var bulletSpeed = 400;
var invincibleTime = 1000;
var health = 8;
   // END STATS //

        function create () {
            
            game.world.setBounds(0, 0, 960, 540);
            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.restitution = 0.5;
            game.physics.p2.setImpactEvents(true);
            game.add.sprite(0,0,'bg');
            game.physics.p2.setImpactEvents(true);
            
            playerCollisionGroup = game.physics.p2.createCollisionGroup();
            enemyCollisionGroup = game.physics.p2.createCollisionGroup();
            ledgeCollisionGroup = game.physics.p2.createCollisionGroup();
            bulletsCollisionGroup = game.physics.p2.createCollisionGroup();
            game.physics.p2.updateBoundsCollisionGroup();
            
            
            platforms = game.add.group();
            bullets = game.add.group();
            enemies = game.add.group();
            
            var createLedge = function(x,y,w,h){
                var ledge = platforms.create(x,y,'dot');
                ledge.scale.setTo(w,h);
                game.physics.p2.enable(ledge, false);
                ledge.body.static = true;
                ledge.body.setCollisionGroup(ledgeCollisionGroup);
                ledge.body.collides(enemyCollisionGroup);
                ledge.body.collides(playerCollisionGroup);
                ledge.body.collides(bulletsCollisionGroup);
                
            }
            
            createLedge(300,100,100,30);
            createLedge(400,400,200,30);
            createLedge(100,200,200,30);
            createLedge(15,game.world.height/2,30,540);
            createLedge(game.world.width/2,15,game.world.width,30);
            createLedge(game.world.width-15,game.world.height/2,30,540);
            createLedge(game.world.width/2,game.world.height-15,game.world.width,30);
            
            
            
            createEnemy1(200,300,5,150);
            createEnemy1(250,300,5,150);
            createEnemy1(600,400,5,150);
            createEnemy1(800,300,5,150);
            
           
            player = game.add.sprite(50,50, 'square');
            game.physics.p2.enable(player, false);
            player.body.fixedRotation = true;
            player.body.damping = 0.999;
            game.camera.follow(player);
            player.body.setCollisionGroup(playerCollisionGroup);
            player.body.collides(ledgeCollisionGroup);
            
            player.body.collides(enemyCollisionGroup, touchEnemy, this);
            
            //player.animations.add('left', [0,1,2,3], 10, true);
            //player.animations.add('right', [5,6,7,8], 10, true);
            
            cursors = game.input.keyboard.createCursorKeys();
            
            pausedText = game.add.text(800, 460, '', { fontSize: '32px', fill: '#000' });
            
            game.input.onDown.add(unpause, self);
            function unpause(event){
                if(game.paused){
                    game.paused = false;
                    pausedText.text = '';
                }
            }
   

        }

function update() {
    
    
    
    var ki = game.input.keyboard.isDown(Phaser.Keyboard.I);
    var kj = game.input.keyboard.isDown(Phaser.Keyboard.J);
    var kk = game.input.keyboard.isDown(Phaser.Keyboard.K);
    var kl = game.input.keyboard.isDown(Phaser.Keyboard.L);
    
    var kp = game.input.keyboard.isDown(Phaser.Keyboard.P);
    var kn = game.input.keyboard.isDown(Phaser.Keyboard.N);
    
    var kw = game.input.keyboard.isDown(Phaser.Keyboard.W);
    var ka = game.input.keyboard.isDown(Phaser.Keyboard.A);
    var ks = game.input.keyboard.isDown(Phaser.Keyboard.S);
    var kd = game.input.keyboard.isDown(Phaser.Keyboard.D);
    
    var mu = cursors.up.isDown;
    var mr = cursors.right.isDown;
    var md = cursors.down.isDown;
    var ml = cursors.left.isDown;
    
    if (kn) {
        randomEnemies();
    }

    if (mr || kd) {
        player.body.moveRight(playerSpeed);
    } else if (ml || ka) {
        player.body.moveLeft(playerSpeed);
    }
    if (mu || kw) {
        player.body.moveUp(playerSpeed);
    } else if (md || ks) {
        player.body.moveDown(playerSpeed);
    }

    
    if (kl) {
        if (this.game.time.time < this.nextFire) { 
            return; 
        } else {
            this.nextFire = (this.game.time.time) + playerFireRate;
            var bullet = bullets.create(player.body.x+player.width/2, player.body.y, 'dot');
            bullet.scale.setTo(8,5);
            game.physics.p2.enable(bullet, false);
            bullet.body.moveRight(bulletSpeed);
            bullet.body.velocity.y = player.body.velocity.y/2;
            bullet.lifespan = playerRange;
            bullet.body.setCollisionGroup(bulletsCollisionGroup);
            bullet.body.collides(ledgeCollisionGroup, wallHit, this);
            bullet.body.collides(enemyCollisionGroup, shootEnemy,this);
            
        }
    } else if (kk) {
        if (this.game.time.time < this.nextFire) { 
            return; 
        } else {
            this.nextFire = (this.game.time.time) + playerFireRate;
            var bullet = bullets.create(player.body.x, player.body.y+player.height/2, 'dot');
            bullet.scale.setTo(5,8);
            game.physics.p2.enable(bullet, false);
            bullet.body.moveDown(bulletSpeed);
            bullet.body.velocity.x = player.body.velocity.x/2;
            bullet.lifespan = playerRange;
            bullet.body.setCollisionGroup(bulletsCollisionGroup);
            bullet.body.collides(ledgeCollisionGroup, wallHit, this);
            bullet.body.collides(enemyCollisionGroup, shootEnemy,this);
            
        }
    } else if (kj) {
        if (this.game.time.time < this.nextFire) { 
            return; 
        } else {
            this.nextFire = (this.game.time.time) + playerFireRate;
            var bullet = bullets.create(player.body.x-player.width/2, player.body.y, 'dot');
            bullet.scale.setTo(8,5);
            game.physics.p2.enable(bullet, false);
            bullet.body.moveLeft(bulletSpeed);
            bullet.body.velocity.y = player.body.velocity.y/2;
            bullet.lifespan = playerRange;
            bullet.body.setCollisionGroup(bulletsCollisionGroup);
            bullet.body.collides(ledgeCollisionGroup, wallHit, this);
            bullet.body.collides(enemyCollisionGroup, shootEnemy,this);
            
        }
    } else if (ki) {
        if (this.game.time.time < this.nextFire) { 
            return; 
        } else {
            this.nextFire = (this.game.time.time) + playerFireRate;
            var bullet = bullets.create(player.body.x, player.body.y-player.height/2, 'dot');
            bullet.scale.setTo(5,8);
            game.physics.p2.enable(bullet, false);
            bullet.body.moveUp(bulletSpeed);
            bullet.body.velocity.x = player.body.velocity.x/2;
            bullet.lifespan = playerRange;
            bullet.body.setCollisionGroup(bulletsCollisionGroup);
            bullet.body.collides(ledgeCollisionGroup, wallHit, this);
            bullet.body.collides(enemyCollisionGroup, shootEnemy,this);
            
        }
    }
        
    
        
    
    if (kp) {
        game.paused = true;
        pausedText.text = 'paused';
    }
    
    for (var i = 0; i < enemies.children.length; i++) {
        var enemy = enemies.children[i];
        var enemyX = enemies.children[i].x;
        var enemyY = enemies.children[i].y;
        var playerX = player.body.x;
        var playerY = player.body.y;
        var enemyS = enemy.speed;
        //var angle = (playerY-enemyY)/(playerX-enemyX);
        //enemy.body.velocity.x = 150*angle;
        //enemy.body.velocity.y = 150*angle;
        //pausedText.text = angle;
        var peX = playerX - enemyX;
        var peY = playerY - enemyY;
        var angle = (Math.atan(peY/peX)) * (180/Math.PI);
        pausedText.text = angle;
        
        if (enemyX>playerX && enemyY>playerY) {
            enemy.body.velocity.x = -(enemyS/50) * (90-angle);
            enemy.body.velocity.y = -(enemyS/50) * angle;
        }
        if (enemyX<playerX && enemyY>playerY) {
           enemy.body.velocity.x = (enemyS/50) * (90+angle);
            enemy.body.velocity.y = -(enemyS/50) * -angle;
        }
        if (enemyX>playerX && enemyY<playerY) {
            enemy.body.velocity.x = -((enemyS/50) * (90+angle));
            enemy.body.velocity.y = (enemyS/50) * -angle;
        }
        if (enemyX<playerX && enemyY<playerY) {
            enemy.body.velocity.x = (enemyS/50) * (90-angle);
            enemy.body.velocity.y = -((enemyS/50) * -angle);
        }
        
        
      
      
        
    }
    
}

function render() {
    game.debug.text('H: ' + health, 20, 20);
    game.debug.text('E: ' + enemies.children.length,20,40);
}

function touchEnemy(body1, body2) {
    if (this.game.time.time < this.nextHit) { 
            return; 
        } else {
        this.nextHit = (this.game.time.time) + invincibleTime;
        health--;
        }
}

var createEnemy1 = function(x,y,health,speed){
                
                var enemy = enemies.create(x,y,'enemy');
            game.physics.p2.enable(enemy,false);
            enemy.body.damping = 0.999;
            enemy.health = health;
                enemy.speed = speed;
                enemy.body.fixedRotation = true;
            enemy.body.setCollisionGroup(enemyCollisionGroup);
            enemy.body.collides(ledgeCollisionGroup);
                enemy.body.collides(enemyCollisionGroup);
            enemy.body.collides(playerCollisionGroup);
            enemy.body.collides(bulletsCollisionGroup);
               
            
                
            }

function randomEnemies() {
    
    createEnemy1(Math.random()*960,Math.random()*540,Math.random()*10,Math.random()*200);
    
}

function shootEnemy(body1, body2) {
    body1.sprite.kill();
    body1.destroy();
    body2.alive = true;
    body2.sprite.damage(playerDamage);
}
            
function wallHit(body1, body2) {
    body1.sprite.kill();
    body1.destroy();
}