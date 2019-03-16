const { RTMClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN || 'xoxb-555076495158-579009083892-BGz7XE0qh5qQ4ae04oEXu6Xk';
const rtm = new RTMClient(token);
rtm.start();

// variables
const moment = require('moment-timezone');
var isRecording = false;
var channel = undefined;
var first = true;
var user = undefined;

var data = [];

// 모든 메세지
rtm.on('message', (message) => {
    var text = message.text;

    // 출석
    if(message.channel == "CG9HLRGLU"){
        if (text.includes("출석") && text.includes("시작")){
            if(isRecording == false){
                channel = message.channel;
                user = message.user;
                isRecording = true;
                rtm.sendMessage(moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm:ss a') + " 출석 체크를 진행합니다." + "\n지금 도착한 경우 'c : 백승호' 와 같이 입력해 주세요." + "\n 출석 체크를 늦게 한 경우 'r : 백승호 10:30:51' 과 같이 입력해 주세요.", message.channel);
            } else{
                rtm.sendMessage("이미 출석 체크를 진행하고 있습니다.", message.channel);
            }
        } else if (text.includes("출석") && text.includes("종료") && isRecording == true){
            if(channel == message.channel&&user == message.user){
                isRecording = false;
                channel = undefined;
                user = undefined;
                first = true;
                rtm.sendMessage("출석 체크가 종료되었습니다.\n" + moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm:ss a'), message.channel);
                if(data.length != 0){
                    rtm.sendMessage(data[0].time, message.channel);
                }
            }else {
                rtm.sendMessage("출석을 시작한 사람이 출석을 시작한 채널에서 회의를 종료해야 합니다.", message.channel);
            }
        }
        
        if(isRecording == true){
            if(text.startsWith("c :")){
                var name = text.replace("c : ", "");
                var time = 
                data.push({"time": moment().tz('Asia/Seoul').format('h:mm:ss'), "name": name});
            } else if(text.startsWith("r :")){
                var arr = text.replace("r : ", "").split(" ");
                data.push({"time": arr[1], "name": arr[0]});
            } else {
                if (first == false) {
                    rtm.sendMessage("정확하게 입력 해 주세요.", message.channel);
                }
            }
            first = false;
        }
    }

    if (text.includes("logo") || text.includes("로고")){
        rtm.sendMessage("https://drive.google.com/open?id=1yqMSxqzMNCj1dCokpsslU29upQN5jzZi",
        message.channel);
    } else if (text.includes("주제") || text.includes("성문화")){
        rtm.sendMessage("https://icists.slack.com/archives/CG6EKF14Z/p1550545483000500", message.channel);
    } else if (text.includes("help")){
        rtm.sendMessage("Type @ho with " + "\n" + "'logo' or '로고' / " + "'주제' or '성문화'", message.channel);
    }
});