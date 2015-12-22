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
            game.load.image('bullet88', 'bullet88.png');
            game.load.image('bullet24', 'bullet24.png');
            game.load.image('playerbullet', 'bulleto.png');
            game.load.image('enemybullet', 'bulletp.png');
            game.load.image('orangeoverlay', 'reloaded.png');
            game.load.spritesheet('dude', 'dude.png', 32, 48);
            game.load.spritesheet('baddie', 'baddie.png', 32, 32);
        }

var player;
var platforms;
var enemies;
var bullets;
var enemyBullets;
var modRX = 0;
var modLX = 0;
var modUY = 0;
var modDY = 0;
var nextFire = 0;
var debugVar;
var debugVar2 = 'Debug';
var debugVar3 = 'Debug';
var playerX = 0;
var playerY = 0;
var reloadTween;
var physicsTime = 0;
var shouldReload = false;

   // STATS //
var playerAccel = 10;
var playerDecel = 10;
var playerSpeed = 100;
var bulletSpeed = 200;
var playerHealth = 2;
var fireRate = 300;
   // END STATS //

function create () {
    
    Phaser.Tween.frameBased = true;

            //GAME
            game.world.setBounds(0,0, 960, 540);
            game.physics.startSystem(Phaser.Physics.ARCADE);
            game.add.sprite(0,0,'bg');
            game.time.advancedTiming = true;
            game.time.desiredFps = 60;
            game.time.slowMotion = 1;
            
            //PLATFORMS
            platforms = game.add.group();
            var createLedge = function(x,y,w,h){
                var ledge = platforms.create(x,y,'dot');
                ledge.scale.setTo(w,h);
                game.physics.enable(ledge, Phaser.Physics.ARCADE);
                ledge.body.immovable = true;
            }
            createLedge(300,100,100,30);
            createLedge(400,400,200,30);
            createLedge(100,200,200,30);
            createLedge(0,0,30,game.world.height);
            createLedge(0,game.world.height-30,game.world.width,30);
            createLedge(0,0,game.world.width,30);
            createLedge(game.world.width-30,0,30,game.world.height);
            
            //BULLETS + ENEMY BULLETS
            bullets = game.add.group();
            bullets.enableBody = true;
            bullets.physicsBodyType = Phaser.Physics.ARCADE;
            bullets.createMultiple(20, 'playerbullet');
            bullets.setAll('checkWorldBounds', true);
            bullets.setAll('outOfBoundsKill', true);
            
            enemyBullets = game.add.group();
            enemyBullets.enableBody = true;
            enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
            enemyBullets.createMultiple(50, 'enemybullet');
            enemyBullets.setAll('checkWorldBounds', true);
            enemyBullets.setAll('outOfBoundsKill', true);
            
            //ENEMIES
            enemies = game.add.group();
             var createEnemy = function(x,y){
                var enemy = enemies.create(x,y,'enemy');
                game.physics.enable(enemy, Phaser.Physics.ARCADE);
                 enemy.health = 3;
                 enemy.nextFire = physicsTime + 200;
            }
             
            createEnemy(400,200);
            createEnemy(200,300);
            
            //PLAYER            
            player = game.add.sprite(50,50, 'square');
            game.physics.enable(player, Phaser.Physics.ARCADE);
            player.health = playerHealth;
            player.body.collideWorldBounds = true;
            playerX = player.x;
            playerY = player.y;
            
            
            
            //player.animations.add('left', [0,1,2,3], 10, true);
            //player.animations.add('right', [5,6,7,8], 10, true);
            
            cursors = game.input.keyboard.createCursorKeys();
            
            //PAUSE
            pausedText = game.add.text(800, 460, '', { fontSize: '32px', fill: '#000' });
            game.input.onDown.add(unpause, self);
            function unpause(event){
                if(game.paused){
                    game.paused = false;
                    pausedText.text = '';
                }
            }
            
            var reloadOverlay = game.add.sprite(game.world.centerX, game.world.centerY, 'orangeoverlay');
    reloadOverlay.anchor.setTo(0.5, 0.5);
    reloadOverlay.alpha = 0;
            
    reloadTween = game.add.tween(reloadOverlay).to( { alpha: 0.5 }, 200, Phaser.Easing.Linear.None, false, 0);
            reloadTween2 = game.add.tween(reloadOverlay).to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, false, 0);
            reloadTween.chain(reloadTween2);
            reloadTween2.onComplete.add(stopTween, this);
            reloadTween.onComplete.removeAll();
            reloadTween2.onComplete.removeAll();
    reloadTween.frameBased = false;
    reloadTween2.frameBased = false;
            function stopTween() {
                reloadTween2.stop();
                reloadTween.stop();
                
            }
            
        }


