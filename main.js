const filesystem = require('fs');
const querystring = require('querystring');
const fetch = require('node-fetch');


let start_date = new Date(2018, 4, 1, 12);
let end_date = new Date(2018, 4, 1, 13);


let wait_time = 4000;


function process_body(body, result_array)
{
    let n_trades = body.result["XETHZEUR"].length;
    console.log(`Successfully downloaded ${n_trades} transactions.`)
    body.result["XETHZEUR"].forEach(element => {
        result_array.price.push(element[0]);
        result_array.volume.push(element[1]);
        result_array.timestamp.push(new Date(1000 * element[2]).toISOString());
    });    
    console.log(`Waiting for ${wait_time} milliseconds until next request.`)
    return body.result.last;
}


function query_and_add(start_nanoseconds, end_nanoseconds, result_array, process_result, percentage)
{
    console.log(`${percentage(start_nanoseconds)}% complete.`);

    if (start_nanoseconds >= end_nanoseconds)
    {
        process_result(result_array);
        return;
    }

    let query = querystring.stringify(
        {
            pair: "ETHEUR",
            since: start_nanoseconds
        });

    let path = 'https://api.kraken.com/0/public/Trades?' + query
    console.log("sending GET request to: " + path);

    fetch(path)
        .then(res => res.json())
        .then(json => process_body(json, result_array))
        .then(last => setTimeout(() => {query_and_add(last, end_nanoseconds, result_array, process_result, percentage)}, wait_time));
}


function save_results(filename, results)
{
    let keys = Object.keys(results);

    let header = keys.join(", ");
    let length = results[keys[0]].length;
    let lines = [header];
    for(let i = 0; i < length; ++i)
    {
        let line = keys.map(it => results[it][i]).join(", ");
        lines.push(line);
    }
    let file_contents = lines.join('\n');

    filesystem.writeFile(filename, file_contents, function (err) 
    {
        if (err) 
        {
            return console.log(err);
        }
        console.log(`The file was saved to '${filename}!`);
    });
}


function compute_percentage(start_nanoseconds, end_nanoseconds)
{
    return function (current)
    {
        let percentage = 100 * (current - start_nanoseconds) / (end_nanoseconds - start_nanoseconds);
        return percentage.toFixed(2);
    };
}


function download_prices(start_date, end_date)
{
    console.log(`Pulling data from '${start_date}' until '${end_date}'.\n    ============`);

    let start_nanoseconds = start_date.getTime() * 1000000;
    let end_nanoseconds = end_date.getTime() * 1000000;

    let results = {price: [], volume: [], timestamp: []};
    let percentage = compute_percentage(start_nanoseconds, end_nanoseconds);
    query_and_add(start_nanoseconds, end_nanoseconds, results, it => {save_results("output.csv", it)}, percentage);
}


download_prices(start_date, end_date);