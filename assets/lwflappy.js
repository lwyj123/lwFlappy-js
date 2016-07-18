$(function(){
    var st = {
        treeSpeed:30,               //障碍移动速度 单位 px/帧
        mainTimeLineInterval:30,   //主时间轴速度 单位 ms/帧
        creatTreeInterval:60,      //创建障碍的间隔 单位 帧
        treeWidth:100,             //树宽 单位 px
        treeHeightDiffLimit:30     //障碍缺口的高度变化限制 单位 屏幕高度%
    };

    var $start = $('#start').show();
    var $gameover = $('#gameover').hide();
    var gameStartFlag = false;
    var gameOverFlag = false;
    window.t = 0;
    //主时间轴
    var mainTime = false;
    var birdFall = false;


    //游戏启动
    var gameStart = function() {
        $start.hide();
        if(!!mainTime){
            return;
        }
        mainTime = setInterval(function() {
            window.t++;
            mainTimeLine(t)
        }, st.mainTimeLineInterval);

    };

    //resize和初始化的时候设置屏幕大小，用于响应式
    var setWindow = function() {
        _h = $(window).height();
        _w = $(window).width();  
    };
    setWindow();

    //主时间轴函数，每一段时间会调用这个函数
    //传入调用定时器次数，以便创建障碍物
    var mainTimeLine = function(t) {
        treeMove();
        if(window.t%st.creatTreeInterval == 0) {
            createTree();

        }
    };

    //传入一个jquery对象(障碍物),每一次调用都会修正障碍物的位置并移除区域外的障碍物
    var calcPosition = function($this) {
        var left = $this.offset().left;
        if(left < -st.treeWidth) {
            $this.remove();
            return;
        }
        else if(left > (_w-st.treeWidth)/2 - 60 && left < (_w+st.treeWidth)/2 - 20) {
            if(!$this.hasClass("center")) {
                $this.addClass("center");
            }
        }
        else {
            $this.removeClass("center");
        }

        $this.css('left', left - st.treeSpeed);
    }

    //gameover后的处理
    var gameOver = function(){
        gameStartFlag = false;
        gameOverFlag = true;
        clearTimeout(mainTime);
        clearTimeout(birdFall);
        $gameover.show();
    }

    //传入鸟的高度，判断是否撞树
    var checkBirdPosition = function(y) {
        var $centerTree = $('.tree.center');
        if($centerTree.length == 0) {
            return true;
        }

        var midline = $centerTree.offset().top + $centerTree.height()/2;
        if(y > midline + 80 || y < midline - 120) {
            return false;
        }
        return true;
    }

    //(每一次空格)重置鸟的速度，初始速度向上
    var resetBirdSpeed = function() {
        var $bird = $('.the-bird');
        var now_y = $bird.offset().top;
        if(!!birdFall) {
            clearTimeout(birdFall);
        }
        var bird_t = 0;
        birdFall = setInterval(function() {
            bird_t++;
            var q = -10;
            var y = now_y + Math.pow( ( bird_t + q ) ,2) - 100;
            if(y > _h || !checkBirdPosition(y)) {
                gameOver();
                return;
            }
            $bird.css('top', y+'px');
        }, st.mainTimeLineInterval);
    }

    //用于移动所有的树
    var treeMove = function() {
        $('.tree').each(function() {
            calcPosition($(this));
        });
    };

    //创建一个障碍物
    var createTree = function() {
        // 生成随机障碍，这里使用百分比表示高度
        var r = parseInt(Math.random()*80) + 10;

        var percent = r -100+"%";
        var h = _h -100 + 'px';
        var $div = $('<div>');
        $div.addClass('tree').css({
            'top':percent,
            'width':st.treeWidth+'px'
        }).appendTo('#background');
        $div.append('<div class="before" style="height:'+h+'"></div><div class="after" style="height:'+h+'"></div>');
        lastTreeHeight = r;
    };

    //重置游戏
    var resetGame = function() {
        $('.tree').remove();
        $('.the-bird').css('top','50%');
        gameStartFlag = false;
        gameOverFlag = false;
        window.t = 0;
        //主时间轴
        mainTime = false;
        birdFall = false;
        $gameover.hide();
        $start.show();
    }


    //添加事件的一坨
    $(window).off().on('keydown',function(e){
        switch(e.keyCode){
            // "ESC"
            case 27:
                resetGame();
                break;
            // "Space"
            case 32:
                if( !gameOverFlag ){
                    gameStart();
                    resetBirdSpeed();
                }
                break;
        }
    }).on('resize',function(){
        setWindow();
    });

})