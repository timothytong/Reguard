let socket = io.connect('http://reguard-env.eba-6m9pdiy2.us-east-1.elasticbeanstalk.com/')
socket.emit('device-online', {"uuid": "asd"})
