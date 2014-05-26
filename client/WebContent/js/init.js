var timeoutFn = function() {
    clearTimeout(timeoutFn);
    $( "#sampleVideo")[0].pause();
};
var json = '', resultSentence = null;

$(function() {
    var renderSentence = function(sentence) {
        $(sentence).each(function(index, elem) {
            $('<div style="cursor: pointer;">' + elem.sentence + '----from ' + elem.startTime + ' seconds' + '----to ' + elem.endTime + ' seconds<div>').appendTo($("#sentenceArea")).click(function(){    
                openVideo('a.mp4', elem.startTime, elem.endTime);
            });
        });
        
    };
    
    $.ajax({
        type: "GET",
        url: "assets/data.json",
        dataType: "json"
      }).done(function(data) {
          json = data.data;
          /*var sentence = parseJson(data.data);
          renderSentence(sentence);*/
      }).fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
      });
    //search keyword from json
});

//parse json
var parseJson = function() {
    keyword = $('#keyword').val();
    var movies = [];
    for(var i = 0; i < json.length; i++) {
        var video = json[i];
        video.sentence = [];
        var captions = video.captions;
        for(var j = 0; j < captions.length; j++) {
            if(captions[j].sentence.indexOf(keyword) >= 0) {
                var temp = $.extend({}, captions[j]);
                temp.sentence = temp.sentence.split(keyword)[0] + '<span style="color:#0099ff;">' + keyword + '</span>' + temp.sentence.split(keyword)[1];
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
    $(sentence).each(function(index, elem) {
        var movieIndex = index;
        var movie = $('<div class="movie"><div style="float: left;padding: 20px;"><div class="thumbnail"></div><div style="color: #333; margin-top:12px;">' + elem.name + '</div></div></div>').appendTo($("#sentenceArea"));
        var sentenceArea = $('<div class="sentenceArea"></div>').appendTo(movie);
        $(elem.sentence).each(function(index, elem) {
            $('<div style="cursor: pointer;" class="sentence">' + elem.sentence + '<div>').appendTo(sentenceArea).click(function(){    
                openVideo(sentence, movieIndex, index);
                //openVideo('a.mp4', elem.startTime, elem.endTime);
            });
            $('<div class="sentence" style="">' + elem.chinese + '</div>').appendTo(sentenceArea);
            $('<div class="operation" style="color: #777; margin-top: 4px;margin-bottom: 34px;"><div style="margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/fav.png)"></div><span>收藏例句</span><div style="margin-left: 15px;margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/play.png)"></div><span style="cursor: pointer;" onclick="openVideo(\'a.mp4\', ' + elem.startTime + ',' + elem.endTime+'); showContentPanelSentence();">播放例句</span></div>').appendTo(sentenceArea);
        });
        $('<div style="height: 1px; background-color: #333;width: 100%;"></div>').appendTo($("#sentenceArea"));
    });
};

function search() {
    if(!$('#keyword').val() || $('#keyword').val().length <= 2) {
        return;
    }
    var sentence = parseJson();
    renderSentence(sentence);
}

function showContentPanelSentence(){
    sentence = parseJson();
    renderPopupSentence(sentence);
}

var renderPopupSentence = function (sentence){
    $('#content_right').empty();
    $(sentence).each(function(index, elem) {
        var sentenceArea = $('#content_right');
        $(elem.sentence).each(function(index, elem) {
            $('<div style="cursor: pointer;" class="popupsentence">' + elem.sentence + '----from ' + elem.startTime + ' seconds' + '----to ' + elem.endTime + ' seconds<div>').appendTo(sentenceArea).click(function(){    
                openVideo('a.mp4', elem.startTime, elem.endTime);
            });
            $('<div class="popupsentence" style="">' + elem.chinese + '</div>').appendTo(sentenceArea);
            $('<div class="operation" style="color: #aaa; margin-top: 10px;margin-bottom: 34px; padding-left:16px;"><div style="margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/fav.png)"></div><span>收藏例句</span><div style="margin-left: 15px;margin-right: 5px;display: inline-block;width:16px;height:16px;background-image:url(assets/play.png)"></div><span style="cursor: pointer;" onclick="openVideo(\'a.mp4\', ' + elem.startTime + ',' + elem.endTime+')">播放例句</span></div>').appendTo(sentenceArea);
        });
        $('<div style="height: 1px; background-color: #333;width: 100%;"></div>').appendTo($("#sentenceArea"));
    });
};

function searchKeyDown(event) {
    e = event ? event :(window.event ? window.event : null); 
    if(e.keyCode==13){ 
        search();
    } 
}

function openVideo(result, movieIndex, sentenceIndex) {
    $("#graypanel").show();
    // $( "#dialog" ).show().dialog({
    //     width: "626px", 
    //     height: "383px", 
    //     modal: false, 
    //     close: function(event,ui){
    //         $("#graypanel").hide();
    //     }});
    $( "#sampleVideo").empty();
    $( "#sampleVideo").append("<source src='" + result[movieIndex].name + ".mp4' type='video/mp4'>");
    $( "#sampleVideo").on('loadedmetadata', function() {
        var sampleVideo = this;
        sampleVideo.currentTime = startSec;
        sampleVideo.play();
        
        setTimeout(timeoutFn, 1000 * (endSec - startSec));
        
        $('#replay').unbind('click');
        $('#replay').click(function() {
            clearTimeout(timeoutFn);
            sampleVideo.currentTime = startSec;
            sampleVideo.play();
            
            setTimeout(timeoutFn, 1000 * (endSec - startSec));
        });
    });
}
