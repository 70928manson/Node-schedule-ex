const schedule = require('node-schedule');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const csv = require('csv');
const moment = require('moment');

// 測試取得健保醫材
async function runTask() {
    const start = moment().unix();
    try {
        console.log("Info. schedule: Get NHI Code start.")
        const response = await axios.get(`https://www.nhi.gov.tw/ch/cp-2629-3c936-2528-1.html`);
        const $ = cheerio.load(response.data);

        const url = "https://www.nhi.gov.tw" + $(".downloadFiles").eq(5).find('a')[0].attribs.href;
        const filePath = await downloadFile(url, 'big5');
        const rawResult = [];
        fs.createReadStream(filePath)
            .pipe(csv.parse())
            .on("data", (data) => { rawResult.push(data) })
            .on("end", async () => {
                let startFlag = 0;
                const nhiMaterialArray = [];
                let count = 0;
                for (let item of rawResult) {
                    count++;
                    if (startFlag == 1) {
                        // 把新鮮的健保醫材資料組成想要的格式
                        const nhiMaterialItem = {};
                        if (item[0].length > 0) {
                            nhiMaterialItem.classCode = item[0].trim().replaceAll('\'', '');
                        }
                        if (item[1].length > 0) {
                            nhiMaterialItem.subclassCode = item[1].trim().replaceAll('\'', '');
                        }
                        if (item[2].length > 0) {
                            nhiMaterialItem.subclassCodeName = item[2].trim().replaceAll('\'', '');
                        }
                        if (item[3].length > 0) {
                            nhiMaterialItem.productCode = item[3].trim().replaceAll('\'', '');
                        }

                        if (item[7].length > 0) {
                            nhiMaterialItem.materialCode = item[7].trim().replaceAll('\'', '');
                        }
                        if (item[8].length > 0) {
                            nhiMaterialItem.nickName = item[8].trim().replaceAll('\'', '');
                        }
                        if (item[9].length > 0) {
                            nhiMaterialItem.nameCH = item[9].trim().replaceAll('\'', '');
                        }
                        if (item[10].length > 0) {
                            nhiMaterialItem.nameEN = item[10].trim().replaceAll('\'', '');
                        }

                        if (item[21].length > 0) {
                            nhiMaterialItem.tfdaLicense = item[21].trim().replaceAll('\'', '');
                        }

                        console.log(nhiMaterialItem);
                        nhiMaterialArray.push(nhiMaterialItem);
                    }
                    if (item[0] == '大類碼') {
                        startFlag = 1;
                    }
                }
                
                fs.unlink(filePath, function () {
                    //console.log('刪除暫存健保醫材資料');
                });
                console.log(`Get NHI Code done. Use ${moment().unix() - start} seconds.`);
                console.log(`Info. schedule: Get NHI Code done. Use ${moment().unix() - start} seconds.`)
            })
    } catch (error) {
        console.log(`Error. schedule: ${error.message}.`)
    }
}

async function downloadFile(url, charEncode) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });

    const filename = response.headers['content-disposition'].match(/filename=(.*)/)[1].replaceAll('"', '');

    const dest = path.join(filename);

    if (charEncode == 'big5') {
        const data = iconv.decode(response.data, 'big5')
        fs.writeFileSync(dest, data);
    } else {
        fs.writeFileSync(dest, response.data);
    }

    return dest;
};

exports.getNHImaterial = async function () {
    runTask();
    const rule = new schedule.RecurrenceRule();
    rule.hour = 21;
    rule.minute = 30;
    rule.second = 0;
    rule.tz = 'Asia/Taipei';
    schedule.scheduleJob(rule, runTask);
};