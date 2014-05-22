var timeoutFn = function() {
    clearTimeout(timeoutFn);
    $( "#sampleVideo")[0].pause();
};

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
            $('<div style="cursor: pointer;">' + elem.sentence + '----from ' + elem.startTime + ' seconds' + '----to ' + elem.endTime + ' seconds<div>').appendTo($("#sentenceArea")).click(function(){    
                openVideo('a.mp4', elem.startTime, elem.endTime);
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

function hideGrayPanel(){
    $("#graypanel").hide();
}

function openVideo(videoName, startSec, endSec) {
    $("#graypanel").show();
    // $( "#dialog" ).show().dialog({
    //     width: "626px", 
    //     height: "383px", 
    //     modal: false, 
    //     close: function(event,ui){
    //         $("#graypanel").hide();
    //     }});
    $( "#sampleVideo").empty();
    $( "#sampleVideo").append("<source src='" + videoName + "' type='video/mp4'>");
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
