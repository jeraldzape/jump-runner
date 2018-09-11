Jumper.Menu = function(game) {}

Jumper.Menu.prototype = {
  preload: function() {
    console.warn('loading menu..');
  },
  create: function() {

    var _this = this;

    this.game.add.image(0,0,'game_background');

    var logo = this.game.add.sprite(this.game.width * 0.5, this.game.height * 0.25, 'img_logo');
    logo.anchor.setTo(0.5,0.5);

    var btn = this.game.add.sprite(this.game.width * 0.5, this.game.height * 0.65, 'img_play');
    btn.anchor.setTo(0.5,0.5);
    btn.inputEnabled = true;
    btn.events.onInputDown.add(function(){
      _this.state.start('Game');
    });
  }
}
