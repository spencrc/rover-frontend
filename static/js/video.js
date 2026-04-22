var RECORD_ON ="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAASFBMVEUAAAAAAADMzMz/AABmZmaZmZnMAABmAACZAAAzAAAzMzP/MzPMZmaZMzPMMzP/MwD/////Zmb/ZgBmMzPMmZmZZmb/mQD/mZlxvxKlAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffCBIMMyVTqZicAAACK0lEQVRIx43W63aDIAwA4KJJhVjrVtfu/d90kASIFlzzp5fDd5KAgJdLJwa8fB6YYojBXz4EQw1EgNPxAGDHqzpDBqDV0EN5DDoToIhagkSAOwb2DIEBRLEWINJf2DQspCQ7AwiUy0M69pEFyCR/xZCl4cTE/CgQtYoU2xZC2J6YiXNHA3ai4uApRwjaj+RBs+JWpKHLcrstiyAz3WjFUFJMk4/jf39+fqPyCdXJLmmwzi4L7+8a8avPhlwtzSQRcY0x3+9z+mSz8bSY0jRJWoEirtdxlM+IluczEXA7In+FbVm8jJ9jqIpmC2nBSjc6XXFZwvS83XwC4/wdI5pRDLczUE6TSJoPisRrDhNCkqFSmTY/pN6ZpIo05pguGZk1qawSKL3PxnznNIGHkDSjK1/q4tZNnlFI0CdNCeiTooRjXVfTTV5PJnggWTxejzNCDfJ6PdYWGd6zXHOWR7ewXi/jOrYJ8PbCvFH8cSGFlBmjQoZC/Dup68LbjAmWR39fWaOu1MRFCNg0rWesrCQTU1njuaxPZW1lX1neYRXwvgy1rkLQGN2WZVOWJHFPDZBPMUTXMVZAvZ+gnolqfBlvT6VEymGJelzryedL7M4+MFdTvIwAnDn8JnPCupbgO7KaeijHLz1xNKzseBVweTPketEQQgDagLAhssFWIl6P5j3OpK5QzgB8lXVufiFoFkl/n71fZIPlDeYsxa64+l7yH1BFUAv6ANgZ7wz/A295IO9de7kCAAAAAElFTkSuQmCC";
var RECORD_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAFVBMVEVvcm0AAAAzMzNmZmbMzMyZmZn///8pcdebAAAAAXRSTlMAQObYZgAAAAFiS0dEAIgFHUgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQffCBINBR5qfIr6AAABv0lEQVQ4y22UQZaCMAyGffo8QED3Q9E9EDmAYzrrgZIbzJv7H2GStFLLmA22H/+fWNLsdi/hd2+DeSHP/A6Qhg9duX/AhVJskAGPoyLsNmACjVrQkMFe3u0hxUKPj5W0BqoWh0YeSxbtb2o1xvyNGPqnCMkLYPr6/SEOABcKqeKbF8mV2UE1KgHysbyDStaQTCKKR8GpYHDoIJVuJ3hcyJZVK1ZanFbuv5XQIypaRBycoupkdkx3kzhBg3NOMl2j3UJ9LS+6NRCufSLyq9KtqBFVPWmi4+KBoUbZkQoUiMHniZTcYYYqmylpjUgBdyVohu2s5HxOpDdiSWbNA3UlZR/lBBqw/CYyIkenRL9ZqjfVFgln0vJckiaTkIkvNYXba57WZRLku03xPHPo2sj9DamVLFuiFZ2pE2IfbkNOQnY32hBdXrR7RoLSzhrhYWQqRNYj/NB281MhsrZiVGJtuYpiw7E16RiajGIrYrxdGHooo0ZMdxQ3BJ8XErHfSrrnxcamlOB65Qu/K+bbLWTOXrxKDKU/JU3I/DoQDsjMgwmYyyFyGNkGj4ykgOXgET8bSf+AqAZ1DIhvBhwivu7/ATYxlvOTH50RAAAAAElFTkSuQmCC";

var alpha, valpha, z;
var beta, vbeta, x;
var gamma, vgamma, y;

var cameraTimer, imuTimer;

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(eventData) {
        gamma = eventData.gamma;
        beta = eventData.beta;
        alpha = eventData.alpha;
    }, false);
}

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', deviceMotionHandler, false);
} else {
    window.alert('acceleration measurements Not supported.');
}

