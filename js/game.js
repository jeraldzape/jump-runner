Jumper.Game = function(game){};

var _v = {
	scope : false,
	floor : {
		list 			: [],
		distanceX 		: 65,
		speed 			: 3,
		count 			: 10,
		height 			: 15,
		width				: 200,
		collisionGroup 	: null,
		lastTile 		: null
	},
	coins : {
		list 			: [],
		normalValue 	: 5,
		specialValue 	: 10,
		collisionGroup 	: null,
		category		: [
		{ type : "regular", total : 0, occurence : 0.3 },
		{ type : "hidden", 	total : 0, occurence : 0.6 },
		{ type : "enemy", 	total : 0, occurence : 0.2 }],
		counter:{
			enemy: 0
		}
	},
	character : {
		sprite 			: null,
		gravity 		: 1500
	},
	score : {
		current : 0,
		highest : 0,
		timer : false,
		fontStyle:	{
			font: "12px 'Press Start 2P'",
			fill: "#ffffff",
			align: "center"
		}
	},
	inventory:{
		initial 		: 30,
		doubleJumps : 0,
		shield			:	0,
		bomb				: 0
	}
}

Jumper.Game.prototype = {
	create: function(){

		/* Add reference to "this" */
		_v.scope = this;

		this.ui.background.init();

		this.world.setBounds(0, 0, this.game.width, this.game.height);
		this.ui.coins.init();
		this.ui.floor.init();

		this.ui.character.init();
		this.ui.score.init();
		this.ui.inventory.init();

		/* Start moving floors! */
		_v.scope.gameEvents.continue();
		_v.scope.ui.score.timer.start();

	},
	update: function(){

		if(!_v.gameRunning) return;
		this.ui.floor.update();
		this.ui.coins.update();
		this.ui.handleCollision();
		this.ui.character.update();
		this.gameEvents.checkGameOver();
	},
	ui: {
		background: {
			init: function(){
				_v.scope.game.add.image(0,0,'game_background');
			}
		},
		floor:{
			init: function(){

				/* Create floor tiles */

				var _this = _v.scope;

				/* Add collision group */
				_v.floor.collisionGroup = _this.game.add.group();

				var lastTile = false;

				for(var i = 0; i < _v.floor.count; i++){
					/* create bitmap */
					var bmp = _this.game.add.bitmapData(_v.scope.ui.floor.getRandom.width(),_v.floor.height);
					bmp.fill(64,191,228,1);

					/* Queue tiles */
					var positionX = lastTile ? (lastTile.x + lastTile.width * 0.5) + (bmp.width * 0.5) + _v.floor.distanceX : _this.game.width * 0.3,
					positionY = (_this.game.height * 0.75) - _v.scope.ui.floor.getRandom.positionY();

					/* Add floor tile */
					var tileSprite = _this.game.add.sprite(positionX, positionY, bmp);
					tileSprite.anchor.setTo(0.5,0.5);

					/* Add physics */
					_this.physics.arcade.enable(tileSprite);
					tileSprite.body.immovable = true;

					/* Push floor to list */
					_v.floor.list.push(tileSprite);
					_v.floor.lastTile = lastTile = tileSprite;

					/* Add to collision group */
					_v.floor.collisionGroup.add(tileSprite);

					/* Add coin to the top of tile*/
					_this.ui.coins.add(tileSprite);

				}
			},
			update: function(){

				/* Move floors */
				var floor;
				for(var i = 0;i < _v.floor.list.length; i++){
					floor = _v.floor.list[i];
					floor.x -= _v.floor.speed;
					this.respawn(floor);
				}
			},
			respawn: function(floor){
				/* Check tile if off-screen */
				if(floor.x + (floor.width * 0.5) <= 0){
					/* Reposition tile to last queue */
					floor.x = _v.floor.lastTile.x + (_v.floor.lastTile.width * 0.5) + (floor.width * 0.5) + _v.floor.distanceX
					_v.floor.lastTile = floor;
				}
			},
			getRandom: {
				positionY: function(){
					var y = [30,60,90,120,150];
					return y[Math.floor(Math.random() * y.length)];
				},
				width: function(){
					var p = [0.5,0.75,0.25];
					return _v.floor.width * p[Math.floor(Math.random() * p.length)];
				}
			},
			collisionHandler: {
				collide: function(a,b){
					_v.character.sprite.isJumping = false;
				}
			}
		},
		coins:{
			init: function(){
				console.log('coins initialized');
				_v.coins.collisionGroup = _v.scope.game.add.group();
			},
			add: function(tileSprite){

				var _this = _v.scope;

				var coinBmp = _this.game.add.bitmapData(20,20);

				var coinSprite = _this.game.add.sprite(tileSprite.x, tileSprite.y - (tileSprite.height * 0.5) - 10, 'img_coin');

				coinSprite.anchor.setTo(0.5,1);
				coinSprite.coinBmp = coinBmp;
				_v.coins.list.push(coinSprite);
				this.convert.init(coinSprite);

				/* Add physics */
				_this.physics.arcade.enable(coinSprite);
				coinSprite.body.immovable = true;
				_v.coins.collisionGroup.add(coinSprite);
			},
			update: function(){

				/* Move coins */
				var coin;
				for(var i = 0; i < _v.coins.list.length; i++){
					coin = _v.coins.list[i];
					coin.x -= _v.floor.speed;

					/* Check tile if off-screen */
					if(coin.x + (coin.width * 0.5) <= 0){
						/* Reposition coin to last queue, above floor */
						coin.x = _v.floor.lastTile.x;
						coin.y = _v.floor.lastTile.y - (_v.floor.lastTile.height * 0.5) - 10;
						_v.scope.ui.coins.convert.init(coin);
					}
				}
			},
			/* Coin-Enemy collision handler */
			collisionHandler: {
				collide: function(character, coin){
					if(coin.hasCollided) return false;
					coin.hasCollided = true;
					//coin.visible = false;

					_v.character.collidesWithEnemy = false;

					console.info('collides with: ' + coin.coinType);

					switch(coin.coinType){
						case 'enemy':
						_v.character.collidesWithEnemy = true;
						coin.alpha = 1;
						break;
						case 'regular':
						console.log('adding points');
						coin.alpha = 0;
						_v.scope.ui.score.powerup();
						_v.scope.ui.inventory.doubleJump.add();
						break;
						default:
					}
				}
			},
			convert: {
				init: function(coin){

					var coinCategory = _v.coins.category;
					var categoryIndex = Math.floor(Math.random() * coinCategory.length);
					var selectedCategory = coinCategory[categoryIndex];
					var maxCategoryOccurence = Math.floor(_v.floor.count * selectedCategory.occurence);

					coin.hasCollided = false;
					coin.visible = true;

					selectedCategory.total++;
					selectedCategory.availableSlot = (selectedCategory.availableSlot || maxCategoryOccurence) - 1;
					this.setTo[selectedCategory.type](coin);

					/* Check if last coin is an enemy; convert to regular coin otherwise */
					var lastCoinType = null;
					if(coin.coinType == "enemy"){
						_v.coins.counter.enemy++;
						if(_v.coins.counter.enemy == 2){
							this.setTo.regular(coin);
							_v.coins.counter.enemy = 0;
						}
					}

					_v.coins.lastCoin = coin;

				},
				setTo:{
					regular: function(coin){
						/* Reset enemy/hidden/obstacle to coin */
						coin.coinType = "regular";
						coin.coinBmp.fill(255,237,0,1);
						coin.alpha = 1;
						coin.key = "img_coin";
						coin.loadTexture('img_coin',0);
					},
					hidden: function(coin){
						/* Set coin to invisible */
						coin.coinType = "hidden";
						coin.alpha = 0;
					},
					enemy: function(coin){
						/* Set coin as enemy/obstacle */
						coin.coinType = "enemy";
						coin.coinBmp.fill(255,0,0,1);
						coin.alpha = 1;
						var enemyList = ['img_enemy_1','img_enemy_2'];
						var randomEnemy = enemyList[Math.floor(Math.random() * enemyList.length)];
						coin.key = randomEnemy;
						coin.loadTexture(randomEnemy,0);
					}
				}
			}
		},
		character: {
			init: function(){

				var _this = _v.scope;

				var charBmp = _this.game.add.bitmapData(30,30);
				charBmp.fill(0,76,255,1);

				var charSprite = _v.character.sprite = _this.game.add.sprite(_this.game.width*0.25,0, 'character_run');
				charSprite.animations.add('walk');
				/* Add physics */
				_this.physics.arcade.enable(charSprite);
				charSprite.body.gravity.y = _v.character.gravity;
				charSprite.body.collideWorldBounds = true;

				/* Add tap event */
				this.addTapEvent();
			},
			addTapEvent: function(){
				var manager = new Hammer.Manager(document.querySelector('canvas'));

				/* Tap event(jump) */
				manager.add(new Hammer.Tap({taps:1}));
				manager.on('tap', function(e){
					_v.scope.ui.character.jump();
				});
				/* Swipe down event(quick drop) */
				manager.add(new Hammer.Swipe());
				manager.on('swipe', function(e){
					console.log(e);
				});
			},
			isOnFloor: function(){
				return _v.character.sprite.body.onFloor() || _v.character.sprite.body.touching.down;
			},
			update: function(){
				_v.character.sprite.animations.play('walk', 60);
			},
			jump: function(){

				if(!_v.gameRunning) return false;

				if(!this.isOnFloor()){
					if(_v.inventory.doubleJumps > 0){
						console.warn("Double jump success!");
						_v.scope.ui.inventory.doubleJump.minus();
						_v.character.sprite.body.velocity.y -= 400;
					}else{
						console.warn("Double jump failed! Not enough coins")
					}
				}else{
					_v.character.sprite.body.velocity.y -= 500;
				}
			}
		},
		handleCollision: function(){
			var _this = _v.scope;
			_this.physics.arcade.overlap(_v.character.sprite,_v.coins.collisionGroup, null, _v.scope.ui.coins.collisionHandler.collide, _this);
			_this.physics.arcade.collide(_v.character.sprite, _v.floor.collisionGroup, null, _v.scope.ui.floor.collisionHandler.collide, _this);
		},
		score: {
			init: function(){
				/* draw score board */
				this.scoreBoard = _v.scope.add.text(_v.scope.game.width - 10, 10, "00000",_v.score.fontStyle);
				this.scoreBoard.anchor.setTo(1,0);
			},
			timer: {
				start: function(){
					_v.timer = setInterval(_v.scope.ui.score.increment,300);
				},
				stop: function(){
					clearInterval(_v.timer);
					console.warn("timer stopped.");
				}
			},
			increment: function(){
				_v.score.current++;
				_v.scope.ui.score.update();
				console.log('incrementing..');
			},
			powerup: function(){
				_v.score.current += 5;
				_v.scope.ui.score.update();
			},
			reset: function(){
				_v.score.current = 0;
				this.timer.stop();
				this.timer.start();
				this.update();
			},
			update: function(){
				var padded = String("00000000" + _v.score.current).substr(2);
				this.scoreBoard.setText(padded);
			}
		},
		inventory: {
			init: function(){
				console.warn('inventory initialized');
				/* Setup inventory */
				var invntBoard = this.inventoryBoard = _v.scope.add.text(20, 10, _v.inventory.initial,_v.score.fontStyle);
				invntBoard.anchor.setTo(0,0);
				var dblJmpBmp = _v.scope.game.add.bitmapData(20,20);
				dblJmpBmp.fill(64,190,100,1);
				var dblJmpSprite = _v.scope.add.sprite(5,7,'img_coin');
				dblJmpSprite.scale.setTo(0.6,0.6);
				this.doubleJump.reset();

			},
			doubleJump:{
				reset: function(){
					_v.inventory.doubleJumps = _v.inventory.initial;
					this.render();
				},
				add: function(){
					_v.inventory.doubleJumps++;
					this.render();
				},
				minus: function(){
					_v.inventory.doubleJumps > 0 && _v.inventory.doubleJumps--;
					this.render();
				},
				render: function(){
					_v.scope.ui.inventory.inventoryBoard.setText(_v.inventory.doubleJumps);
				}
			}
		}
	},
	gameEvents: {
		reset: function(){
			_v.character.sprite.y = 0;
			_v.character.sprite.body.velocity.y = 0;
			_v.character.collidesWithEnemy = false;

			_v.scope.ui.score.reset(); /* reset score */
			_v.scope.ui.inventory.doubleJump.reset();

			this.continue();
		},
		pause: function(){
			_v.gameRunning = false;
			_v.scope.ui.score.timer.stop();
		},
		continue: function(){
			_v.gameRunning = true;
		},
		checkGameOver: function(){

			var characterIsBelowFloor = _v.character.sprite.y > (_v.scope.game.height * 0.75);
			var isGameover = _v.character.collidesWithEnemy || characterIsBelowFloor;

			if(isGameover){
				console.log('Game over!!!!!!', characterIsBelowFloor ? "[out of bounds]" : "[enemy collision]");
				_v.scope.gameEvents.pause();
				_v.character.sprite.body.collideWorldBounds = false;
				this.retry.show();
			}
		},
		retry: {
			setup: function(){

				var _self = this,
				game = _v.scope.game;

				/* create ui group */
				var uiGroup = this.uiGroup = game.add.group();

				/* create backdrop */
				var backDropSprite = game.add.sprite(0,0,game.add.bitmapData(game.width, game.height).fill(0,0,0,0.75));
				/* initialized logo + button */
				var btn = this.ui = game.add.image(game.width * 0.5, game.height * 0.6,'img_replay');
				btn.anchor.setTo(0.5,0.5);
				btn.inputEnabled = true;

				/* add logo */
				var logo = game.add.image(game.width * 0.5, game.height * 0.3, 'img_tryAgain');
				logo.anchor.setTo(0.5,0.5);

				btn.events.onInputDown.add(function(){
					console.log("Resetting game..");
					_v.scope.gameEvents.reset();
					_self.hide();
				});

				/* group elements */
				uiGroup.add(backDropSprite);
				uiGroup.add(logo);
				uiGroup.add(btn);

				this.initialized = true;
			},
			show: function(){

				if(!this.initialized){
					this.setup();
				}
				this.uiGroup.visible = true;

			},
			hide: function(){
				this.uiGroup.visible = false;
			}
		}
	},
	render: function(){
		// for(var i=0;i<_v.coins.list.length;i++){
		// 	this.game.debug.body(_v.coins.list[i])
		// }
	}

}
