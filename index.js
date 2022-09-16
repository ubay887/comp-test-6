/*
    Masih Belajar hasil dari nyontek :v
    ref: https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
    ref: https://github.com/Noth3r/ETL-Comp-Test-6
*/

const fetch = require("node-fetch");
const fs = require("fs");
const cheerio = require("cheerio");

const getDataCalenderBetween = (customDate) =>
    new Promise((resolve, reject) => {
        fetch("https://tradingeconomics.com/calendar", {
            method: "GET",
            headers: {
                cookie: `cal-custom-range=${customDate} 00:00|${customDate} 23:59; cal-timezone-offset=420; TEServer=TEIIS3;`,
            },
        })
            .then((res) => res.text())
            .then((body) => {
                const $ = cheerio.load(body);
                const table = $("table#calendar tbody tr[data-url*='/']");
                const res = [];
                table.each((i, el) => {
                    const time = $(el).children("td:nth-child(1)").text();
                    const country = $(el).children("td:nth-child(2)").text();
                    const title = $(el).children("td:nth-child(3)").children("a").text();
                    const actual = $(el).children("td:nth-child(4)").text();
                    const previous = $(el).children("td:nth-child(5)").children("#previous").text();
                    const consensus = $(el).children("td:nth-child(6)").text();
                    const forecast = $(el).children("td:nth-child(7)").text();
                    const data = {
                        time: clear(time),
                        title: clear(title),
                        metaData: {
                            country: clear(country),
                            actual: clear(actual),
                            previous: clear(previous),
                            consensus: clear(consensus),
                            forecast: clear(forecast),
                        },
                    };
                    res.push(data);
                });
                resolve(res);
            })
            .catch((err) => reject(err));
    });

const clear = (str) => str.replace(/(\r\n|\n|\r)/gm, "").trim();

const getRangeDate = (start, end) => {
    const res = [];
    const dateStart = new Date(start);
    const dateEnd = new Date(end);
    while (dateStart <= dateEnd) {
        res.push(dateStart.toISOString().split("T")[0]);
        dateStart.setDate(dateStart.getDate() + 1);
    }
    return res;
};

(async () => {
    const startDate = "2022-09-01";
    const endDate = "2022-09-16";
    const dateArray = getRangeDate(startDate, endDate);
    const res = [];
    for (const date of dateArray) {
        console.log(date);
        const data = await getDataCalenderBetween(date);
        res.push({ [date]: [...data] });
    }
    fs.writeFileSync("data.json", JSON.stringify(res, null, 2));
})();
