const { RTMClient } = require('@slack/client');
const token = process.env.SLACK_TOKEN || 'xoxb-550778942626-580224021367-SoEAPXqDhGdxyIQGc83aNclA';
const rtm = new RTMClient(token);
rtm.start();

// 모든 메세지
rtm.on('message', (message) => {
    var text = message.text;

    if(text.includes("logo")){
        rtm.sendMessage("https://drive.google.com/file/d/11FyuoLuVmtQ7TuStQ7eoOlEFu60_djm1/view?usp=sharing",
        message.channel);
    } else if(text.includes("help")){
        rtm.sendMessage("Type @ho_bot with either 'logo', 'irs'", message.channel);
    }
});