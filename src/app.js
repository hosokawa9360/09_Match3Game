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
//マウスが描くパスを描画で追加
var arrowsLayer;

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
    //マウスでなぞった線を配置するレイヤ
		arrowsLayer = cc.DrawNode.create();
		this.addChild(arrowsLayer);


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
		arrowsLayer.clear();//描画領域をクリア

    startColor = null; //プレイヤがマウスを話したとき、コマの選択をnull(リセットする）
    for (i = 0; i < visitedTiles.length; i++) {
      //連鎖しているコマの数が３未満なら、消さずに初期状態にもどす
      if (visitedTiles.length < 3) {
        tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
        tileArray[visitedTiles[i].row][visitedTiles[i].col].picked = false;
      } else {
        //連鎖しているコマの数は３つ以上
        orbLayer.removeChild(tileArray[visitedTiles[i].row][visitedTiles[i].col]);
        //消去する
        tileArray[visitedTiles[i].row][visitedTiles[i].col] = null;
      }
    }
    //消去されたあと、空いているマスにコマを落す処理　
    //連鎖しているコマが3つ以上あった場合
    if (visitedTiles.length >= 3) {
      //コマが消去されている行、列を探す
      //列
      for (i = 1; i < fieldSize; i++) {
        //行
        for (j = 0; j < fieldSize; j++) {
          if (tileArray[i][j] != null) {
            var holesBelow = 0;
            for (var k = i - 1; k >= 0; k--) {
              if (tileArray[k][j] == null) {
                holesBelow++;
              }
            }
            if (holesBelow > 0) {
              var moveAction = cc.MoveTo.create(0.5, new cc.Point(tileArray[i][j].x, tileArray[i][j].y - holesBelow * tileSize));
              // cc,moveTo() can also be used
              tileArray[i][j].runAction(moveAction);
              tileArray[i - holesBelow][j] = tileArray[i][j];
              tileArray[i][j] = null;
            }
          }
        }
      }
      //新しいコマを生成し、空いた場所を埋める処理
      for (i = 0; i < fieldSize; i++) {
        //ｊは行　ある列の最上行から下方向に検索
        for (j = fieldSize - 1; j >= 0; j--) {
          //コマがあったら、break jが fieldSize - 1 より少なければ空白ありの証拠
          if (tileArray[j][i] != null) {
            break; //jはその列の残っているコマの数
          }
        }
        //１列に配置できるコマの最大値-その列に残っているコマの数は空白の数
        //つまりはその列に落さなければならないコマの数
        var missingGlobes = fieldSize - 1 - j;
        console.log(missingGlobes);
        if (missingGlobes > 0) {
          //落さなければならないコマの数だけ、コマを生成し落すfallTile関数を実行する
          for (j = 0; j < missingGlobes; j++) {
            //目標の行、目標の列、落下時の高さを引数として与える
            this.fallTile(fieldSize - j - 1, i, missingGlobes - j)
          }
        }
      }

    }
    visitedTiles = [];
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
					//線を描く
					console.log("線を描く");
					this.drawPath();
        }
        //条件２　現在のコマは、すでに選択状態にあり、picked属性はtrueとなっている
        else {
          //条件３　現在のコマは、visidedTiled配列の最後から2版目要素である
          if (visitedTiles.length >= 2 && currentRow == visitedTiles[visitedTiles.length - 2].row && currentCol == visitedTiles[visitedTiles.length - 2].col) {
            //透明度も255に戻される。
            tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].setOpacity(255);
            //picked属性はデフォルト値であるfalse,
            tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].picked = false;
            //最後に選択移動したコマの情報を連鎖チェーンから削除
            visitedTiles.pop();
          }
        }
      }
    }
  },
  //コマを生成し落す関数 fallTile　  引数：目標の行、目標の列、落下時の高さ
  fallTile:function(row,col,height){
    //タイルの色の表す番号
         var randomTile = Math.floor(Math.random()*tileTypes.length);
         var spriteFrame = cc.spriteFrameCache.getSpriteFrame(tileTypes[randomTile]);
         var sprite = cc.Sprite.createWithSpriteFrame(spriteFrame);
         sprite.val = randomTile;
         sprite.picked = false;
         orbLayer.addChild(sprite,0);
         sprite.setPosition(col*tileSize+tileSize/2,(fieldSize+height)*tileSize);
         var moveAction = cc.MoveTo.create(0.5, new cc.Point(col*tileSize+tileSize/2,row*tileSize+tileSize/2));
         sprite.runAction(moveAction);
         tileArray[row][col] = sprite;
     },
		 //マウスがなぞったところに線を表示する
    drawPath:function(){
        arrowsLayer.clear();
        if(visitedTiles.length>0){
            for(var i=1;i<visitedTiles.length;i++){
                arrowsLayer.drawSegment(new cc.Point(visitedTiles[i-1].col*tileSize+tileSize/2,visitedTiles[i-1].row*tileSize+tileSize/2),new cc.Point(visitedTiles[i].col*tileSize+tileSize/2,visitedTiles[i].row*tileSize+tileSize/2), 4,cc.color(255, 255, 255, 255));
            }
        }
    }

});
