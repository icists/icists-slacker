const SlackBot = require('slackbots');
const axios = require('axios');

const bot = new SlackBot({
    token: 'xoxb-550778942626-580224021367-SoEAPXqDhGdxyIQGc83aNclA',
    name: 'ho_bot'
});

// Start Handler
bot.on('start', () => {
    const params = {
        icon_emoji: ':sunglasses:'
    }

    bot.postMessageToChannel(
        'general',
        'Work efficiently with @ho_bot!',
        params
    );
});

// Error Handler
bot.on('error', (err) => console.log(err));

// Message Handler
bot.on('message', (data) => {
    if(data.type !== 'message'){
        return;
    }
    handleMessage(data.text, data.channel);
})

// Respond to Data
function handleMessage(message, channel) {
    if (message.includes(' logo')) {
        logo(channel);
    } else if (message.includes(' help')) {
        runHelp();
    }
}

// Tell td
function td() {
    axios.get('http://api.icndb.com/jokes/random').then(res => {
        const joke = res.data.value.joke;

        const params = {
            icon_emoji: ':laughing:'
        }
    
        bot.postMessageToChannel(
            'general',
            `td : ${joke}`,
            params
        );
    })
}

// send logo
function logo(channel) {
    const params = {
        icon_emoji: ':laughing:'
    }

    bot.postMessageToChannel(
        channel,
        `https://drive.google.com/file/d/11FyuoLuVmtQ7TuStQ7eoOlEFu60_djm1/view?usp=sharing`,
        params
    );
}

// Show Help Text
function runHelp() {
    const params = {
        icon_emoji: ':rolling_on_the_floor_laughing:'
    }

    bot.postMessageToChannel(
        'general',
        `Type @ho_bot with either 'logo', 'irs'`,
        params
    );
}