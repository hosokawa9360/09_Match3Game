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
//最初のコマを選択または解除で追加
var startColor = null;　 //最初に選択したタイルの色
var visitedTiles = []; //プレイヤが選択された後のタイルを格納する
//連鎖チェーンを作るで追加
var tolerance = 400; //タイルの中心からの距離の許容値　選択許容範囲

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
    //
    cc.eventManager.addListener(touchListener, this);
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
    orbLayer.addChild(sprite, 0);
    sprite.setPosition(tileSize / 2 + tileSize * col, tileSize / 2 + tileSize * row);
    tileArray[row][col] = sprite; //タイルを管理する配列に格納
  }

});

var touchListener = cc.EventListener.create({
  event: cc.EventListener.MOUSE, //マウスを利用する
  onMouseDown: function(event) {
    //クリックされた座標位置から、選択された行と列のインデックスを取得する
    var pickedRow = Math.floor(event._y / tileSize);
    var pickedCol = Math.floor(event._x / tileSize);
    tileArray[pickedRow][pickedCol].setOpacity(128); //半透明にする
    tileArray[pickedRow][pickedCol].picked = true;
    startColor = tileArray[pickedRow][pickedCol].val; //現在のコマの色をstartColorに入れる
    //これ以降選択されるコマの座標がvisitedTilesにpushされる
    visitedTiles.push({
      row: pickedRow,
      col: pickedCol
    });
  },
  onMouseUp: function(event) {
    startColor = null; //プレイヤがマウスを話したとき、コマの選択をnull(リセットする）
    for (i = 0; i < visitedTiles.length; i++) {
      tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
      tileArray[visitedTiles[i].row][visitedTiles[i].col].picked = false;
    }
  },
  onMouseMove: function(event) {
    if (startColor != null) {
        //クリックされた座標位置から、選択された行と列のインデックスを取得する
      var currentRow = Math.floor(event._y / tileSize);
      var currentCol = Math.floor(event._x / tileSize);
      //タイルの中心座標を求める
      var centerX = currentCol * tileSize + tileSize / 2;
      var centerY = currentRow * tileSize + tileSize / 2;
      //タイルの中心座標とクリックされた座標の差を取る
      var distX = event._x - centerX;
      var distY = event._y - centerY;
      //ピタゴラスの定理で　選択許容範囲内かどうかを判定
      if (distX * distX + distY * distY < tolerance) {
        //現在のコマがまだ選択されておらず、picked属性がfalseである
        if (!tileArray[currentRow][currentCol].picked) {
          //現在のコマは最後の選択されあたコマに隣接している　
          if (Math.abs(currentRow - visitedTiles[visitedTiles.length - 1].row) <= 1 && Math.abs(currentCol - visitedTiles[visitedTiles.length - 1].col) <= 1) {
            //現在のコマは、まず選んだコマと同じである
            if (tileArray[currentRow][currentCol].val == startColor) {
              tileArray[currentRow][currentCol].setOpacity(128);
              tileArray[currentRow][currentCol].picked = true;
              visitedTiles.push({
                row: currentRow,
                col: currentCol
              });
            }
          }
        }
      }
    }
  }
});