function update() {
    
    
    
    
    //ENEMY FIRE AND FOLLOW
    
    for (var i = 0; i < enemies.length; i++) {
        if (enemies.children[i].nextFire < physicsTime && enemyBullets.countDead() > 0 && enemies.children[i].health > 0 && player.alive) {
            enemies.children[i].nextFire = physicsTime + 200;
            var bullet = enemyBullets.getFirstDead();
            bullet.anchor.setTo(0.5,0.5);
            bullet.reset(enemies.children[i].x+20, enemies.children[i].y+20);
            game.physics.arcade.moveToObject(bullet, player, 320);
        }
        
        if ((Phaser.Math.distance(enemies.children[i].x, enemies.children[i].y, player.body.x, player.body.y)) < 100 || (Phaser.Math.distance(enemies.children[i].x, enemies.children[i].y, player.body.x, player.body.y)) > 300) {
            enemies.children[i].body.velocity.x = 0;
            enemies.children[i].body.velocity.y = 0;
        } else {
            game.physics.arcade.moveToObject(enemies.children[i], player, 10);
        }
    }
    
    //COLISIONS
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(enemies, platforms);
    game.physics.arcade.collide(enemies, enemies);
    game.physics.arcade.collide(player, enemies);
    game.physics.arcade.collide(bullets, enemies, shootEnemy, null, this);
    game.physics.arcade.collide(enemyBullets, player, shootPlayer, null, this);
    game.physics.arcade.overlap(bullets, platforms, shootPlatform, null, this);
    game.physics.arcade.overlap(enemyBullets, platforms, shootPlatform, null, this);
    
    //INPUT
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
    
    var au = cursors.up.isDown;
    var ar = cursors.right.isDown;
    var ad = cursors.down.isDown;
    var al = cursors.left.isDown;
    
    //PAUSE
    if (kp) {
        game.paused = true;
        pausedText.text = 'paused';
    }

    //FIRE BULLET
    if (kl) {
       fire(40,20,1,1,1,0);
    }
    if (kj) {
       fire(0,20,1,1,-1,0);
    }
    if (ki) {
       fire(20,0,1,1,0,-1);
    }
    if (kk) {
       fire(20,40,1,1,0,1);
    }
    //END FIRE BULLET

    //THE TOMMY "2" GOOD MOVE SYSTEM

    if ((kd || ar) && (modRX < playerSpeed)) {
       modRX += playerAccel;
    } else if ((kd || ar) && (modRX = playerSpeed)) {
      
    } else {
        modRX -= playerDecel;
        if (modRX < playerDecel) {
            modRX = 0;
        }
    }
    
    if ((ka || al) && (modLX > -playerSpeed)) {
       modLX -= playerAccel;
    } else if ((ka || al) && (modLX = -playerSpeed)) {
       
    } else {
        modLX += playerDecel;
        if (modLX > -playerDecel) {
            modLX = 0;
        }
    }
    
    if ((ks || ad) && (modDY < playerSpeed)) {
       modDY += playerAccel;
    } else if ((ks || ad) && (modDY = playerSpeed)) {
        
    } else {
        modDY -= playerDecel;
        if (modDY < playerDecel) {
            modDY = 0;
        }
    }
    
    if ((kw || au) && (modUY > -playerSpeed)) {
       modUY -= playerAccel;
    } else if ((kw || au) && (modUY = -playerSpeed)) {
     
    } else {
        modUY += playerDecel;
        if (modUY > -playerDecel) {
            modUY = 0;
        }
    }
    
    var modX = (modLX + modRX);
    var modY = (modDY + modUY);
    
    var length = Math.sqrt(modX*modX + modY*modY);
    var moveX = modX / length;
    var moveY = modY / length;
    if (modY != 0) {
        player.body.velocity.x = modX / length * 100;
    } else {
        player.body.velocity.x = modX;
    }
    
    if (modX != 0) {
        player.body.velocity.y = modY / length * 100;
    } else {
        player.body.velocity.y = modY;
    }   
    //END TOMMY "2" GOOD MOVE SYSTEM
    
    game.time.slowMotion = 2.01 - Math.sqrt(player.body.velocity.x*player.body.velocity.x + player.body.velocity.y*player.body.velocity.y) * 0.017; 
    
    physicsTime++;
    
    if (physicsTime+20 > nextFire && bullets.countDead() > 0 && shouldReload)
    {
    
        reloadTween.start();
        shouldReload = false;
       
        
        
    }
    
}



function render() {
    
    
    game.debug.text('Hello', 20, 20);
    game.debug.text('T: ' + player.body.speed,20,40);
    game.debug.text('X: ' + player.x,20,60);
    game.debug.text('Y: ' + player.y,20,80);
    game.debug.text('D: ' + game.time.physicsElapsed,20,140);
    game.debug.text('D: ' + debugVar2,20,160);
    game.debug.text('D: ' + debugVar3,20,180);   
}

function shootEnemy(bullet,enemy) {
    
    var bulletAnimation = game.add.sprite(bullet.x,bullet.y,'dude');
    bulletAnimation.anchor.setTo(0.5,0.5);
    bulletAnimation.animations.add('explode', [0,1,2,3,4,5,6,7,8],10,false);
    bulletAnimation.play('explode',10,false,true);
    
    console.log("rip enemy");
    bullet.kill();
    
    enemy.damage(1);
}

function shootPlayer(player,bullet) {
    var bulletAnimation = game.add.sprite(bullet.x,bullet.y,'dude');
    bulletAnimation.anchor.setTo(0.5,0.5);
    bulletAnimation.animations.add('explode', [0,1,2,3,4,5,6,7,8],10,false);
    bulletAnimation.play('explode',10,false,true);
    
    console.log("rip u");
    bullet.kill();
    player.damage(1);
}

function shootPlatform(bullet,ledge) {
    var bulletAnimation = game.add.sprite(bullet.x,bullet.y,'dude');
    bulletAnimation.anchor.setTo(0.5,0.5);
    bulletAnimation.animations.add('explode', [0,1,2,3,4,5,6,7,8],10,false);
    bulletAnimation.play('explode',10,false,true);
    
    console.log("rip platform");
    bullet.kill();
}

function fire(xShift,yShift,width,height,xSpeedMultiplier,ySpeedMultiplier) {
    if (physicsTime > nextFire && bullets.countDead() > 0)
    {
        
        nextFire = physicsTime + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.anchor.setTo(0.5,0.5);
        bullet.scale.setTo(width,height);
      
        bullet.reset(player.x + xShift, player.y + yShift);
        bullet.body.velocity.x = 200 * xSpeedMultiplier;
        bullet.body.velocity.y = 200 * ySpeedMultiplier;
        
        shouldReload = true;
    }
}

