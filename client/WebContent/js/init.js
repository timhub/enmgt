$(function() {
    //parse json
    var parseJson = function(json) {
        keyword = "word";
        var sentence = [];
        for(var i = 0; i < json.length; i++) {
            var video = json[i];
            var captions = video.captions;
            for(var j = 0; j < captions.length; j++) {
                if(captions[j].sentence.indexOf(keyword) >= 0) {
                    sentence.push(captions[j]);
                }
            }
        }
        return sentence;
    };
    
    var renderSentence = function(sentence) {
        $(sentence).each(function(index, elem) {
            $('<div style="cursor: pointer;">' + elem.sentence + '<div>').appendTo($("#sentenceArea")).click(function(){    
                openVideo('panda.mp4', elem.startTime, elem.endTime)
            });
        });
        
    };
    
    $.ajax({
        type: "GET",
        url: "assets/json_example.json",
        dataType: "json"
      }).done(function(data) {
          var sentence = parseJson(data.data);
          renderSentence(sentence);
      }).fail(function( jqXHR, textStatus ) {
          alert( "Request failed: " + textStatus );
      });
    //search keyword from json
});

function openVideo(videoName, startSec, endSec) {
    $( "#dialog" ).show().dialog({width: "500px", height: "400px", modal: true});
    $( "#sampleVideo").empty();
    $( "#sampleVideo").append("<source src='" + videoName + "'>");
    $( "#sampleVideo").on('loadedmetadata', function() {
        var sampleVideo = this;
        sampleVideo.currentTime = startSec;
        sampleVideo.play();
        
        timeout = setTimeout(function() {
            clearTimeout(timeout);
            sampleVideo.pause();
        }, 1000 * (endSec - startSec));
        
        $('#replay').unbind('click');
        $('#replay').click(function() {
            clearTimeout(timeout);
            sampleVideo.currentTime = startSec;
            sampleVideo.play();
            
            timeout = setTimeout(function() {
                clearTimeout(timeout);
                sampleVideo.pause();
            }, 1000 * (endSec - startSec));
        });
    });
}
