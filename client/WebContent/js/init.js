var timeoutFn = function() {
    clearTimeout(timeoutFn);
    $( "#sampleVideo")[0].pause();
};
var json = '', resultSentence = null, filterArea = [],filterYear = [];

$(function() {
    var getFilterData = function() {
        $(json).each(function(index, elem) {
            if(filterArea.indexOf(elem.area) < 0) {
                filterArea.push(elem.area);
            }
            if(filterYear.indexOf(elem.year) < 0) {
                filterYear.push(elem.year);
            }
        });
            
        $(filterArea.sort()).each(function(index, elem) {
            $('<option value="' + elem + '">' + elem + '</option>').appendTo('#filterArea');
        });
        $(filterYear.sort()).each(function(index, elem) {
            $('<option value="' + elem + '">' + elem + '</option>').appendTo('#filterYear   ');
        });
    };
    
    $.ajax({
        type: "GET",
        url: "assets/data.json",
        dataType: "json"
      }).done(function(data) {
          json = data.data;
          getFilterData();
      }).fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
      });
});

//parse json
var parseJson = function() {
    keyword = $('#keyword').val();
    var movies = [];
    for(var i = 0; i < json.length; i++) {
        var video = json[i];
        video.sentence = [];
        if($('#filterArea').val()) {
            if(video.area != $('#filterArea').val()) {
                continue;
            }
        }
        if($('#filterYear').val()) {
            if(video.year != $('#filterYear').val()) {
                continue;
            }
        }
        if($('#filterCast').val()) {
            var hasCast = false;
            $(video.cast).each(function(index, elem) {
                if(elem.indexOf($('#filterCast').val()) >= 0) {
                    hasCast = true;
                }
            });
            if(!hasCast) {
                continue;
            }
        }
        var captions = video.captions;
        for(var j = 0; j < captions.length; j++) {
            if(captions[j].sentence.toUpperCase().indexOf(keyword.toUpperCase()) >= 0) {
                var temp = $.extend({}, captions[j]);
                temp.sentence = temp.sentence.split(keyword)[0] + '<span style="color:#0099ff;">' + keyword + '</span>' + temp.sentence.split(keyword)[1];
                video.sentence.push(temp);
                if(movies.indexOf(video) < 0) {
                    movies.push(video);
                }
                
            }
            if(captions[j].chinese.indexOf(keyword) >= 0) {
                var temp = $.extend({}, captions[j]);
                temp.chinese = temp.chinese.split(keyword)[0] + '<span style="color:#0099ff;">' + keyword + '</span>' + temp.chinese.split(keyword)[1];
                video.sentence.push(temp);
                if(movies.indexOf(video) < 0) {
                    movies.push(video);
                }
                
            }
        }
    }
    return movies;
};

var renderSentence = function(sentence) {
    $("#sentenceArea").empty();
    if(sentence.length <= 0) {
        $("#sentenceArea").append('<div style="margin: 25px;">No Movie is found.</div>');
    }
    $(sentence).each(function(index, elem) {
        var movieIndex = index;
        var movie = $('<div class="movie"><div style="float: left;padding: 20px;"><div class="thumbnail"><img width="180" height="120" src="' + elem.name + '.jpg"></img></div><div style="color: #333; margin-top:12px;">' + elem.name + '</div></div></div>').appendTo($("#sentenceArea"));
        var sentenceArea = $('<div class="sentenceArea"></div>').appendTo(movie);
        $(elem.sentence).each(function(index, elem) {
            $('<div style="cursor: pointer;" class="sentence">' + elem.sentence + '<div>').appendTo(sentenceArea).click(function(){    
                openVideo(sentence, movieIndex, index);
				 showContentPanelSentence(movieIndex);
                //openVideo('a.mp4', elem.startTime, elem.endTime);
            });
            $('<div class="sentence" style="">' + elem.chinese + '</div>').appendTo(sentenceArea);
            var operation = $('<div class="operation" style="color: #777; margin-top: 4px;margin-bottom: 34px;"><div style="margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/fav.png)"></div><span>收藏例句</span><div style="margin-left: 15px;margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/play.png)"></div></div>').appendTo(sentenceArea);
            $('<span style="cursor: pointer;">播放例句</span>').appendTo(operation).click(function(){    
                openVideo(sentence, movieIndex, index);
                showContentPanelSentence(movieIndex);
            });;
        });
        $('<div style="height: 1px; background-color: #333;width: 100%;"></div>').appendTo($("#sentenceArea"));
    });
};

