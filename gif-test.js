if (Meteor.isClient) {

    //video variables
    var start = "";
    var end = "";
    var image = "";
    var speed = "";
    var speedrate = "";
    var URL = "";
    var canvas = "";
    var context = "";
    var gifText = "";
    var options = "";

    var flag = false;
    var delay = 100; //default speed

    var cw,ch;

    //slider variables
    var videoLength = 50;
    var videoSrc = "";
    var startTime = 8;
    var endValue = 13;

    var encoder = new GIFEncoder(); 
    var worker = new Worker('w.js');

    worker.addEventListener('message', function(e) {
        document.getElementById("output").innerHTML = "Done. Look below.";
        image.src = e.data;
    }, false);


    var draw = function(videoSrc, videoCanvas, width, height) {
        if(videoSrc.paused || videoSrc.ended) 
            return false;

        context.drawImage(videoSrc, 0, 0, width, height);
        if(gifText != "")
        {
            document.getElementById("textColor");
            context.font = "bold 20pt Arial";
            context.textAlign="center"; 
            if(textColor.value != null)
                context.fillStyle = textColor.value;
            context.fillText(gifText.value, (width/2), (height-20));
        }

        if(flag == true){
            var imdata = context.getImageData(0, 0, width, height);
            worker.postMessage({frame: imdata});
        }
        setTimeout(draw,delay,videoSrc,videoCanvas,width,height);
    }

    Template.videoOutput.rendered = function() {
        //initiate video
        start = document.getElementById("start-button");
        end = document.getElementById("end-button");
        image = document.getElementById('image');
        speed = document.getElementById("speed");
        speedrate = document.getElementById("speedrate");
        URL = window.URL || window.webkitURL;
        canvas = document.getElementById("videoCanvas");
        context = canvas.getContext('2d');

        //create the slider
        $(".slider").noUiSlider({
          start: [0,50],
          connect: true,
          range: {
            'min': 0,
            'max': videoLength
          },
          serialization: {
            format: wNumb({
              decimals: 3
            })
          }
        });
    }

    Template.videoOutput.events({ 

        //control play speed
        "change #speedrate": function() {
            var s = this.value;
            delay = s;
            speedrate.innerHTML = s;        
        },

        //get gif text
        "change #gifText": function() {
            gifText = document.getElementById("gifText");
        },

        //get canvas width and height
        "play #videoSrc": function() {
            cw = videoSrc.clientWidth;
            ch = videoSrc.clientHeight;
            canvas.width = cw;
            canvas.height = ch;
            draw(videoSrc,context,cw,ch);           
        },

        // "click #start-button": function (event, template) {
        //     //prevents page from being refreshed
        //     event.preventDefault();
        //     flag = true;
        //     worker.postMessage({delay:delay,w:cw,h:ch});
        //     document.getElementById("output").innerHTML = "Capturing video frames.";
        // },

        // "click #end-button": function (event, template) {
        //     event.preventDefault();
        //     flag = false;
        //     worker.postMessage({});
        //     document.getElementById("output").innerHTML = "Processing the GIF.";
        // },

        "click #start-button": function(event, template) {
            event.preventDefault();
            flag = true;

            videoSrc = document.getElementById("videoSrc");
            videoSrc.currentTime = startTime;

            worker.postMessage({delay:delay,w:cw,h:ch});
            document.getElementById("output").innerHTML = "Capturing video frames.";           
        },

        //if timeupdate and flag == true
        //done capturing video, set flag to false

        "change #fileName": function (event, template) {
            var file = event.target.files[0];
            videoSrc = document.getElementById("videoSrc");
            if(file.type.match(/video\/*/)) {
                document.getElementById("output").innerHTML = "";
                var url = URL.createObjectURL(file);
                videoSrc.src = url;
            }
            else {
                document.getElementById("output").innerHTML = "This file does not seem to be a video.";
            }
        },


        /* start of slider functions */

        //update with given video
        'loadedmetadata #videoSrc': function(ev, val) {
            videoSrc = document.getElementById("videoSrc");
            sliderGroup = document.getElementById("slider-group");
            console.log(sliderGroup);
            videoLength = videoSrc.duration;
            endValue = videoLength;
            console.log(videoLength);
            $('.slider').noUiSlider({
              start: [(videoLength/4),(3*videoLength/4)],
              range: {
                'min': 0,
                'max': videoLength
              }
            }, true);
            sliderGroup.style.visibility = "visible";

            //change start and end text values
          $(".slider").Link('lower').to($('#startTime'), "text");
          startTime = document.getElementById("startTime");
          startTime = startTime.innerHTML;
          videoSrc.currentTime = startTime;

          $(".slider").Link('upper').to($('#endTime'), "text");
          endTime = document.getElementById("endTime");
          endValue = endTime.innerHTML;
        },

        //change lower and upper values on slider depending on where user slides it to
        'change .slider': function() {
          $(".slider").Link('lower').to($('#startTime'), "text");
          startTime = document.getElementById("startTime");
          startTime = startTime.innerHTML;
          videoSrc.currentTime = startTime;

          $(".slider").Link('upper').to($('#endTime'), "text");
          endTime = document.getElementById("endTime");
          endValue = endTime.innerHTML;
        },

        //start from startTime when slider changes
        //PART OF CREATING GIF FUNCTION: ends gif processing when endValue is reached
        'timeupdate #videoSrc': function() {
            videoSrc = document.getElementById("videoSrc");
            if(videoSrc.currentTime > endValue) {
              videoSrc.currentTime = startTime;
              if(flag) {
                    flag = false;
                    worker.postMessage({});
                    document.getElementById("output").innerHTML = "Processing the GIF.";
              }
            }
        }

        /* end of slider functions */
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
