let currentDate = new Date();
let timeInterval = 2;
let midRateTab = [];
let ctx = document.getElementById("myChart").getContext('2d');
loadCurrencies();
let myChart;

function setTimeInterval(level) {
    timeInterval = level;
}

function timeButtonPressed(level) {
    setTimeInterval(level);
    loadCurrencies();
}

function setDailyCurrencyRate(value) {
    document.getElementById("daily-rate").textContent = value.toFixed(5);
}

async function loadCurrencies() {
    let currency = document.getElementById("currency").value;
    let conversion = document.getElementById("conversion").value;
    let firstCurrencyMidRateTab = await loadCurrency(currency);
    let secondCurrencyMidRateTab = await loadCurrency(conversion);
    midRateTab = [];
    for(let i = 0; i < firstCurrencyMidRateTab.length; i++) {
        midRateTab.push([firstCurrencyMidRateTab[i][0] / secondCurrencyMidRateTab[i][0], firstCurrencyMidRateTab[i][1]]);
    }
    setDailyCurrencyRate(midRateTab[midRateTab.length-1][0]);
    showPlot(midRateTab);
}

async function loadCurrency(currencyCode) {
    let url = createNbpApiRequestUrlForCurrencyValue(currencyCode);
    let midRateTab = [];
    try {
        let response = await fetch(url);
        let data = await response.json();

        data.rates.forEach(rate => {
            midRateTab.push([rate.mid, rate.effectiveDate]);
        })
        return midRateTab;
    }
    catch(error) {
        console.log("error", error);
    }
}

function createNbpApiRequestUrlForCurrencyValue(currencyCode) {
    let requestUrl = 'https://api.nbp.pl/api/exchangerates/rates/a/' + currencyCode;
    let startDate = new Date(currentDate);
    if(timeInterval == 1) {
        return requestUrl;
    }
    else {
        if(timeInterval == 2){
            startDate.setDate(startDate.getDate() - 7);
        }
        else if(timeInterval == 3) {
            startDate.setMonth(startDate.getMonth() - 1);
        }
        else if(timeInterval == 4) {
            startDate.setMonth(startDate.getMonth() - 3);
        }
        requestUrl = requestUrl + "/" + startDate.getFullYear() + "-" + (startDate.getMonth()+1).toString().padStart(2, '0') + "-" + startDate.getDate().toString().padStart(2, '0');
        requestUrl = requestUrl + "/" + currentDate.getFullYear() + "-" + (currentDate.getMonth()+1).toString().padStart(2, '0') + "-" + currentDate.getDate().toString().padStart(2, '0');
        return requestUrl;
    }
}

function showPlot(arguments) {
    if(myChart) {
        myChart.destroy();
    }
    ctx.canvas.width = 800;
    ctx.canvas.height = 200;
    let rates = arguments.map(a => a[0]);
    let dates = arguments.map(a => a[1]);
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Currencies',
                data: rates,
                borderColor: 'red',
                tension: 0,
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}
