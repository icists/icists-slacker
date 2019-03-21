const { RTMClient, WebClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN || 'xoxb-550778942626-579012696386-CTzWXjIFlYyrEnbDBf3jbVy8';
const rtm = new RTMClient(token);
const web = new WebClient(token);

// channel values
const attend_channel = "CH0UYMVBN";

// variables for attendance check
const moment = require('./lib/moment-timezone');
let is_recording = false;
let channel = undefined;
let first = true;
let checker_user = undefined;
let start_time = undefined;
let data = [];

const bot_func = {
    HELP: 'help',
    ATTEND: {
        START: 'attendance_check_start',
        ENROLL_AUTO: 'attendacne_check_enroll_auto',
        ENROLL_MANU: 'attendance_check_enroll_manually',
        END: 'attendance_check_end'
    },
    LOGO: 'logo',
    TOPIC: 'topic',
    OC: 'oc_info',
    DEV_REQ: 'develop_request',
    BUDGET: 'budget',
    IRS: 'irs',
    SPEAKERS: 'speakers',
    VECTOR_MEETING: 'vector_meeting',
    WEATHER: 'weather'
}

function init_attendance_check_variables() {
    is_recording = false;
    checker_user = undefined;
    first = true;
    data = [];
    start_time = undefined;
}

function parse_msg_txt(text) {
    if (text.includes("help")) {
        return bot_func.HELP;
    }
    else if (text.includes("출석") && text.includes("시작")) {
        return bot_func.ATTEND.START;
    }
    else if (text.includes("출석") && text.includes("종료")) {
        return bot_func.ATTEND.END;
    }
    else if (text.startsWith("c :")) {
        return bot_func.ATTEND.ENROLL_AUTO;
    }
    else if (text.startsWith("r :")) {
        return bot_func.ATTEND.ENROLL_MANU;
    }
    else if (text.includes("logo") || text.includes("로고")) {
        return bot_func.LOGO;
    }
    else if (text.includes("주제") || text.includes("성문화")) {
        return bot_func.TOPIC;
    }
    else if (text.includes("OC") && text.includes("정보")) {
        return bot_func.OC;
    }
    else if (text.includes("디벨롭") && text.includes("요청")) {
        return bot_func.DEV_REQ;
    }
    else if (text.includes("예산 신청")) {
        return bot_func.BUDGET;
    }
    else if (text.includes("irs")) {
        return bot_func.IRS;
    }
    else if (text.includes("벡미록")) {
        return bot_func.VECTOR_MEETING;
    }
    else if (text.includes("연사")) {
        return bot_func.SPEAKERS;
    }
    else if (text.includes("날씨")) {
        return bot_func.WEATHER;
    }
}

rtm.start();
// catch all messages
rtm.on('message', (message) => {
    let text = message.text;

    if (text == undefined) return;
    
    try {
        // 출석
        // if the message comes from attend channel
        request = parse_msg_txt(text);

        console.log(text);

        switch (request) {
            case bot_func.ATTEND.START:
                if (message.channel == attend_channel) {
                    if (is_recording == true) {
                        rtm.sendMessage("이미 출석 체크를 진행하고 있습니다.", message.channel);
                        return;
                    }
                    channel = message.channel;
                    checker_user = message.user;
                    is_recording = true;
                    start_time = text.replace("출석 시작 ", "");
                    rtm.sendMessage(moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm a') + " 출석 체크를 진행합니다." + "\n1./ 'c : 백승호' / 지금 도착한 경우" + "\n2./ 'r : 백승호 10:30' / 출석을 늦게 한 경우", message.channel);
                }
                first = false;
                break;
            case bot_func.ATTEND.END:
                if (message.channel == attend_channel) {
                    if (is_recording == false) {
                        rtm.sendMessage("출석이 시작되지 않았습니다.", message.channel);
                        return;
                    }
                    if (checker_user != message.user) {
                        rtm.sendMessage("출석을 시작한 사람이 출석을 시작한 채널에서 회의를 종료해야 합니다.", message.channel);
                        return;
                    }
                    let res = "";
                    for (var i = 0; i < data.length; i++) {
                        res = res + data[i].name + ", " + data[i].late + "분\n";
                    }
                    rtm.sendMessage("출석 체크가 종료되었습니다.\n" + moment().tz('Asia/Seoul').format('MMMM Do YYYY, h:mm a') + "\n" + res, message.channel);

                    // 파일 생성 및 입력
                    let fs = require('fs');
                    let file_name = moment().tz('Asia/Seoul').format('MMM Do YYYY') + ".txt";
                    fs.writeFile(file_name, res, 'utf-8', function (error) { console.log('write end') });

                    init_attendance_check_variables()
                }
                break;
            case bot_func.ATTEND.ENROLL_AUTO:
                if (is_recording) {
                    let name = text.replace("c : ", "");
                    let time = moment().tz('Asia/Seoul').format('h:mm');
                    let late = is_late(start_time, time);
                    if (late > 0) {
                        data.push({ "late": late, "name": name });
                        rtm.sendMessage(name + "씨 " + late + "분 늦었습니다.", message.channel);
                    }
                }
                first = false;
                break;
            case bot_func.ATTEND.ENROLL_MANU:
                if (is_recording) {
                    let arr = text.replace("r : ", "").split(" ");
                    let late = is_late(start_time, arr[1])
                    if (late > 0) {
                        data.push({ "late": late, "name": arr[0] });
                        rtm.sendMessage(arr[0] + "씨 " + late + "분 늦었습니다.", message.channel);
                    }
                }
                first = false;
                break;
            case bot_func.HELP:
                rtm.sendMessage("Type @helper with " + "\n" +
                    "#attend 에서만 '출석 시작 10:30' and '출석 종료' 가능" + "\n" +
                    "'logo' or '로고' / " +
                    "'주제' or '성문화' /" +
                    " 'OC 정보' /" +
                    " '디벨롭 요청' /" +
                    " '예산 신청' or 'irs' /" +
                    " '벡미록' /" +
                    " '연사'",
                    message.channel);
                break;
            case bot_func.LOGO:
                rtm.sendMessage("https://drive.google.com/open?id=1yqMSxqzMNCj1dCokpsslU29upQN5jzZi",
                    message.channel);
                break;
            case bot_func.TOPIC:
                rtm.sendMessage("https://icists.slack.com/archives/CG6EKF14Z/p1550545483000500", message.channel);
                break;
            case bot_func.OC:
                rtm.sendMessage("업데이트 예정입니다.", message.channel);
                break;
            case bot_func.DEV_REQ:
                rtm.sendMessage("디벨롭 요청 절차는\n" +
                    "0./ 가능한 일인지 td 부원한테 간단히 확인 한다.\n" +
                    "1./ https://drive.google.com/open?id=15e28xDdWMOfnW27UIfG4wJMr_trS2fK8 를 읽어본다.\n" +
                    "2./ https://cafe.naver.com/icistsoc 에 업로드 한다.\n" +
                    "3./ 디벨롭에 대한 이런 저런 문의는 #td_dev_req 에서",
                    message.channel);
                break;
            case bot_func.BUDGET:
                rtm.sendMessage("https://drive.google.com/drive/folders/1TfduSF3rP7Kbv_FfVU1ahEHO23QtQWTu?usp=sharing", message.channel);
                break;
            case bot_func.IRS:
                rtm.sendMessage("https://drive.google.com/drive/folders/1OSjqiz0vzodil2k9Bcwe97BXXZilPuSO?usp=sharing", message.channel);
                break;
            case bot_func.VECTOR_MEETING:
                rtm.sendMessage("https://drive.google.com/drive/folders/1sJiRuOCRgeJWD-K6F21Fbzx64od__6KF?usp=sharing", message.channel);
                break;
            case bot_func.SPEAKERS:
                rtm.sendMessage("유재준 : 7월 29일\n김치앤칩스 스튜디오 : 8월 1일\n그 외 무수히 많은 긍정적인 답변:clapping:", message.channel);
                break;
            case bot_func.WEATHER:
                weatherFN(function (body) { rtm.sendMessage(body, message.channel); })
                break;
            default:
                if (message.channel == attend_channel && is_recording && first == false) {
                    rtm.sendMessage("정확히 입력해주세요.", message.channel);
                    break;
                }
                rtm.sendMessage("'help'를 쳐서 사용법을 확인해보세요!", message.channel);
                break;
        }
    }

    catch (err){
        rtm.sendMessage("error : " + err, message.channel);
    }
});

// fun
function is_late(base, cmp){
    var arr_1 = base.split(":");
    var arr_2 = cmp.split(":");
    base = (Number)(arr_1[0]) * 60 + (Number)(arr_1[1]);
    cmp = (Number)(arr_2[0]) * 60 + (Number)(arr_2[1]);
    return cmp - base;
}

const lat = 37.518252;
const long = 127.023549;
const DARK_API_KEY = "671ceb0806fa18629ad632450b858a5a";
const requst = require('request');

function weatherFN(callback) {
    requst(`https://apu.darksky.net/forcast/${DARK_API_KEY}/${lat},${long}?lang=ko&units=si`, {json:true}, (err,res,body) => {
        if(err) {return console.log(err);}
        var w1 = body.currently.summary;
        var w2 = body.currently.temperature + "℃"
        var w3 = body.currently.humidity * 100 + "%"
        var weatherValue = "날씨 : " + w1 + "\n기온 : " + w2 + "\n습도 : " + w3
        callback (weatherValue);
    });
};