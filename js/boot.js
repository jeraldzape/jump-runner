Jumper = {};

Jumper.Boot = function(game) {}

Jumper.Boot.prototype = {
  preload: function() {
    console.warn('loading..');

    // show loading

    var loadingText = this.game.add.text(this.world.centerX, this.world.centerY, "Loading..", {
      font: "20px Century Gothic",
      fill: "#ffffff",
      align: "center"
    });
    loadingText.anchor.setTo(0.5, 0.5);

    this.game.load.image('img_play','skins/space/play.png');
    this.game.load.image('img_logo','skins/space/logo.png');

    this.game.load.image('img_coin', 'skins/space/coin.png');
    this.game.load.image('img_enemy_1','skins/space/enemy1.png');
    this.game.load.image('img_enemy_2','skins/space/enemy2.png');

    this.game.load.spritesheet('character_run', 'skins/space/walk.png', 53.5, 66);
    this.game.load.image('game_background','skins/space/background.jpg');

    this.game.load.image('img_tryAgain','skins/space/retry_label.png');
    this.game.load.image('img_replay','skins/space/replay.png');

  },
  create: function() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.state.start('Menu');
  }
}
