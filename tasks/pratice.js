/**
 * The basic one
 */
// setInterval(() => {
//     console.log("Running a task every second.");
// }, 1000);

const schedule = require('node-schedule');

// const job = schedule.scheduleJob('* * * * * *', () => {
//     console.log("Running a task every second. ya~");
// });

// const job = schedule.scheduleJob('16 * * * * ', () => {
//     console.log("Running a task every min 16. ya~");
// });

// const job = schedule.scheduleJob('* * * * * *', function (fireDate) {
//     console.log(`This job was supposed to run at ${fireDate}, but actually at ${new Date()}`)
// });

// const date = new Date(2024, 8, 9, 20, 47, 0);
// const job = schedule.scheduleJob(date, () => {
//     console.log("Running at the specific date and time given.");
// });

/**
 * Specific Recurrance Rule Scheduling
 * Run every 18 minutes after hour
 */
// const rule = new schedule.RecurrenceRule();
// rule.minute = 18;

// const job = schedule.scheduleJob(rule, () => {
//     console.log("Running every 18th min after the hour.");
// });

// const job = schedule.scheduleJob({ hour: 1, minute: 30, dayOfWeek: 0 }, () => {
//     console.log("Dinner time!");
// });

/**
 * Set StartTime and Endtime
 * Run after 5 seconds and stop after 10 seconds
 */
// const startTime = new Date(Date.now() + 5000);
// const endTime = new Date(startTime.getTime() + 5000);

// const job = schedule.scheduleJob({
//     start: startTime,
//     end: endTime,
//     rule: '*/1 * * * * *'
// }, () => {
//     console.log("Time for dinner!");
// });

async function runTask() {
    const job = schedule.scheduleJob('* * * * * *', () => {
        console.log("Running a task every second.");
    });

    setInterval(() => {
        schedule.gracefulShutdown();
        console.log("Graceful shoutdown");
    }, 10000);
}

exports.run = async function () {
    runTask();
    const rule = new schedule.RecurrenceRule();
    rule.hour = 4;
    rule.minute = 0;
    rule.second = 0;
    rule.tz = 'Asia/Taipei';
    schedule.scheduleJob(rule, runTask);
};