function search() {
    if(!$('#keyword').val() || $('#keyword').val().length < 2) {
        return;
    }
    $('#searchWord').html($('#keyword').val());
    var sentence = parseJson();
    renderSentence(sentence);
}

function showContentPanelSentence(movieIndex){
    var sentence = parseJson();
    renderPopupSentence(sentence, movieIndex);
}

var renderPopupSentence = function (sentence, movieIndex){
    var result = sentence[movieIndex];
    $('#content_right').empty();
    $(result.sentence).each(function(index, elem) {
        var contentRightArea = $('#content_right');
        var sentenceArea = $('<div class="contentSentenceArea"></div>').appendTo(contentRightArea);
        $('<div style="cursor: pointer;" class="contentSentence">' + elem.sentence + '<div>').appendTo(sentenceArea).click(function(){    
            openVideo(sentence, movieIndex, index);
            //openVideo('a.mp4', elem.startTime, elem.endTime);
        });
        $('<div class="contentSentence" style="">' + elem.chinese + '</div>').appendTo(sentenceArea);
        var operation = $('<div class="operation" style="color: #fff; margin-top: 4px;margin-bottom: 34px;"><div style="margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/fav.png)"></div><span>收藏例句</span><div style="margin-left: 15px;margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/play.png)"></div></div>').appendTo(sentenceArea);
        $('<span style="cursor: pointer;">播放例句</span>').appendTo(operation).click(function(){    
            openVideo(sentence, movieIndex, index);
        });;
        $('<div style="height: 1px; background-color: #333;width: 100%;"></div>').appendTo($("#sentenceArea"));
    });
};