function deviceMotionHandler(eventData) {
    var acceleration = eventData.acceleration;
    x = acceleration.x;
    y = acceleration.y;
    z = acceleration.z;

    var rotation = eventData.rotationRate;
    vgamma = rotation.gamma;  
    vbeta = rotation.beta;
    valpha = rotation.alpha;
}

var ros = new ROSLIB.Ros();
ros.on('connection', function() { console.log('Connected to websocket server.'); });
ros.on('error', function(error) { console.log('Error connecting to websocket server: ', error); window.alert('Error connecting to websocket server'); });
ros.on('close', function() { console.log('Connection to websocket server closed.');});

var imageTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/camera/image/compressed',
    messageType : 'sensor_msgs/CompressedImage'
});

var imuTopic = new ROSLIB.Topic({
    ros : ros,
    name : '/gyro',
    messageType : 'sensor_msgs/Imu'
});

document.getElementById('startstopicon').setAttribute('src', RECORD_OFF);

var hasRunOnce = false,
      video        = document.querySelector('#video'),
      canvas       = document.querySelector('#canvas'),
      width = 640,
      height,           // calculated once video stream size is known
      cameraStream;


function cameraOn() {
    navigator.getMedia = ( navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);

    navigator.getMedia(
    {
        video: true,
        audio: false
    },
    function(stream) {
        cameraStream = stream;
        if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
        } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
    },
    function(err) {
        console.log("An error occured! " + err);
        window.alert("An error occured! " + err);
    }
    );
}

function cameraOff() {
    cameraStream.stop();
    hasRunOnce = false;
    takepicture();                  // blank the screen to prevent last image from staying
}

// function that is run once scale the height of the video stream to match the configured target width
  video.addEventListener('canplay', function(ev){
    if (!hasRunOnce) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      hasRunOnce = true;
    }
  }, false);

// function that is run by trigger several times a second
// takes snapshot of video to canvas, encodes the images as base 64 and sends it to the ROS topic
function takepicture() {
    canvas.width = width;
    canvas.height = height;

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);   

    var data = canvas.toDataURL('image/jpeg');
    var imageMessage = new ROSLIB.Message({
        format : "jpeg",
        data : data.replace("data:image/jpeg;base64,", "")
    });

    imageTopic.publish(imageMessage);
}

function imusnapshot() {
    var beta_radian = ((beta + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    var gamma_radian = ((gamma + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    var alpha_radian = ((alpha + 360) / 360 * 2 * Math.PI) % (2 * Math.PI);
    var eurlerpose = new THREE.Euler(beta_radian, gamma_radian, alpha_radian);
    var quaternionpose = new THREE.Quaternion;
    quaternionpose.setFromEuler(eurlerpose);

    var imuMessage = new ROSLIB.Message({
    header : {
        frame_id : "world"
    },
    orientation : {
        x : quaternionpose.x,
        y : quaternionpose.y,
        z : quaternionpose.z,
        w : quaternionpose.w
    },
    orientation_covariance : [0,0,0,0,0,0,0,0,0],
    angular_velocity : {
        x : vbeta,
        y : vgamma,
        z : valpha,
    },
    angular_velocity_covariance  : [0,0,0,0,0,0,0,0,0],
    linear_acceleration : {
        x : x,
        y : y,
        z : z,
    },
    linear_acceleration_covariance  : [0,0,0,0,0,0,0,0,0],
    });

    imuTopic.publish(imuMessage);
}
// turning on and off the timer that triggers sending pictures and imu information several times a second
startstopicon.addEventListener('click', function(ev){
    if(cameraTimer == null) {
        ros.connect("ws://" + window.location.hostname + ":9090");
        cameraOn();
        cameraTimer = setInterval(function(){
            takepicture();
        }, 250);       // publish an image 4 times per second
        imuTimer = setInterval(function(){
            imusnapshot();
        }, 100);       // publish an IMU message 10 times per second
        document.getElementById('startstopicon').setAttribute('src', RECORD_ON);
    } else {
        ros.close();
        cameraOff();
        clearInterval(cameraTimer);
        clearInterval(imuTimer);
        document.getElementById('startstopicon').setAttribute('src', RECORD_OFF);
        cameraTimer = null;
        imuTimer = null;
    }
}, false);