var gameScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    gameLayer = new game();
    gameLayer.init();
    this.addChild(gameLayer);
  }
});
var fieldSize = 6;
var tileTypes = ["orange", "cyan", "greeen", "yellow", "purple"];
var tileSize = 50;
var orbLayer;
var tileArray = [];
var cache;

var game = cc.Layer.extend({
  init: function() {
    this._super();
    //グラデーション背景
    var backgroundLayer = cc.LayerGradient.create(cc.color(0, 0, 0, 255), cc.color(0x46, 0x82, 0xB4, 255));
    this.addChild(backgroundLayer);　　　 //でバック用のラベルを表示
    debugText = cc.LabelTTF.create("debug", "Arial", "32", cc.TEXT_ALIGNMENT_CENTER);
    this.addChild(debugText);
    size = cc.winSize;
    debugText.setPosition(size.width / 2, size.height - 20);
    debugText.setString("match 3 game");
    //オーブを配置するレイヤー
    orbLayer = cc.Layer.create();
    this.addChild(orbLayer);

    //スプライトシート読み込み
    cache = cc.spriteFrameCache;
    cache.addSpriteFrames(res.orbs_plist, res.orbs_png);

    this.createLevel();
  },
  createLevel: function() {
    for (i = 0; i < fieldSize; i++) {
      tileArray[i] = [];
      for (j = 0; j < fieldSize; j++) {
        this.addTile(i, j);
      }
    }
  },

  addTile: function(row, col) {
    var randomTile = Math.floor(Math.random() * tileTypes.length);
    var sprite = cc.Sprite.create(cache.getSpriteFrame(tileTypes[randomTile]));
    orbLayer.addChild(sprite, 0);
    sprite.val = randomTile;
    orbLayer.addChild(sprite,0);
    sprite.setPosition(tileSize/2 + tileSize * col,tileSize/2 + tileSize * row);
    tileArray[row][col]=sprite;
  }

});