function displayInstruction(movieIndex){
    $('#movie_instruction').empty();
    var sentence = parseJson();
    var movie = sentence[movieIndex].name;
    if (movie == "Gravity") {
        $('<h1>Gravity</h1><span>地心引力</span></br></br></br><h2>《地心引力》讲述了一个在地球空间站工作的两名男宇航员和一个女宇航员出舱进行器械维修时，遭遇太空碎片袭击导致飞船爆炸事故的故事。由于其他同行全部丧生，所以这部在太空领域内的“密闭空间”式电影人物极少，几乎只有这两位主演，他们将一同面对宇宙的无垠和人类的孤独。</h2>').appendTo($('#movie_instruction'));
    } else if(movie == "Total Recall"){
        $('<h1>Total Recall</h1><span>全面回忆</span></br></br></br><h2>电影由伦·怀斯曼执导，马克·鲍姆贝克担任编剧，柯林·法瑞尔、凯特·贝金赛尔和杰西卡·贝尔联袂出演。影片于2012年10月20日在中国上映。影片改编自著名科幻小说家菲利普·迪克的小说《We Can Remember It for You Wholesale》，讲述道格拉斯·奎德是个普通工人，在一次虚拟旅行之后，奎德的记忆出现了问题，而他也变成了一个被人追杀的“逃犯”。在逃亡的过程中，他发现独裁者哈根的阴谋，在追求正义的过程中，奎德渐渐发现了自己的身份、自己的信仰和自己的命运。</h2>').appendTo($('#movie_instruction'));        
    } else if(movie == "The Dark Knight Rises"){
        $('<h1>The Dark Knight Rises</h1><span>黑暗骑士崛起</span></br></br></br><h2>《蝙蝠侠：黑暗骑士崛起》（The Dark Knight Rises）改编自DC漫画公司的经典超级英雄漫画《蝙蝠侠》，由克里斯托弗·诺兰执导，克里斯蒂安·贝尔，安妮·海瑟薇等主演，是诺兰执导的蝙蝠侠系列三部曲的最终章。前两部分别是2005年的《蝙蝠侠：侠影之谜》和2008年的《蝙蝠侠：黑暗骑士》。影片延续《蝙蝠侠：黑暗骑士》的质感和风格，运用IMAX摄影机进行拍摄，剧情设定为《蝙蝠侠：黑暗骑士》的八年后的冬天展开，描述了布鲁斯·韦恩与贝恩之间的对决。高谭市原本是从一个逐渐和平的城市，但贝恩把整个城市再度陷入乱局，使得韦恩再次以“蝙蝠侠”身份打击贝恩的罪恶，使两人展开了在高谭市的终极决战。影片于2012年7月20日在北美和英国上映。</h2>').appendTo($('#movie_instruction'));        
    } else if(movie == "Skyfall"){
        $('<h1>007:Skyfall</h1><span>007:大破天幕危机</span></br></br></br><h2>由于邦德参与的一个任务失败，军情六处被暴露在了危机之中，M女士也遭遇了质疑,面对这种情况，军情六处的明星特工007只有挺身而出，解决危机，而且，无论付出多大的代价，他一定要拯救出M女士并保全军情六处。作为007史上首部IMAX电影《007之大破天幕杀机》（Skyfall），已于2013年1月21日登陆中国。詹姆斯·邦德 -丹尼尔·克雷格饰 ：伊斯坦堡的任务失败后而失去踪影，外界推测他已身亡M夫人-朱迪·丹奇饰 ：邦德的上司，因为邦德失踪使北约卧底探员资料外泄受到情报安全委员会新主席马洛利的强烈质疑，遂成为ZF调查的对象马洛利 -拉尔夫·费因斯饰 ：情报安全委员会新主席赛菲茵 -贝纳尼丝·玛尔洛饰 ：协助邦德的神秘女子伊芙 -娜奥米·哈里斯饰：协助邦德的探员洛乌西法-哈维尔·巴登饰：在背后搞鬼的神秘人物</h2>').appendTo($('#movie_instruction'));            
    }
}

function searchKeyDown(event) {
    e = event ? event :(window.event ? window.event : null); 
    if(e.keyCode==13){ 
        search();
    } 
}

function openVideo(result, movieIndex, sentenceIndex) {
    var height = document.body.scrollHeight;
    $("#graypanel").css("height", height);
    $("#graypanel").show();
    displayInstruction(movieIndex);

    // $( "#dialog" ).show().dialog({
    //     width: "626px", 
    //     height: "383px", 
    //     modal: false, 
    //     close: function(event,ui){
    //         $("#graypanel").hide();
    //     }});
    $( "#sampleVideo").empty();
    $( "#sampleVideo")[0].load();
    $( "#sampleVideo").append("<source src='" + result[movieIndex].name + ".mp4' type='video/mp4'>");
    $( "#sampleVideo").on('loadedmetadata', function() {
        var startSec = result[movieIndex].sentence[sentenceIndex].startTime - 3;
        var endSec = result[movieIndex].sentence[sentenceIndex].endTime;
        var sampleVideo = this;
        sampleVideo.currentTime = startSec;
        sampleVideo.play();
        
        setTimeout(timeoutFn, 1000 * (endSec - startSec + 3));
        
        $('#replay').unbind('click');
        $('#replay').click(function() {
            clearTimeout(timeoutFn);
            sampleVideo.currentTime = startSec;
            sampleVideo.play();
            
            setTimeout(timeoutFn, 1000 * (endSec - startSec));
        });
    });
}
