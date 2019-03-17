const { RTMClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN || 'xoxb-550778942626-580224021367-CcpPpmIFaud13ke0NFPK7SSt';
const rtm = new RTMClient(token);
rtm.start();

// variables
const moment = require('moment-timezone');
var isRecording = false;
var channel = undefined;
var first = true;
var user = undefined;
var start_time = undefined;
var data = [];

// 모든 메세지
rtm.on('message', (message) => {
    var text = message.text;

    // text 가 undefined 로 들어오는 경우가 있음.
    if (text != undefined){
    
    try {
        // 출석
        if(message.channel == "CH0UYMVBN"){
            if (text.includes("출석") && text.includes("시작")){
                if(isRecording == false){
                    channel = message.channel;
                    user = message.user;
                    isRecording = true;
                    start_time = text.replace("출석 시작 ", "");
                    rtm.sendMessage(moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm a') + " 출석 체크를 진행합니다." + "\n1./ 'c : 백승호' / 지금 도착한 경우" + "\n2./ 'r : 백승호 10:30' / 출석을 늦게 한 경우", message.channel);
                } else{
                    rtm.sendMessage("이미 출석 체크를 진행하고 있습니다.", message.channel);
                }
            } else if (text.includes("출석") && text.includes("종료") && isRecording == true){
                if(channel == message.channel&&user == message.user){
                    var res = "";
                    for(var i = 0 ; i < data.length ; i++){
                        res = res + data[i].name + ", " + data[i].late + "분\n";
                    }
                    rtm.sendMessage("출석 체크가 종료되었습니다.\n" + moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm a') + "\n" + res, message.channel);

                    // 파일 생성 및 입력
                    var fs = require('fs');
                    var file_name = moment().tz('Asia/Seoul').format('MMM Do YYYY') + ".txt";
                    fs.writeFile(file_name, res, 'utf-8', function(error){ console.log('write end') });

                    // 초기화
                    isRecording = false;
                    user = undefined;
                    first = true;
                    data = [];
                    start_time = undefined;
                }else {
                    rtm.sendMessage("출석을 시작한 사람이 출석을 시작한 채널에서 회의를 종료해야 합니다.", message.channel);
                }
            }
            
            if(isRecording == true){
                if(text.startsWith("c :")){
                    var name = text.replace("c : ", "");
                    var time = moment().tz('Asia/Seoul').format('h:mm');
                    var late = is_late(start_time, time);
                    if(late > 0) {
                        data.push({"late": late, "name": name});
                        rtm.sendMessage(name + "씨 " + late + "분 늦었습니다.", message.channel);
                    }
                } else if(text.startsWith("r :")){
                    var arr = text.replace("r : ", "").split(" ");
                    var late = is_late(start_time, arr[1])
                    if(late > 0){
                        data.push({"late": late, "name": arr[0]});
                        rtm.sendMessage(arr[0] + "씨 " + late + "분 늦었습니다.", message.channel);
                    }
                } else {
                    if (first == false) {
                        rtm.sendMessage("정확하게 입력 해 주세요.", message.channel);
                    }
                }
                first = false;
            }
        }
        
        console.log(text);

        if (text.includes("logo") || text.includes("로고")){
            rtm.sendMessage("https://drive.google.com/open?id=1yqMSxqzMNCj1dCokpsslU29upQN5jzZi",
            message.channel);
        } else if (text.includes("주제") || text.includes("성문화")){
            rtm.sendMessage("https://icists.slack.com/archives/CG6EKF14Z/p1550545483000500", message.channel);
        } else if (text.includes("OC") && text.includes("정보")){
            rtm.sendMessage("https://icists.org/info", message.channel);        
        } else if (text.includes("디벨롭") && text.includes("요청")) {
            rtm.sendMessage("디벨롭 요청 절차는\n" + 
                "0./ 가능한 일인지 td 부원한테 간단히 확인 한다.\n" +
                "1./ https://drive.google.com/open?id=15e28xDdWMOfnW27UIfG4wJMr_trS2fK8 를 읽어본다.\n" + 
                "2./ https://cafe.naver.com/icistsoc 에 업로드 한다.\n" +
                "3./ 디벨롭에 대한 이런 저런 문의는 #td_dev_req 에서",
                message.channel)
        } else if (text.includes("예산 신청")){
            rtm.sendMessage("https://drive.google.com/drive/folders/1TfduSF3rP7Kbv_FfVU1ahEHO23QtQWTu?usp=sharing", message.channel);
        } else if (text.includes("irs")) {
            rtm.sendMessage("https://drive.google.com/drive/folders/1OSjqiz0vzodil2k9Bcwe97BXXZilPuSO?usp=sharing", message.channel);
        }
        else if (text.includes("help")){
            rtm.sendMessage("Type @ho with " + "\n" + 
                "#attend 에서만 '출석 시작 10:30' and '출석 종료' 가능" + "\n" +
                "'logo' or '로고' / " + "'주제' or '성문화' /" + " 'OC 정보' /" + " '디벨롭 요청' /" + " '예산 신청' or 'irs'", message.channel);
        }
    } catch (err) {
        rtm.sendMessage("error : " + err, message.channel);
    }
    
    } 
});

// fun
function is_late(base, cmp) {
    var arr_1 = base.split(":");
    var arr_2 = cmp.split(":");
    base = (Number)(arr_1[0]) * 60 + (Number)(arr_1[1]);
    cmp = (Number)(arr_2[0]) * 60 + (Number)(arr_2[1]);
    return cmp - base;
}