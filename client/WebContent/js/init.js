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
